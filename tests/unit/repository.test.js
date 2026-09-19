import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { LeitnerRepository } from '../../src/server/database/repository.js';
import { decodeImport, emptyState, defaultPreferences } from '../../src/shared/validation.js';

const card = (id = 'fixture-one') => ({
    id,
    word: 'resilient',
    meaning: 'تاب‌آور',
    category: 'Personal',
    box: 3,
    reviewCount: 7,
    lastReviewed: '2026-08-31T10:00:00.000Z',
    createdAt: '2026-06-01T00:00:00Z',
    notes: 'یادداشت',
    extraField: { preserve: true },
});
function setup(t) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-unit-'));
    const repository = new LeitnerRepository(directory);
    t.after(() => repository.close());
    return repository;
}
const write = (r, state, options = {}) =>
    r.commit({
        state,
        preferences: defaultPreferences(),
        expectedRevision: r.read().revision,
        operationId: randomUUID(),
        ...options,
    });

test('migration preserves every card field, history, extra metadata and preferences across reopen', (t) => {
    const r = setup(t);
    const state = { ...emptyState(), cards: [card()], extraMetadata: 'unchanged', updatedAt: '2026-08-31T00:00:00Z' };
    state.stats = {
        totalReviews: 71,
        correctAnswers: 65,
        wrongAnswers: 6,
        streak: 5,
        lastReviewDate: 'Mon Aug 31 2026',
        history: [{ date: '2026-08-31T00:00:00Z', correct: 4, wrong: 1, total: 5, box: 3, category: 'Personal' }],
    };
    const payload = {
        format: 'leitner-migration-v1',
        legacy: {
            leitner_data: JSON.stringify(state),
            leitner_theme: 'light',
            leitner_review_mode: 'combined',
            leitner_combined_review_batch_size: '4',
            leitner_data_backup_old: 'preserve this too',
        },
    };
    r.migrate(payload, 0, randomUUID());
    const reopened = new LeitnerRepository(r.dataDir);
    try {
        assert.deepEqual(reopened.read().state, state);
        assert.deepEqual(reopened.read().preferences, { theme: 'light', reviewMode: 'combined', combinedBatchSize: 4 });
        assert.deepEqual(
            JSON.parse(reopened.db.prepare('SELECT payload FROM migration_archive').get().payload),
            payload
        );
        assert.equal(reopened.db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    } finally {
        reopened.close();
    }
});

test('a stale window cannot overwrite a newer revision', (t) => {
    const r = setup(t),
        state = { ...emptyState(), cards: [card()] };
    write(r, state);
    const before = r.read();
    assert.throws(() => write(r, emptyState(), { expectedRevision: 0, allowCardRemoval: true }), {
        code: 'REVISION_CONFLICT',
    });
    assert.deepEqual(r.read(), before);
});

test('replaying an acknowledged write is idempotent; changing the payload with same ID is rejected', (t) => {
    const r = setup(t),
        state = { ...emptyState(), cards: [card()] };
    const request = { state, preferences: defaultPreferences(), expectedRevision: 0, operationId: randomUUID() };
    assert.equal(r.commit(request).revision, 1);
    assert.deepEqual(r.commit(request), { revision: 1, replayed: true });
    assert.equal(r.read().state.cards[0].reviewCount, 7);
    assert.throws(() => r.commit({ ...request, state: emptyState() }), { code: 'OPERATION_MISMATCH' });
});

test('unapproved deletion and invalid imports leave the database unchanged', (t) => {
    const r = setup(t);
    write(r, { ...emptyState(), cards: [card()] });
    const before = r.read();
    assert.throws(() => write(r, emptyState()), { code: 'REMOVAL_NOT_ALLOWED' });
    assert.throws(() => write(r, { ...emptyState(), cards: [card(), card()] }), { code: 'INVALID_DATA' });
    assert.throws(() => write(r, { ...emptyState(), cards: [{ ...card(), box: 8 }] }), { code: 'INVALID_DATA' });
    assert.throws(() => r.migrate({ cards: 'invalid' }, 1, randomUUID(), true), { code: 'INVALID_DATA' });
    assert.deepEqual(r.read(), before);
});

test('SQL failure midway through a batch rolls back cards, metadata and revision together', (t) => {
    const r = setup(t);
    write(r, { ...emptyState(), cards: [card('one'), card('two')] });
    const before = r.read();
    r.db.exec(
        "CREATE TRIGGER reject_second BEFORE UPDATE ON cards WHEN NEW.id = 'two' BEGIN SELECT RAISE(ABORT, 'injected write failure'); END"
    );
    const changed = structuredClone(before.state);
    changed.cards.forEach((c) => c.box++);
    changed.stats.correctAnswers++;
    assert.throws(() => write(r, changed), /injected write failure/);
    assert.deepEqual(r.read(), before);
});

test('backup failure prevents destructive writes; successful restore keeps a previous snapshot', (t) => {
    const r = setup(t);
    write(r, { ...emptyState(), cards: [card()] });
    const before = r.read(),
        originalWrite = r.backups.write.bind(r.backups);
    r.backups.write = () => {
        throw new Error('injected disk-full failure');
    };
    assert.throws(() => write(r, emptyState(), { allowCardRemoval: true }), /disk-full/);
    assert.deepEqual(r.read(), before);
    r.backups.write = originalWrite;
    const backupName = r.createBackup();
    write(r, emptyState(), { allowCardRemoval: true });
    r.migrate(JSON.parse(r.backups.read(backupName)), r.read().revision, randomUUID(), true);
    assert.deepEqual(r.read().state, before.state);
    assert.ok(r.backups.list().some((b) => b.name.includes('before-restore')));
    const raw = JSON.parse(r.backups.read(backupName));
    raw.state.cards[0].word = 'tampered';
    assert.throws(() => r.migrate(raw, r.read().revision, randomUUID(), true), { code: 'BACKUP_CORRUPT' });
});

test('online SQLite backup is independently readable', async (t) => {
    const r = setup(t);
    write(r, { ...emptyState(), cards: [card()] });
    const filename = await r.databaseBackup();
    const db = new DatabaseSync(filename, { readOnly: true });
    try {
        assert.equal(db.prepare('SELECT count(*) AS n FROM cards').get().n, 1);
        assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
    } finally {
        db.close();
    }
});

test('startup never replaces a pristine database with a backup automatically', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-no-auto-recovery-'));
    const first = new LeitnerRepository(directory);
    const saved = { ...emptyState(), cards: [card('saved')] };
    write(first, saved);
    first.createBackup();
    first.close();

    for (const suffix of ['', '-shm', '-wal'])
        fs.rmSync(path.join(directory, `leitner.sqlite${suffix}`), { force: true });
    const pristine = new LeitnerRepository(directory);
    try {
        assert.equal(pristine.read().initialized, false);
        assert.equal(pristine.read().state.cards.length, 0);
    } finally {
        pristine.close();
    }
});

test('adding one card does not rewrite unchanged card rows or create timed backups', (t) => {
    const r = setup(t);
    const first = { ...emptyState(), cards: [card('unchanged')] };
    write(r, first);
    const backupsBefore = r.backups.list().length;
    r.db.exec(
        "CREATE TRIGGER reject_unchanged_update BEFORE UPDATE ON cards WHEN OLD.id = 'unchanged' BEGIN SELECT RAISE(ABORT, 'unchanged row was rewritten'); END"
    );
    const next = structuredClone(first);
    next.cards.push({ ...card('new-card'), word: 'new card' });
    write(r, next);
    assert.deepEqual(r.read().state, next);
    assert.equal(r.backups.list().length, backupsBefore);
});

test('old plain exports remain importable, invalid dates and preferences do not', () => {
    assert.deepEqual(decodeImport({ cards: [card()] }).state.cards, [card()]);
    assert.throws(() => decodeImport({ cards: [{ ...card(), lastReviewed: 'bad-date' }] }), { code: 'INVALID_DATA' });
    assert.throws(
        () =>
            decodeImport({
                format: 'leitner-backup-v2',
                state: emptyState(),
                preferences: { ...defaultPreferences(), combinedBatchSize: 0 },
            }),
        { code: 'INVALID_DATA' }
    );
});

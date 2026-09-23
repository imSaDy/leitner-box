import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, backup } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { migrateDatabase } from './migrations.js';
import { BackupStore, checksum } from './backups.js';
import { AppError } from '../errors.js';
import {
    emptyState,
    defaultPreferences,
    validateState,
    validatePreferences,
    decodeImport,
} from '../../shared/validation.js';

export class LeitnerRepository {
    constructor(dataDir) {
        fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
        this.dataDir = dataDir;
        this.filename = path.join(dataDir, 'leitner.sqlite');
        this.db = new DatabaseSync(this.filename, { timeout: 5000 });
        this.backups = new BackupStore(path.join(dataDir, 'backups'));
        try {
            // A single-user desktop app does not need WAL's concurrent readers.
            // A rollback journal avoids a persistent WAL/main-file pair that can
            // be separated by a file copy or interrupted repair.
            this.assertIntegrity(this.db);
            const mode = this.db.prepare('PRAGMA journal_mode').get().journal_mode;
            if (mode !== 'delete') {
                const schemaVersion = Number(this.db.prepare('PRAGMA user_version').get().user_version);
                if (schemaVersion > 0) {
                    const before = this.read();
                    if (before.initialized) this.backups.write(before, 'before-journal-change');
                }
                const changed = this.db.prepare('PRAGMA journal_mode = DELETE').get().journal_mode;
                if (changed !== 'delete') throw new Error(`Could not switch SQLite journal mode: ${changed}`);
            }
            this.db.exec('PRAGMA synchronous = EXTRA; PRAGMA foreign_keys = ON; PRAGMA trusted_schema = OFF;');
            this.assertIntegrity(this.db);
            migrateDatabase(this.db);
            const { cards: _cards, ...metadata } = emptyState();
            this.db
                .prepare('INSERT OR IGNORE INTO app_state(id, payload, preferences) VALUES(1, ?, ?)')
                .run(JSON.stringify(metadata), JSON.stringify(defaultPreferences()));
        } catch (error) {
            this.db.close();
            throw error;
        }
    }
    read() {
        // Keep metadata and cards in the same SQLite snapshot, including when
        // another local process (e.g. the backup CLI) is connected.
        const ownsTransaction = !this.db.isTransaction;
        if (ownsTransaction) this.db.exec('BEGIN');
        try {
            const row = this.db.prepare('SELECT * FROM app_state WHERE id = 1').get();
            const metadata = JSON.parse(row.payload);
            const snapshot = {
                revision: row.revision,
                initialized: Boolean(row.initialized),
                state: {
                    ...metadata,
                    cards: this.db
                        .prepare('SELECT payload FROM cards ORDER BY position')
                        .all()
                        .map((card) => JSON.parse(card.payload)),
                },
                preferences: JSON.parse(row.preferences),
            };
            if (ownsTransaction) this.db.exec('COMMIT');
            return snapshot;
        } catch (error) {
            if (ownsTransaction && this.db.isTransaction) this.db.exec('ROLLBACK');
            throw error;
        }
    }
    operation(id) {
        return this.db.prepare('SELECT revision, request_hash FROM operations WHERE id = ?').get(id) || null;
    }

    assertIntegrity(database) {
        let result;
        try {
            result = database.prepare('PRAGMA integrity_check').get()?.integrity_check;
        } catch (error) {
            if (error.code !== 'ERR_SQLITE_ERROR' || ![11, 26].includes(error.errcode & 255)) throw error;
            result = error.message;
        }
        if (result !== 'ok')
            throw new AppError(
                'DATABASE_CORRUPT',
                'پایگاه داده سالم نیست. از نسخهٔ پشتیبان برای بازیابی استفاده کنید.',
                503
            );
    }

    assertCurrentDatabase({ verifyIntegrity = true } = {}) {
        // A database file can be replaced while this process still holds the old
        // SQLite connection. Compare with a fresh connection before accepting a
        // write or reporting the service healthy.
        const disk = new DatabaseSync(this.filename, { readOnly: true });
        try {
            if (verifyIntegrity) {
                this.assertIntegrity(disk);
                this.assertIntegrity(this.db);
            }
            const diskRevision = disk.prepare('SELECT revision FROM app_state WHERE id = 1').get()?.revision;
            const connectionRevision = this.db.prepare('SELECT revision FROM app_state WHERE id = 1').get()?.revision;
            if (diskRevision !== connectionRevision)
                throw new AppError(
                    'DATABASE_CHANGED',
                    'اتصال پایگاه داده قدیمی است. اطلاعات در انتظار را دریافت کنید و برنامه را دوباره اجرا کنید.',
                    409
                );
        } finally {
            disk.close();
        }
    }

    commit({
        state,
        preferences,
        expectedRevision,
        operationId,
        allowCardRemoval = false,
        reason = 'save',
        archive = null,
    }) {
        validateState(state);
        validatePreferences(preferences);
        if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
            throw new AppError('INVALID_REVISION', 'نسخهٔ داده معتبر نیست.');
        if (typeof operationId !== 'string' || !/^[a-zA-Z0-9_-]{12,100}$/.test(operationId))
            throw new AppError('INVALID_OPERATION', 'شناسهٔ ذخیره معتبر نیست.');
        const requestHash = checksum({
            state,
            preferences,
            expectedRevision,
            allowCardRemoval,
            reason,
            archive,
        });
        this.assertCurrentDatabase();
        this.db.exec('BEGIN IMMEDIATE');
        try {
            const existing = this.operation(operationId);
            if (existing) {
                if (existing.request_hash !== requestHash)
                    throw new AppError(
                        'OPERATION_MISMATCH',
                        'شناسهٔ ذخیره قبلاً برای دادهٔ دیگری استفاده شده است.',
                        409
                    );
                this.db.exec('ROLLBACK');
                return { revision: existing.revision, replayed: true };
            }
            const current = this.read();
            if (current.revision !== expectedRevision)
                throw new AppError(
                    'REVISION_CONFLICT',
                    'اطلاعات در پنجرهٔ دیگری تغییر کرده است. برای ادامه، نسخهٔ جدید را بارگذاری کنید.',
                    409
                );
            const nextIds = new Set(state.cards.map((card) => card.id));
            const removed = current.state.cards.filter((card) => !nextIds.has(card.id));
            if (removed.length && !allowCardRemoval)
                throw new AppError('REMOVAL_NOT_ALLOWED', 'ذخیره شامل حذف تأییدنشدهٔ کارت است.', 409);
            if (current.initialized && (removed.length || reason === 'restore' || reason === 'migration')) {
                this.backups.write(
                    current,
                    reason === 'restore'
                        ? 'before-restore'
                        : reason === 'migration'
                          ? 'before-migration'
                          : 'before-deletion'
                );
            }
            if (archive)
                this.db
                    .prepare(
                        'INSERT OR IGNORE INTO migration_archive(checksum, imported_at, card_count, payload) VALUES (?, ?, ?, ?)'
                    )
                    .run(checksum(archive), new Date().toISOString(), state.cards.length, JSON.stringify(archive));
            const { cards, ...metadata } = state;
            const upsert = this.db.prepare(
                'INSERT INTO cards(id, position, box, category, payload) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET position=excluded.position, box=excluded.box, category=excluded.category, payload=excluded.payload'
            );
            const previousCards = new Map(
                current.state.cards.map((card, index) => [card.id, { index, payload: JSON.stringify(card) }])
            );
            cards.forEach((card, index) => {
                const payload = JSON.stringify(card);
                const previous = previousCards.get(card.id);
                if (!previous || previous.index !== index || previous.payload !== payload)
                    upsert.run(card.id, index, card.box, card.category, payload);
            });
            const remove = this.db.prepare('DELETE FROM cards WHERE id = ?');
            removed.forEach((card) => remove.run(card.id));
            const revision = current.revision + 1;
            this.db
                .prepare(
                    'UPDATE app_state SET revision = ?, initialized = 1, payload = ?, preferences = ? WHERE id = 1'
                )
                .run(revision, JSON.stringify(metadata), JSON.stringify(preferences));
            this.db
                .prepare('INSERT INTO operations(id, request_hash, revision, created_at) VALUES (?, ?, ?, ?)')
                .run(operationId, requestHash, revision, new Date().toISOString());
            this.db.exec('COMMIT');
            return { revision, replayed: false };
        } catch (error) {
            if (this.db.isTransaction) this.db.exec('ROLLBACK');
            throw error;
        }
    }

    migrate(payload, expectedRevision, operationId, restore = false) {
        if (
            payload.format === 'leitner-backup-v2' &&
            payload.checksum &&
            payload.checksum !== checksum({ state: payload.state, preferences: payload.preferences })
        )
            throw new AppError('BACKUP_CORRUPT', 'صحت فایل پشتیبان تأیید نشد.', 422);
        const decoded = decodeImport(payload);
        const current = this.read();
        if (current.initialized && !restore && !this.operation(operationId))
            throw new AppError(
                'ALREADY_INITIALIZED',
                'پایگاه داده از قبل اطلاعات دارد. از افزودن کارت‌ها یا بازیابی تأییدشده استفاده کنید.',
                409
            );
        // Archive the exact incoming snapshot independently before changing the DB.
        if (!this.operation(operationId))
            this.backups.write(
                { state: decoded.state, preferences: decoded.preferences, revision: expectedRevision },
                restore ? 'restore-source' : 'migration-source'
            );
        return this.commit({
            ...decoded,
            expectedRevision,
            operationId,
            allowCardRemoval: restore,
            reason: restore ? 'restore' : 'migration',
            archive: payload,
        });
    }
    createBackup() {
        this.assertCurrentDatabase();
        return this.backups.write(this.read(), 'manual');
    }
    async databaseBackup() {
        this.assertCurrentDatabase();
        const target = path.join(
            this.dataDir,
            `leitner_${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}.sqlite`
        );
        await backup(this.db, target);
        return target;
    }
    close() {
        this.db.close();
    }
}

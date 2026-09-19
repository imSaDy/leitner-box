import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { LeitnerRepository } from '../../src/server/database/repository.js';
import { createApplicationServer } from '../../src/server/http.js';
import { emptyState, defaultPreferences } from '../../src/shared/validation.js';

test('local API authentication, migration, export, restore and private-file boundaries', async (t) => {
    const r = new LeitnerRepository(fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-http-')));
    const server = createApplicationServer(r, { maxBodyBytes: 4096 });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    t.after(async () => {
        await new Promise((resolve) => server.close(resolve));
        r.close();
    });
    const origin = `http://127.0.0.1:${server.address().port}`;
    const token = (await (await fetch(origin + '/api/session')).json()).token;
    const headers = { 'x-leitner-token': token, 'content-type': 'application/json' };
    assert.equal((await fetch(origin + '/api/state')).status, 403);
    assert.equal((await fetch(origin + '/api/session', { headers: { Origin: 'https://example.com' } })).status, 403);
    assert.equal((await fetch(origin + '/api/state', { headers: { ...headers, Origin: 'null' } })).status, 403);
    const payload = { format: 'leitner-backup-v2', state: emptyState(), preferences: defaultPreferences() };
    const request = { payload, expectedRevision: 0, operationId: randomUUID() };
    const migrate = () => fetch(origin + '/api/migrate', { method: 'POST', headers, body: JSON.stringify(request) });
    assert.equal((await migrate()).status, 200);
    assert.equal((await (await migrate()).json()).replayed, true);
    assert.equal((await (await fetch(origin + '/api/state', { headers })).json()).initialized, true);
    assert.equal((await fetch(origin + '/api/backups', { method: 'POST', headers, body: '{}' })).status, 201);
    const list = await (await fetch(origin + '/api/backups', { headers })).json();
    assert.ok(list.backups.length >= 2);
    const backup = await (await fetch(origin + '/api/backups/' + list.backups[0].name, { headers })).json();
    assert.deepEqual(backup.state, emptyState());
    const exported = await (await fetch(origin + '/api/export', { headers })).json();
    assert.deepEqual(exported.preferences, defaultPreferences());
    for (const pathname of [
        '/src/server/config.js',
        '/src/client/%2e%2e%2fserver/config.js',
        '/src/shared/%2e%2e%2fserver/config.js',
        '/package.json',
        '/backups/test.json',
        '/.env',
    ])
        assert.equal((await fetch(origin + pathname)).status, 404, pathname);
    assert.equal((await fetch(origin + '/api/state', { method: 'PUT', headers, body: '{' })).status, 400);
    assert.equal(
        (await fetch(origin + '/api/state', { method: 'PUT', headers, body: JSON.stringify({ x: 'x'.repeat(5000) }) }))
            .status,
        413
    );
    const page = await fetch(origin);
    assert.equal(page.status, 200);
    assert.ok(page.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
});

/* Synthetic data, disposable browser profiles and isolated temporary databases. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { randomUUID } = require('node:crypto');
const { chromium } = require('@playwright/test');
let checks = 0;
const check = (value, message) => {
    assert.ok(value, message);
    checks++;
};

(async () => {
    const { LeitnerRepository } = await import('../../src/server/database/repository.js');
    const { createApplicationServer } = await import('../../src/server/http.js');
    const { emptyState, defaultPreferences } = await import('../../src/shared/validation.js');
    const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
    const errors = [];
    const resources = [];
    const initial = () => ({
        ...emptyState(),
        cards: [
            {
                id: 'personal-algorithm',
                word: 'algorithm',
                meaning: 'الگوریتم',
                category: 'Abstract Concepts',
                box: 3,
                lastReviewed: null,
                reviewCount: 7,
                createdAt: '2026-06-01T00:00:00Z',
                notes: 'Never remove or normalize this migrated card.',
            },
        ],
    });
    async function open(seed = true) {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-storage-ui-'));
        const repository = new LeitnerRepository(directory);
        if (seed)
            repository.commit({
                state: initial(),
                preferences: { ...defaultPreferences(), language: 'fa' },
                expectedRevision: 0,
                operationId: randomUUID(),
            });
        const server = createApplicationServer(repository, { maxBodyBytes: 64 * 1024 * 1024 });
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
        const origin = `http://127.0.0.1:${server.address().port}`;
        const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
        await context.route('https://**/*', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
        await context.addInitScript(() => {
            window.Audio = class {
                addEventListener() {}
                pause() {}
                play() {
                    return Promise.resolve();
                }
            };
        });
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('dialog', (dialog) => dialog.accept());
        page.setDefaultTimeout(10000);
        resources.push({ context, server, repository });
        await page.goto(origin);
        if (seed) await ready(page);
        return { page, repository, origin };
    }
    async function ready(page) {
        await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
        await page.locator('#persistenceOverlay').waitFor({ state: 'hidden' });
    }
    async function review(page) {
        await page.locator('#reviewBox3').click();
        await page.locator('#reviewCard').click();
    }
    async function add(page, word) {
        await page.locator('#btnAddCard').click();
        await page.locator('#inputWord').fill(word);
        await page.locator('#inputMeaning').fill('معنی آزمایشی');
        await page.locator('#btnSaveCard').click();
    }
    try {
        const migration = await open(false);
        check(await migration.page.locator('#storageSetup').isVisible(), 'empty database requires explicit setup');
        check(migration.repository.read().state.cards.length === 0, 'no automatic seed');
        await migration.page.locator('#setupImportFile').setInputFiles({
            name: 'invalid.json',
            mimeType: 'application/json',
            buffer: Buffer.from('{"cards":"invalid"}'),
        });
        await migration.page.locator('#setupError').filter({ hasText: 'list of cards' }).waitFor();
        check(!migration.repository.read().initialized, 'invalid migration does not initialize database');
        const sourceState = initial();
        sourceState.stats.history = [
            { date: '2026-08-01T00:00:00Z', correct: 8, wrong: 2, total: 10, box: 3, category: 'Personal' },
        ];
        const payload = {
            format: 'leitner-migration-v1',
            legacy: {
                leitner_data: JSON.stringify(sourceState),
                leitner_theme: 'light',
                leitner_review_mode: 'combined',
                leitner_combined_review_batch_size: '4',
            },
        };
        await migration.page.locator('#setupImportFile').setInputFiles({
            name: 'migration.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(payload)),
        });
        await migration.page.locator('#btnSetupImport').click();
        await ready(migration.page);
        assert.deepEqual(migration.repository.read().state, sourceState);
        checks++;
        check((await migration.page.locator('html').getAttribute('data-theme')) === 'light', 'migration retains theme');
        check((await migration.page.locator('html').getAttribute('lang')) === 'fa', 'legacy migration retains Persian');
        check(
            (await migration.page.locator('#combinedBatchSizeInput').inputValue()) === '4',
            'migration retains batch size'
        );
        await migration.page.reload();
        await ready(migration.page);
        assert.deepEqual(migration.repository.read().state, sourceState);
        checks++;
        check(
            (await migration.page.locator('.card-row').count()) === 1,
            'legacy cleanup does not delete migrated manual card'
        );

        console.log('PASS: migration preserves original state and settings.');
        const lostAck = await open();
        let requests = 0;
        await lostAck.page.route('**/api/state', async (route) => {
            if (route.request().method() !== 'PUT') return route.continue();
            requests++;
            if (requests === 1) {
                await route.fetch();
                await route.abort('failed');
            } else await route.continue();
        });
        await review(lostAck.page);
        await lostAck.page.locator('#btnCorrect').click();
        await lostAck.page.locator('#reviewComplete').waitFor({ state: 'visible' });
        check(requests === 2, 'lost acknowledgement retries the same operation');
        check(lostAck.repository.read().revision === 2, 'answer and completion history committed once');
        check(
            lostAck.repository.read().state.cards[0].reviewCount === 8,
            'lost acknowledgement does not count answer twice'
        );
        check(lostAck.repository.read().state.stats.history.length === 1, 'one completion record');

        console.log('PASS: lost acknowledgement is idempotent.');
        const offline = await open();
        await offline.page.route('**/api/state', (route) =>
            route.request().method() === 'PUT' ? route.abort('failed') : route.continue()
        );
        await review(offline.page);
        await offline.page.locator('#btnWrong').click();
        await offline.page.locator('#btnRetryStorage').waitFor({ state: 'visible' });
        check(offline.repository.read().revision === 1, 'unreachable save does not change database');
        check(
            await offline.page.locator('#reviewComplete').isHidden(),
            'review cannot advance without acknowledgement'
        );
        const emergencyDownload = offline.page.waitForEvent('download');
        await offline.page.locator('#btnEmergencyExport').click();
        const pendingFile = JSON.parse(fs.readFileSync(await (await emergencyDownload).path(), 'utf8'));
        check(pendingFile.state.cards[0].box === 1, 'pending changes can be exported during an outage');
        await offline.page.unroute('**/api/state');
        await offline.page.locator('#btnRetryStorage').click();
        await offline.page.locator('#reviewComplete').waitFor({ state: 'visible' });
        check(
            offline.repository.read().state.cards[0].box === 1 && offline.repository.read().revision === 2,
            'manual retry commits exactly once'
        );

        console.log('PASS: outage export and manual retry.');
        const reconnect = await open();
        await reconnect.page.route('**/api/state', (route) =>
            route.request().method() === 'PUT' ? route.abort('failed') : route.continue()
        );
        await review(reconnect.page);
        await reconnect.page.locator('#btnWrong').click();
        await reconnect.page.locator('#btnRetryStorage').waitFor({ state: 'visible' });
        await reconnect.page.unroute('**/api/state');
        await reconnect.page.locator('#reviewComplete').waitFor({ state: 'visible', timeout: 5000 });
        check(
            reconnect.repository.read().state.cards[0].box === 1 && reconnect.repository.read().revision === 2,
            'automatic reconnect commits the pending operation exactly once'
        );

        console.log('PASS: automatic reconnect after a temporary outage.');
        const corrupt = await open();
        let corruptRequests = 0;
        await corrupt.page.route('**/api/state', (route) => {
            if (route.request().method() !== 'PUT') return route.continue();
            corruptRequests++;
            return route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'DATABASE_CORRUPT',
                    message: 'The database could not save.',
                }),
            });
        });
        await review(corrupt.page);
        await corrupt.page.locator('#btnCorrect').click();
        await corrupt.page.locator('#btnEmergencyExport').waitFor({ state: 'visible' });
        check(await corrupt.page.locator('#btnReloadStorage').isVisible(), 'storage failure offers reload after export');
        check(await corrupt.page.locator('#btnRetryStorage').isHidden(), 'storage failure does not offer an inactive retry button');
        check(corruptRequests === 1, 'corrupt database failure does not retry indefinitely');
        check(corrupt.repository.read().revision === 1, 'corrupt database response does not advance review');
        const corruptDownload = corrupt.page.waitForEvent('download');
        await corrupt.page.locator('#btnEmergencyExport').click();
        const corruptDraft = JSON.parse(fs.readFileSync(await (await corruptDownload).path(), 'utf8'));
        check(corruptDraft.state.cards[0].reviewCount === 8, 'failed review answer remains exportable');
        console.log('PASS: corrupt database keeps pending review answer exportable.');
        const serverFailure = await open();
        let serverFailureRequests = 0;
        await serverFailure.page.route('**/api/state', (route) => {
            if (route.request().method() !== 'PUT') return route.continue();
            serverFailureRequests++;
            return route.fulfill({ status: 500, contentType: 'text/plain', body: 'unreadable server response' });
        });
        await review(serverFailure.page);
        await serverFailure.page.locator('#btnCorrect').click();
        await serverFailure.page.locator('#btnEmergencyExport').waitFor({ state: 'visible' });
        check(serverFailureRequests === 1, 'unreadable 500 response stops retries and preserves the draft');
        check(serverFailure.repository.read().revision === 1, 'failed server response leaves review uncommitted');
        const conflict = await open();
        const newer = initial();
        newer.cards[0].notes = 'Edited in another window';
        conflict.repository.commit({
            state: newer,
            preferences: { ...defaultPreferences(), language: 'fa' },
            expectedRevision: 1,
            operationId: randomUUID(),
        });
        await add(conflict.page, 'stale card');
        await conflict.page.locator('#btnReloadStorage').waitFor({ state: 'visible' });
        assert.deepEqual(conflict.repository.read().state, newer);
        checks++;
        await conflict.page.locator('#btnReloadStorage').click();
        await ready(conflict.page);
        check((await conflict.page.locator('#totalCards').textContent()) === '1', 'stale window reloads newer data');

        console.log('PASS: stale window conflict.');
        const rejected = await open();
        await rejected.page.route('**/api/state', (route) =>
            route.request().method() === 'PUT'
                ? route.fulfill({
                      status: 422,
                      contentType: 'application/json',
                      body: JSON.stringify({ error: 'INVALID_DATA', message: 'Injected validation rejection' }),
                  })
                : route.continue()
        );
        await add(rejected.page, 'retry me');
        await rejected.page.locator('.toast-error').filter({ hasText: 'Injected' }).waitFor();
        check(rejected.repository.read().state.cards.length === 1, 'rejected edit leaves acknowledged data intact');
        check(
            (await rejected.page.locator('#inputWord').inputValue()) === 'retry me',
            'form draft retained after failed save'
        );
        await rejected.page.unroute('**/api/state');
        await rejected.page.locator('#btnSaveCard').click();
        await rejected.page.waitForFunction(() => document.getElementById('inputWord').value === '');
        check(rejected.repository.read().state.cards.length === 2, 'retry does not duplicate the rejected card');

        console.log('PASS: rejected form retains draft.');
        const deletion = await open();
        await review(deletion.page);
        await deletion.page.locator('#btnDeleteDuringReview').click();
        await deletion.page.locator('#reviewComplete').waitFor({ state: 'visible' });
        check(deletion.repository.read().state.cards.length === 0, 'delete during review persists removal');
        check(
            deletion.repository.read().revision === 2 && deletion.repository.read().state.stats.history.length === 1,
            'last-card deletion and history are atomic'
        );

        await migration.page.locator('#btnBackups').click();
        await migration.page.locator('#btnCreateBackup').click();
        await migration.page.waitForFunction(() => !document.getElementById('btnCreateBackup').disabled);
        check((await migration.page.locator('.backup-item').count()) >= 2, 'backups visible in app');
        const downloadPromise = migration.page.waitForEvent('download');
        await migration.page.locator('.backup-item').first().click();
        const backup = JSON.parse(fs.readFileSync(await (await downloadPromise).path(), 'utf8'));
        assert.deepEqual(backup.state, sourceState);
        checks++;
        await migration.page.locator('#restoreFile').setInputFiles({
            name: 'restore.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(backup)),
        });
        await migration.page.waitForFunction(
            () => !document.getElementById('backupModal').classList.contains('active')
        );
        await ready(migration.page);
        assert.deepEqual(migration.repository.read().state, sourceState);
        checks++;

        const setup = await open(false);
        const artifacts = path.resolve(__dirname, '../artifacts');
        fs.mkdirSync(artifacts, { recursive: true });
        await setup.page.screenshot({ path: path.join(artifacts, 'database-setup.png') });
        await setup.page.setViewportSize({ width: 390, height: 844 });
        const setupMobileLayout = await setup.page.evaluate(() => ({
            innerWidth,
            documentWidth: document.documentElement.scrollWidth,
            bodyWidth: document.body.scrollWidth,
            overflow: [...document.querySelectorAll('body *')]
                .map((element) => {
                    const rect = element.getBoundingClientRect();
                    return { tag: element.tagName, id: element.id, className: element.className, left: rect.left, right: rect.right };
                })
                .filter(({ left, right }) => left < -0.5 || right > innerWidth + 0.5)
                .slice(0, 12),
        }));
        if (setupMobileLayout.documentWidth > setupMobileLayout.innerWidth)
            console.log('Mobile setup overflow details:', setupMobileLayout);
        check(
            setupMobileLayout.documentWidth <= setupMobileLayout.innerWidth,
            'migration screen fits mobile'
        );
        await setup.page.screenshot({ path: path.join(artifacts, 'database-setup-mobile.png') });
        await migration.page.screenshot({ path: path.join(artifacts, 'database-desktop.png') });
        check(
            await migration.page
                .locator('.logo-icon img')
                .evaluate((image) => image.complete && image.naturalWidth > 0),
            'app logo is served from the public asset directory'
        );
        await setup.page.locator('.storage-options summary').click();
        await setup.page.locator('#btnSetupSamples').click();
        await ready(setup.page);
        check(setup.repository.read().state.cards.length > 0, 'explicit sample choice creates a usable library');
        const emptyLibrary = await open(false);
        await emptyLibrary.page.locator('.storage-options summary').click();
        await emptyLibrary.page.locator('#btnSetupEmpty').click();
        await ready(emptyLibrary.page);
        check(
            emptyLibrary.repository.read().initialized && emptyLibrary.repository.read().state.cards.length === 0,
            'explicit empty choice stays empty'
        );
        assert.deepEqual(errors, []);
        checks++;
        console.log(
            `PASS: ${checks} storage UI checks: migration, no cleanup, lost acknowledgement, outage/retry, automatic reconnect, conflict, rejected edit, atomic deletion, backup and restore.`
        );
    } catch (error) {
        console.error('Storage UI failure:', error);
        throw error;
    } finally {
        for (const resource of resources) await resource.context.request.dispose();
        await Promise.all(resources.map((resource) => resource.context.close()));
        for (const resource of resources) {
            resource.server.closeAllConnections();
            await new Promise((resolve) => resource.server.close(resolve));
            resource.repository.close();
        }
        await Promise.race([browser.close().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 3000))]);
    }
})()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

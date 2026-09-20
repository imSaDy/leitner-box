const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('@playwright/test');

(async () => {
    const { LeitnerRepository } = await import('../../src/server/database/repository.js');
    const { createApplicationServer } = await import('../../src/server/http.js');
    const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
    try {
        for (const [language, samples] of [
            ['en', false],
            ['en', true],
            ['fa', false],
        ]) {
            const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-setup-'));
            const repository = new LeitnerRepository(directory);
            const server = createApplicationServer(repository, { maxBodyBytes: 64 * 1024 * 1024 });
            await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
            const context = await browser.newContext();
            await context.route('https://**/*', (route) =>
                route.fulfill({ contentType: 'application/json', body: '[]' })
            );
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            try {
                await page.goto(`http://127.0.0.1:${server.address().port}`);
                await page.locator('#setupTitle').filter({ hasText: 'Bring your learning' }).waitFor();
                assert.equal(repository.read().initialized, false);
                if (language === 'fa') await page.locator('#storageSetup [data-language-toggle]').click();
                await page.locator('.storage-options summary').click();
                await page.locator(samples ? '#btnSetupSamples' : '#btnSetupEmpty').click();
                await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
                const snapshot = repository.read();
                assert.equal(snapshot.preferences.language, language);
                assert.equal(snapshot.initialized, true);
                if (samples) {
                    assert.equal(snapshot.state.cards.length, 7);
                    assert.doesNotMatch(JSON.stringify(snapshot.state), /[\u0600-\u06ff]|persian|farsi/i);
                } else assert.deepEqual(snapshot.state.cards, []);
                await page.reload();
                await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
                assert.equal(await page.locator('html').getAttribute('lang'), language);
                assert.deepEqual(repository.read(), snapshot, 'Reload neither reseeds nor rewrites data');
                assert.deepEqual(errors, []);
            } finally {
                await context.close();
                server.closeAllConnections?.();
                await new Promise((resolve) => server.close(resolve));
                repository.close();
                fs.rmSync(directory, { recursive: true, force: true });
            }
        }
        console.log('PASS: Empty and English sample setup, selected language persistence, and no reseeding on reload.');
    } finally {
        await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
    }
})()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

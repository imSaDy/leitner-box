/* Synthetic data, a disposable browser profile and an isolated temporary database. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { chromium } = require('@playwright/test');

async function waitForPreference(repository, expected) {
    for (let attempt = 0; attempt < 50; attempt++) {
        if (repository.read().preferences.language === expected) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(repository.read().preferences.language, expected);
}

(async () => {
    const { LeitnerRepository } = await import('../../src/server/database/repository.js');
    const { createApplicationServer } = await import('../../src/server/http.js');
    const { emptyState, defaultPreferences } = await import('../../src/shared/validation.js');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-i18n-'));
    const repository = new LeitnerRepository(directory);
    const state = emptyState();
    state.cards.push({
        id: 'language-card',
        word: 'meaning',
        meaning: 'معنی',
        category: 'General',
        box: 1,
        lastReviewed: null,
        reviewCount: 0,
        createdAt: '2026-09-19T00:00:00.000Z',
    });
    repository.commit({
        state,
        preferences: defaultPreferences(),
        expectedRevision: 0,
        operationId: randomUUID(),
    });
    const server = createApplicationServer(repository, { maxBodyBytes: 64 * 1024 * 1024 });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
    await context.route('https://**/*', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
        await page.goto(`http://127.0.0.1:${server.address().port}`);
        await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
        assert.equal(await page.locator('html').getAttribute('lang'), 'fa');
        assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
        assert.equal((await page.locator('#btnLanguageToggle').innerText()).trim(), 'EN');

        await page.locator('#btnLanguageToggle').click();
        await page.waitForFunction(() => document.documentElement.lang === 'en');
        await page.locator('.workspace-nav a').first().filter({ hasText: 'Study desk' }).waitFor();
        await waitForPreference(repository, 'en');
        await page.locator('#storageStatus').filter({ hasText: 'Saved in the database' }).waitFor();
        assert.equal(await page.locator('html').getAttribute('dir'), 'ltr');
        assert.equal((await page.locator('#btnAddCard').innerText()).trim(), 'New card');
        assert.equal((await page.locator('.card-row .col-meaning').innerText()).trim(), 'معنی');

        await page.reload();
        await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
        assert.equal(await page.locator('html').getAttribute('lang'), 'en');
        assert.match(await page.locator('#welcomeTitle').innerText(), /Every review/);

        await page.locator('#btnLanguageToggle').click();
        await page.waitForFunction(() => document.documentElement.lang === 'fa');
        await waitForPreference(repository, 'fa');
        await page.locator('#storageStatus').filter({ hasText: 'در پایگاه داده ذخیره شد' }).waitFor();
        assert.equal(await page.locator('html').getAttribute('dir'), 'rtl');
        assert.match(await page.locator('#welcomeTitle').innerText(), /هر مرور/);
        assert.deepEqual(errors, []);
        console.log('PASS: Persian and English UI switch, direction, persistence, and user content isolation.');
    } finally {
        await page.goto('about:blank').catch(() => {});
        await context.request.dispose();
        await context.close();
        server.closeAllConnections?.();
        await new Promise((resolve) => server.close(resolve));
        repository.close();
        fs.rmSync(directory, { recursive: true, force: true });
        await Promise.race([browser.close().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 3000))]);
    }
})()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

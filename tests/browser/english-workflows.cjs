/* All scenarios use a temporary database and synthetic English content. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { chromium } = require('@playwright/test');

(async () => {
    const { LeitnerRepository } = await import('../../src/server/database/repository.js');
    const { createApplicationServer } = await import('../../src/server/http.js');
    const { emptyState, defaultPreferences } = await import('../../src/shared/validation.js');
    const { englishSamples } = await import('../../src/client/features/english-samples.js');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-english-'));
    const repository = new LeitnerRepository(directory);
    const state = emptyState();
    state.cards = englishSamples()
        .slice(0, 5)
        .map((card, index) => ({ ...card, id: `sample-${index}`, box: index + 1 }));
    state.cards.push({ ...englishSamples().at(-1), id: 'sentence', box: 2, category: 'Sentence practice' });
    state.cards[1].box = 3;
    state.stats.history = [{ date: '2026-09-19T10:00:00Z', correct: 2, wrong: 1, total: 3, box: 1 }];
    const seed = (theme = 'dark') =>
        repository.commit({
            state: structuredClone(state),
            preferences: { ...defaultPreferences(), theme },
            expectedRevision: repository.read().revision,
            operationId: randomUUID(),
            allowCardRemoval: true,
        });
    seed();
    const server = createApplicationServer(repository, { maxBodyBytes: 64 * 1024 * 1024 });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 960 } });
    await context.route('https://**/*', (route) => route.fulfill({ contentType: 'application/json', body: '[]' }));
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => {
        assert.doesNotMatch(dialog.message(), /[\u0600-\u06ff]|persian|farsi/i);
        return dialog.type() === 'beforeunload' ? dialog.accept() : dialog.dismiss();
    });
    let checks = 0;
    const ready = async () => {
        await page.goto(`http://127.0.0.1:${server.address().port}`);
        await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
        await page.evaluate(() => document.fonts.ready);
    };
    async function audit(label) {
        // Let the translation observer process dynamically-created controls.
        await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        );
        const bad = await page.evaluate(() => {
            const out = [];
            const visible = (el) =>
                el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]');
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                const n = walker.currentNode;
                if (
                    !n.parentElement.closest('script,style') &&
                    visible(n.parentElement) &&
                    /[\u0600-\u06ff]|persian|farsi/i.test(n.textContent)
                )
                    out.push(n.parentElement.id + ': ' + n.textContent.trim());
            }
            for (const el of document.querySelectorAll('[title],[placeholder],[aria-label]'))
                if (visible(el))
                    for (const attr of ['title', 'placeholder', 'aria-label'])
                        if (/[\u0600-\u06ff]|persian|farsi/i.test(el.getAttribute(attr) || ''))
                            out.push(`${el.id} ${attr}: ${el.getAttribute(attr)}`);
            return out;
        });
        assert.deepEqual(bad, [], `${label}: untranslated interface`);
        checks++;
    }
    async function capture(name, selector) {
        if (!process.env.CAPTURE_DOCS) return;
        const output = path.resolve(__dirname, '../../docs/images');
        fs.mkdirSync(output, { recursive: true });
        await (selector ? page.locator(selector) : page).screenshot({
            path: path.join(output, `${name}.png`),
            animations: 'disabled',
        });
    }
    async function mobileCapture(name) {
        if (!process.env.CAPTURE_DOCS || page.viewportSize().width !== 390) return;
        const output = path.resolve(__dirname, '../artifacts');
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: path.join(output, `${name}.png`), animations: 'disabled' });
    }
    async function mode(value) {
        await page.locator(`[data-review-mode="${value}"]`).click();
        await page.waitForFunction(
            (value) => document.querySelector(`[data-review-mode="${value}"]`).classList.contains('active'),
            value
        );
    }
    async function bounds(selector) {
        const rect = await page.locator(selector).boundingBox();
        assert.ok(
            rect && rect.x >= -1 && rect.x + rect.width <= page.viewportSize().width + 1,
            `${selector} fits viewport`
        );
        checks++;
    }
    try {
        for (const width of [1440, 768, 390]) {
            for (const theme of ['dark', 'light']) {
                seed(theme);
                await page.setViewportSize({ width, height: 960 });
                await ready();
                await audit(`dashboard ${width} ${theme}`);
                await page.locator('#btnAddCard').click();
                await page.locator('#inputMeaning').fill('Able to recover after difficulty.');
                await page.locator('#inputWord').fill('resilient');
                await audit('vocabulary form');
                await bounds('#cardModal .modal');
                assert.equal(
                    await page.locator('#inputMeaning').evaluate((el) => getComputedStyle(el).direction),
                    'ltr'
                );
                assert.equal(
                    await page.locator('#inputMeaning').evaluate((el) => getComputedStyle(el).textAlign),
                    'start'
                );
                if (width === 1440 && theme === 'dark') await capture('create-card', '#cardModal .modal');
                if (theme === 'dark') await mobileCapture('english-card-form');
                await page.locator('[data-card-type="sentence"]').click();
                await audit('sentence form');
                await page.locator('#btnCancelModal').click();
                for (const [open, close] of [
                    ['btnStats', 'btnCloseStats'],
                    ['btnExport', 'btnCloseExport'],
                    ['btnBackups', 'btnCloseBackups'],
                ]) {
                    if (await page.locator(`#${open}`).count()) {
                        await page.locator(`#${open}`).click();
                        if (open === 'btnBackups') {
                            await page.locator('#btnCreateBackup').click();
                            await page.locator('.backup-item').first().waitFor();
                            const before = repository.read();
                            await page
                                .locator('#restoreFile')
                                .setInputFiles({
                                    name: 'test.json',
                                    mimeType: 'application/json',
                                    buffer: Buffer.from(
                                        JSON.stringify({
                                            format: 'leitner-backup-v2',
                                            state: before.state,
                                            preferences: before.preferences,
                                        })
                                    ),
                                });
                            assert.deepEqual(
                                repository.read(),
                                before,
                                'Cancelled restore leaves the database unchanged'
                            );
                        }
                        await audit(open);
                        await page.locator(`#${close}`).click();
                    }
                }
                await page.locator('.cat-review-btn').first().click();
                await audit('topic picker');
                await bounds('#categoryBoxModal .modal');
                if (width === 1440 && theme === 'dark') await capture('topic-picker', '#categoryBoxModal .modal');
                await page.locator('#btnCancelCategoryBoxModal').click();
                if (width === 1440 && theme === 'dark') await capture('topics', '#categoryReviewSection');
                for (const value of ['flashcard', 'typing', 'combined']) {
                    await mode(value);
                    await page.locator('#reviewBox1').click();
                    await audit(`${value} ${width} ${theme}`);
                    if (value !== 'typing') {
                        await bounds('#reviewCard');
                        const boxes = await page.locator('.review-card-front .review-card-meta').boundingBox();
                        const speak = await page.locator('#btnSpeakFront').boundingBox();
                        assert.ok(boxes.x + boxes.width <= speak.x + 1, 'Badges do not overlap pronunciation button');
                        if (width === 1440 && theme === 'dark')
                            await capture(value === 'combined' ? 'combined-flashcard' : 'flashcards');
                        await page.locator('#reviewCard').click();
                        await audit('revealed flashcard');
                        if (theme === 'dark') await mobileCapture('english-card-answer');
                        if (value === 'combined') {
                            await page.locator('#btnCorrect').click();
                            await page.locator('#typingAnswerInput').waitFor({ state: 'visible' });
                            await audit('combined typing stage');
                            if (width === 1440 && theme === 'dark') await capture('combined-typing');
                        }
                    } else {
                        await bounds('.typing-review-card');
                        if (width === 1440 && theme === 'dark') await capture('typing');
                        await page.locator('#typingAnswerInput').fill('incorrect');
                        await page.locator('#typingAnswerForm button[type="submit"]').click();
                        await audit('typing hint');
                        await page.locator('#btnGiveUpTyping').click();
                        await audit('typing answer');
                    }
                    // Reload abandons only disposable unfinished sessions, keeping test isolation.
                    await ready();
                }
                await page.locator('#reviewBox2').click();
                await audit('sentence prompt');
                await bounds('.sentence-review-card');
                await page.locator('#btnShowSentenceHint').click();
                await audit('sentence hint');
                if (theme === 'dark') await mobileCapture('english-sentence');
                if (width === 1440 && theme === 'dark') await capture('sentences');
                await page.locator('#sentenceAnswerInput').fill('Small steps lead to lasting progress.');
                await page.locator('#sentenceAnswerForm button[type="submit"]').click();
                await audit('sentence answer');
                await page.locator('#btnExitReview').click();
                await ready();
            }
        }
        assert.deepEqual(errors, []);
        console.log(
            `PASS: ${checks} English content/layout audits across desktop, tablet, mobile, both themes, forms, topics and all review modes.`
        );
    } finally {
        await page.goto('about:blank').catch(() => {});
        await context.close();
        server.closeAllConnections?.();
        await new Promise((resolve) => server.close(resolve));
        repository.close();
        fs.rmSync(directory, { recursive: true, force: true });
        await Promise.race([browser.close(), new Promise((resolve) => setTimeout(resolve, 3000))]);
    }
})()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

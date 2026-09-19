/* Runs only in disposable browser contexts using synthetic cards.
   Compares complete storage snapshots against the saved, original application. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
let playwright;
try {
    playwright = require('playwright');
} catch {
    playwright = require(
        process.env.PLAYWRIGHT_MODULE ||
            path.join(
                require('node:os').homedir(),
                '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'
            )
    );
}
const root = path.resolve(__dirname, '../..');
const original = path.join(root, 'tests/fixtures/legacy');
const now = '2026-09-05T08:00:00.000Z';
const cards = (count) =>
    Array.from({ length: count }, (_, index) => ({
        id: `test-${index}`,
        cardType: 'vocabulary',
        word: `practice word ${index}`,
        pronunciation: '/test/',
        audioUrl: '',
        meaning: `معنی آزمایشی ${index}`,
        example: `This is practice word ${index}.`,
        notes: 'یادداشت شخصی',
        hint: '',
        category: `Practice Topic ${index % 8}`,
        box: (index % 5) + 1,
        lastReviewed: null,
        createdAt: new Date(Date.parse(now) - index * 86400000).toISOString(),
        reviewCount: index,
    }));
function fixture(list = cards(16)) {
    return {
        cards: list,
        customCategories: [...new Set(list.map((c) => c.category))],
        stats: {
            totalReviews: 11,
            correctAnswers: 8,
            wrongAnswers: 3,
            streak: 2,
            lastReviewDate: new Date(now).toDateString(),
            history: [],
        },
        deletedImportedSourceIds: ['already-deleted-fixture'],
        updatedAt: '2026-09-04T00:00:00.000Z',
    };
}
let browser,
    origin,
    assertions = 0;
const instances = new Map();
const errors = [];
function check(condition, message) {
    assert.ok(condition, message);
    assertions++;
}
function equivalent(actual, expected, label = 'snapshot') {
    function walk(a, b, key) {
        if (typeof a === 'string' && /^[\[{]/.test(a) && typeof b === 'string' && /^[\[{]/.test(b)) {
            try {
                return walk(JSON.parse(a), JSON.parse(b), key);
            } catch (error) {
                if (error.code === 'ERR_ASSERTION') throw error;
            }
        }
        if (a && b && typeof a === 'object' && typeof b === 'object') {
            assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort(), key);
            Object.keys(a).forEach((child) => walk(a[child], b[child], `${key}.${child}`));
        } else assert.equal(a, b, key);
    }
    walk(actual, expected, label);
    assertions++;
}
async function createPage(version, data = fixture()) {
    let instance;
    if (version === 'current') {
        const { LeitnerRepository } = await import('../../src/server/database/repository.js');
        const { createApplicationServer } = await import('../../src/server/http.js');
        const { defaultPreferences } = await import('../../src/shared/validation.js');
        const directory = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'leitner-browser-'));
        const repository = new LeitnerRepository(directory);
        repository.commit({
            state: data,
            preferences: { ...defaultPreferences(), language: 'fa' },
            expectedRevision: 0,
            operationId: require('node:crypto').randomUUID(),
        });
        const server = createApplicationServer(repository, { maxBodyBytes: 64 * 1024 * 1024 });
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
        instance = { repository, server, origin: 'http://127.0.0.1:' + server.address().port };
    }
    const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: 'reduce',
        acceptDownloads: true,
    });
    await context.addInitScript(
        ({ data, now }) => {
            const RealDate = Date;
            window.Date = class extends RealDate {
                constructor(...args) {
                    super(...(args.length ? args : [now]));
                }
                static now() {
                    return RealDate.parse(now);
                }
            };
            let seed = 45;
            Math.random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
            if (!sessionStorage.getItem('fixtureInitialized')) {
                localStorage.setItem('leitner_data', JSON.stringify(data));
                localStorage.setItem('leitner_returned_manual_cards_cleanup_20260804_v1', 'complete');
                sessionStorage.setItem('fixtureInitialized', 'yes');
            }
            window.Audio = class {
                addEventListener() {}
                pause() {}
                play() {
                    return Promise.resolve();
                }
            };
        },
        { data, now }
    );
    await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (/\/(fixed-expressions-data|topic-phrases-data)\.js$/.test(url.pathname))
            return route.fulfill({ body: '', contentType: 'application/javascript' });
        if (url.pathname.endsWith('.md')) return route.fulfill({ status: 404, body: '' });
        if (!url.href.startsWith(instance?.origin || origin))
            return route.fulfill({ status: 200, body: '[]', contentType: 'application/json' });
        await route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(`${version}: ${error.message}`));
    page.on('dialog', (dialog) => dialog.accept());
    page.setDefaultTimeout(15000);
    if (instance) instances.set(page, instance);
    await page.goto(instance ? instance.origin : `${origin}/${version}/index.html`);
    if (instance) await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    await page.waitForFunction(
        (count) => Number(document.getElementById('totalCards').textContent) === count,
        data.cards.length
    );
    await page.waitForTimeout(100);
    return page;
}
async function settled(page) {
    if (!instances.has(page)) return;
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    await page.locator('#persistenceOverlay').waitFor({ state: 'hidden' });
}
async function data(page) {
    await settled(page);
    return instances.has(page)
        ? instances.get(page).repository.read().state
        : page.evaluate(() => JSON.parse(localStorage.getItem('leitner_data')));
}
async function storage(page) {
    const value = await data(page);
    delete value.updatedAt;
    value.cards.forEach((card) => {
        if (!card.id.startsWith('test-') && card.id !== 'import-test') card.id = 'generated:' + card.word;
    });
    return { leitner_data: JSON.stringify(value) };
}
async function closePage(page) {
    await page.context().close();
    const instance = instances.get(page);
    if (instance) {
        await new Promise((resolve) => instance.server.close(resolve));
        instance.repository.close();
        instances.delete(page);
    }
}
async function search(page, text) {
    await page.locator('#searchInput').fill(text);
    await page.waitForTimeout(380);
}
async function clickCheckbox(page, selector) {
    await page.locator(selector).evaluate((el) => el.click());
}
async function lifecycle(version) {
    const page = await createPage(version);
    const snapshots = {};
    snapshots.initial = await storage(page);
    await page.locator('#btnAddCard').click();
    await page.waitForTimeout(350);
    await page.locator('#inputWord').fill('serendipity');
    await page.locator('#inputMeaning').fill('خوش‌اقبالی');
    await page.locator('#inputCategory').fill('Personal Practice');
    await page.locator('#inputExample').fill('Finding this book was pure serendipity.');
    await page.locator('#inputNotes').fill('یادداشت من با «نشانه»');
    await page.locator('#btnSaveCard').click();
    await page.waitForFunction(() => document.getElementById('inputWord').value === '');
    check((await data(page)).cards.length === 17, `${version}: add vocabulary`);
    snapshots.addVocabulary = await storage(page);
    await page.waitForTimeout(80);
    await page.locator('#inputWord').fill('serendipity');
    await page.locator('#inputMeaning').fill('تکراری');
    await page.locator('#btnSaveCard').click();
    check((await data(page)).cards.length === 17, `${version}: duplicate prevention`);
    await page.locator('#btnCardTypeSentence').click();
    await page.waitForTimeout(80);
    await page.locator('#inputSentence').fill('Small steps make a difference.');
    await page.locator('#inputSentenceMeaning').fill('قدم‌های کوچک تفاوت ایجاد می‌کنند.');
    await page.locator('#inputSentenceHint').fill('با Small شروع می‌شود');
    await page.locator('#btnSaveCard').click();
    await page.waitForFunction(() => document.getElementById('inputSentence').value === '');
    snapshots.addSentence = await storage(page);
    check((await data(page)).cards.length === 18, `${version}: add sentence`);
    await page.locator('#btnCancelModal').click();
    await search(page, 'serendipity');
    await page.locator('.card-action-btn.edit').click();
    await page.waitForTimeout(350);
    await page.locator('#inputMeaning').fill('خوش‌اقبالی؛ کشف اتفاقی');
    await page.locator('#btnSaveCard').click();
    await page.waitForFunction(() => !document.getElementById('cardModal').classList.contains('active'));
    snapshots.edit = await storage(page);
    check(
        (await data(page)).cards.find((c) => c.word === 'serendipity').notes === 'یادداشت من با «نشانه»',
        `${version}: edit preserves notes`
    );
    await clickCheckbox(page, '.card-select-checkbox');
    await page.locator('#btnMoveSelectedNext').click();
    check((await data(page)).cards.find((c) => c.word === 'serendipity').box === 2, `${version}: move next`);
    snapshots.moveNext = await storage(page);
    await clickCheckbox(page, '.card-select-checkbox');
    await page.locator('#btnMoveSelectedPrev').click();
    snapshots.movePrevious = await storage(page);
    await page.locator('.card-action-btn.delete').click();
    await page.locator('#btnCancelDelete').click();
    check((await data(page)).cards.length === 18, `${version}: cancel delete`);
    await page.locator('.card-action-btn.delete').click();
    await page.locator('#btnConfirmDelete').click();
    snapshots.delete = await storage(page);
    check((await data(page)).cards.length === 17, `${version}: delete`);
    await page.locator('#btnExport').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#btnDoExport').click();
    const download = await downloadPromise;
    const exported = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.deepEqual(exported.state || exported, await data(page));
    assertions++;
    const incoming = cards(1)[0];
    incoming.id = 'import-test';
    incoming.word = 'imported word';
    await page.locator('#importFile').setInputFiles({
        name: 'test-import.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify({ cards: [incoming, (await data(page)).cards[0]] })),
    });
    await page.waitForFunction(() => !document.getElementById('exportModal').classList.contains('active'));
    check((await data(page)).cards.length === 18, `${version}: import skips duplicate`);
    snapshots.import = await storage(page);
    await search(page, '');
    await page.locator('#btnNextPage').click();
    check((await page.locator('.card-row').count()) === 6, `${version}: pagination`);
    await page.locator('#btnPrevPage').click();
    await page.locator('.filter-tab[data-filter="3"]').click();
    check(
        await page.locator('.card-row').evaluateAll((rows) => rows.every((row) => row.dataset.box === '3')),
        `${version}: box filter`
    );
    await page.locator('.filter-tab[data-filter="all"]').click();
    await page.locator('#categoryFilter').selectOption('Practice Topic 1');
    await page.locator('#dueOnlyToggle').click();
    assert.deepEqual(await storage(page), snapshots.import);
    assertions++;
    await settled(page);
    await page.reload();
    if (instances.has(page)) await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    await page.waitForFunction(() => document.getElementById('totalCards').textContent === '18');
    assert.deepEqual(await storage(page), snapshots.import);
    assertions++;
    snapshots.reload = await storage(page);
    await closePage(page);
    return snapshots;
}
async function review(version, mode, correct, sentence = false, incomplete = false) {
    const card = cards(1)[0];
    card.box = 3;
    if (sentence) {
        card.cardType = 'sentence';
        card.word = 'Small steps make a difference.';
        card.hint = 'با Small شروع کنید';
    }
    const page = await createPage(version, fixture([card]));
    await page.locator(`[data-review-mode="${mode}"]`).click();
    const before = await data(page);
    await page.locator('#reviewBox3').click();
    if (!sentence && mode !== 'typing') {
        await page.locator('#reviewCard').click();
        await page.locator(correct ? '#btnCorrect' : '#btnWrong').click();
        if (mode === 'combined') {
            assert.deepEqual(await data(page), before);
            assertions++;
        }
    }
    if (incomplete) {
        await page.locator('#btnExitReview').click();
        assert.deepEqual(await data(page), before);
        assertions++;
    } else {
        if (sentence) {
            await page.locator('#btnShowSentenceHint').click();
            await page.locator('#sentenceAnswerInput').fill(correct ? card.word : 'wrong answer');
            await page.locator('#sentenceAnswerForm button[type="submit"]').click();
            await page.locator('#btnNextSentenceCard').click();
        } else if (mode !== 'flashcard') {
            if (correct) {
                await page.locator('#typingAnswerInput').fill(card.word);
                await page.locator('#btnCheckTypedAnswer').click();
            } else {
                await page.locator('#typingAnswerInput').fill('wrong');
                await page.locator('#btnCheckTypedAnswer').click();
                await page.locator('#btnGiveUpTyping').click();
            }
            await page.locator('#btnNextTypedCard').click();
        }
        await page.locator('#btnFinishReview').click();
        const result = await data(page);
        check(
            result.cards[0].box === (correct ? 4 : mode === 'combined' ? 2 : 1),
            `${version}: ${mode} ${sentence ? 'sentence' : 'vocabulary'} ${correct}`
        );
        check(result.cards[0].reviewCount === 1 && result.stats.totalReviews === 12, `${version}: counted once`);
        check(result.stats.history.length === 1, `${version}: review history`);
    }
    const state = await storage(page);
    await closePage(page);
    return state;
}
async function uiChecks() {
    const page = await createPage('current');
    const initial = await storage(page);
    check((await page.locator('.cat-review-item:visible').count()) === 6, 'six initial topics');
    await page.locator('#btnTopicsMore').click();
    check((await page.locator('.cat-review-item:visible').count()) === 8, 'expand all topics');
    await page.locator('#topicSearch').fill('Topic 7');
    check((await page.locator('.cat-review-item:visible').count()) === 1, 'search hidden topic');
    await page.locator('#topicSearch').fill('no such topic');
    check(await page.locator('#topicNoResults').isVisible(), 'topic empty state');
    await page.locator('#topicSearch').fill('');
    await page.locator('#btnTopicsMore').click();
    await search(page, 'word 1');
    await page.locator('#dueOnlyToggle').click();
    await page.locator('.filter-tab[data-filter="2"]').click();
    await page.locator('#btnClearFilters').click();
    check((await page.locator('.card-row').count()) === 12, 'reset combined filters');
    check(await page.locator('#btnClearFilters').isHidden(), 'reset action hidden when clean');
    assert.deepEqual(await storage(page), initial);
    assertions++;
    await page.locator('#btnStudyStart').click();
    check(
        await page.locator('#reviewOverlay').evaluate((el) => el.classList.contains('active')),
        'welcome review delegation'
    );
    check(
        await page.locator('.review-card-back').evaluate((el) => el.inert),
        'hidden answer excluded from keyboard and screen reader'
    );
    await page.locator('#btnRevealAnswer').click();
    check(
        await page.locator('.review-card-front').evaluate((el) => el.inert),
        'reveal button shows back and hides front'
    );
    await page.locator('#btnExitReview').click();
    await page.locator('#btnAddCard').click();
    await page.waitForTimeout(150);
    check(await page.locator('#studyDesk').evaluate((el) => el.inert), 'background inert in modal');
    await page.locator('#btnSaveCard').focus();
    await page.keyboard.press('Tab');
    check(
        await page.evaluate(() => document.getElementById('cardModal').contains(document.activeElement)),
        'dialog Tab stays inside'
    );
    await page.locator('#btnCancelModal').click();
    check(await page.evaluate(() => document.activeElement.id === 'btnAddCard'), 'focus restored after close');
    await page.locator('#btnStudyStart').click();
    await page.locator('#reviewCard').click();
    await page.locator('#btnEditDuringReview').click();
    await page.waitForTimeout(350);
    await page.locator('#inputNotes').fill('Edited while reviewing');
    await page.locator('#btnSaveCard').click();
    await page.waitForFunction(() => !document.getElementById('cardModal').classList.contains('active'));
    check(
        await page.locator('#reviewOverlay').evaluate((el) => !el.inert && el.classList.contains('active')),
        'nested edit returns to review'
    );
    await page.locator('#btnExitReview').click();
    await page.locator('#btnStats').click();
    check((await page.locator('#statTotalCards').textContent()) === '16', 'statistics modal');
    await page.locator('#btnCloseStats').click();
    await page.locator('#btnReviewModeCombined').click();
    await page.locator('#combinedBatchSizeInput').fill('4');
    await page.locator('#combinedBatchSizeInput').press('Tab');
    await settled(page);
    await page.reload();
    if (instances.has(page)) await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    check(
        (await page.locator('#btnReviewModeCombined').getAttribute('aria-pressed')) === 'true',
        'review mode retained'
    );
    check((await page.locator('#combinedBatchSizeInput').inputValue()) === '4', 'batch size retained');
    await page.locator('#btnThemeToggle').click();
    await settled(page);
    await page.reload();
    if (instances.has(page)) await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    check((await page.locator('html').getAttribute('data-theme')) === 'light', 'theme retained');
    for (const width of [320, 390, 600, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        check(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            `no page overflow at ${width}`
        );
        check(
            await page
                .locator('.card-row')
                .first()
                .evaluate((el) => Number(getComputedStyle(el).opacity) === 1),
            `rows visible at ${width}`
        );
        await page.locator('#btnAddCard').click();
        await page.locator('#btnSaveCard').waitFor({ state: 'visible' });
        check(await page.locator('#btnSaveCard').isVisible(), `form usable at ${width}`);
        await page.waitForTimeout(350);
        check(
            await page.locator('#btnSaveCard').evaluate((el) => {
                const r = el.getBoundingClientRect();
                return r.bottom <= innerHeight && r.top >= 0;
            }),
            `save button stays in viewport at ${width}`
        );
        await page.locator('#btnCancelModal').click();
    }
    check(
        await page.evaluate(() => {
            const ids = [...document.querySelectorAll('[id]')].map((el) => el.id);
            return ids.length === new Set(ids).size;
        }),
        'unique DOM IDs'
    );
    await closePage(page);
    const empty = await createPage('current', fixture([]));
    await empty.locator('#btnStudyStart').click();
    check(
        await empty.locator('#cardModal').evaluate((el) => el.classList.contains('active')),
        'empty welcome adds first card'
    );
    await closePage(empty);
    const waitingCards = cards(1);
    waitingCards[0].lastReviewed = now;
    const waiting = await createPage('current', fixture(waitingCards));
    check(await waiting.locator('#btnStudyStart').isDisabled(), 'no due cards disables welcome review');
    check((await waiting.locator('#studyMessage').textContent()).includes('نیست'), 'no due cards message');
    await waiting.locator('.card-action-btn.delete').click();
    await waiting.locator('#btnConfirmDelete').click();
    await waiting.waitForFunction(() => document.getElementById('totalCards').textContent === '0');
    check((await waiting.locator('#libraryPageCount').textContent()) === '', 'last deletion clears page count');
    await closePage(waiting);
}
(async () => {
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://localhost');
        const parts = decodeURIComponent(url.pathname).split('/').filter(Boolean);
        const version = parts.shift();
        const file = parts.join('/') || 'index.html';
        const base = version === 'baseline' && ['index.html', 'app.js', 'style.css'].includes(file) ? original : root;
        const target = path.resolve(base, file);
        if (!target.startsWith(base + path.sep) || !fs.existsSync(target)) {
            res.writeHead(404);
            res.end();
            return;
        }
        res.setHeader(
            'Content-Type',
            {
                '.html': 'text/html; charset=utf-8',
                '.js': 'application/javascript; charset=utf-8',
                '.css': 'text/css; charset=utf-8',
                '.png': 'image/png',
            }[path.extname(target)] || 'application/octet-stream'
        );
        res.end(fs.readFileSync(target));
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;
    try {
        browser = await playwright.chromium.launch({
            headless: true,
            channel: process.env.BROWSER_CHANNEL || 'msedge',
        });
        const baseline = await lifecycle('baseline');
        const current = await lifecycle('current');
        equivalent(current, baseline, 'lifecycle');
        console.log(
            'PASS: create, duplicate, sentence, edit, move, delete, export, import, filters and reload preserve original domain behavior.'
        );
        for (const mode of ['flashcard', 'typing', 'combined']) {
            for (const correct of [true, false]) {
                equivalent(
                    await review('current', mode, correct),
                    await review('baseline', mode, correct),
                    `review.${mode}.${correct}`
                );
                console.log(
                    `PASS: ${mode}, ${correct ? 'correct' : 'wrong'}, card progress and statistics match original.`
                );
            }
        }
        for (const correct of [true, false]) {
            equivalent(
                await review('current', 'flashcard', correct, true),
                await review('baseline', 'flashcard', correct, true)
            );
            assertions++;
        }
        equivalent(
            await review('current', 'combined', true, false, true),
            await review('baseline', 'combined', true, false, true)
        );
        assertions++;
        console.log('PASS: sentence review and incomplete combined review match original.');
        await uiChecks();

        assert.deepEqual(errors, []);
        assertions++;
        console.log(
            `PASS: ${assertions} assertions. No browser JavaScript errors. UI and all tested storage results verified.`
        );
        fs.mkdirSync(path.join(root, 'tests/artifacts'), { recursive: true });
        fs.writeFileSync(
            path.join(root, 'tests/artifacts/regression-verification.txt'),
            assertions + ' assertions passed. Synthetic data only; SQLite-backed app compared with legacy behavior.'
        );
    } finally {
        if (browser) {
            for (const context of browser.contexts()) {
                await context.request.dispose().catch(() => {});
                await context.close().catch(() => {});
            }
        }
        for (const instance of instances.values()) {
            instance.server.closeAllConnections?.();
            await new Promise((resolve) => instance.server.close(resolve));
            instance.repository.close();
        }
        server.closeAllConnections?.();
        await new Promise((resolve) => server.close(resolve));
        if (browser)
            await Promise.race([
                browser.close().catch(() => {}),
                new Promise((resolve) => setTimeout(resolve, 3000)),
            ]);
    }
})()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

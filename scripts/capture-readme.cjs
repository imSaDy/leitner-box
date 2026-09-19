/* Regenerates public README screenshots with synthetic data only. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { chromium } = require('@playwright/test');

(async () => {
    const { LeitnerRepository } = await import('../src/server/database/repository.js');
    const { createApplicationServer } = await import('../src/server/http.js');
    const { emptyState, defaultPreferences } = await import('../src/shared/validation.js');
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'leitner-readme-'));
    const output = path.resolve(__dirname, '..', 'docs', 'images');
    fs.mkdirSync(output, { recursive: true });
    const repository = new LeitnerRepository(directory);
    const state = emptyState();
    const samples = [
        ['resilient', 'تاب‌آور', 'Abstract Concepts'],
        ['biodiversity', 'تنوع زیستی', 'Environment & Ecology'],
        ['hypothesis', 'فرضیه', 'Science'],
        ['make progress', 'پیشرفت کردن', 'Fixed Expressions'],
        ['sustainable', 'پایدار', 'Environmental Science'],
        ['perspective', 'دیدگاه', 'Humanities'],
        ['innovation', 'نوآوری', 'Technology'],
        ['curriculum', 'برنامهٔ درسی', 'Education & Teaching'],
        ['metaphor', 'استعاره', 'Literature'],
        ['cognition', 'شناخت', 'Psychology'],
        ['sediment', 'رسوب', 'Geology'],
        ['revenue', 'درآمد', 'Business & Economics'],
        ['habitat', 'زیستگاه', 'Animals & Environment'],
        ['interpretation', 'تفسیر', 'Humanities'],
        ['conservation', 'حفاظت', 'Environment & Ecology'],
    ];
    state.cards = samples.map(([word, meaning, category], index) => ({
        id: `readme-${index + 1}`,
        word,
        meaning,
        category,
        box: (index % 5) + 1,
        lastReviewed: index % 3 === 0 ? new Date(Date.now() - 40 * 86400000).toISOString() : null,
        reviewCount: index * 2,
        pronunciation: '',
        example: `A clear example using “${word}” in context.`,
        notes: '',
        createdAt: new Date(Date.now() - index * 86400000).toISOString(),
    }));
    state.stats = {
        totalReviews: 148,
        correctAnswers: 126,
        wrongAnswers: 22,
        streak: 12,
        lastReviewDate: new Date().toDateString(),
        history: [],
    };
    repository.commit({
        state,
        preferences: defaultPreferences(),
        expectedRevision: 0,
        operationId: randomUUID(),
    });
    const server = createApplicationServer(repository, { maxBodyBytes: 64 * 1024 * 1024 });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
    const context = await browser.newContext({
        reducedMotion: 'reduce',
        viewport: { width: 1440, height: 960 },
        deviceScaleFactor: 1,
    });
    await context.route('https://**/*', (route) => route.abort());
    const page = await context.newPage();
    try {
        await page.goto(`http://127.0.0.1:${server.address().port}`);
        await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
        await page.locator('#btnLanguageToggle').click();
        await page.waitForFunction(() => document.documentElement.lang === 'en');
        await page.locator('.workspace-nav a').first().filter({ hasText: 'Study desk' }).waitFor();
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(output, 'dashboard-en.png'), animations: 'disabled' });

        await page.locator('#btnLanguageToggle').click();
        await page.waitForFunction(() => document.documentElement.lang === 'fa');
        await page.locator('.workspace-nav a').first().filter({ hasText: 'میز مطالعه' }).waitFor();
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(output, 'dashboard-fa.png'), animations: 'disabled' });
        console.log(`README screenshots written to ${output}`);
    } finally {
        await page.goto('about:blank').catch(() => {});
        await context.close().catch(() => {});
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

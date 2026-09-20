import { install as configuration } from './features/configuration.js';
import { install as state } from './features/state.js';
import { install as domain } from './features/domain.js';
import { install as examples } from './features/examples.js';
import { install as catalog } from './features/catalog.js';
import { install as pronunciation } from './features/pronunciation.js';
import { install as preferences } from './features/preferences.js';
import { install as dashboard } from './features/dashboard.js';
import { install as library } from './features/library.js';
import { install as cards } from './features/cards.js';
import { install as editor } from './features/card-editor.js';
import { install as review } from './features/review.js';
import { install as dataTools } from './features/data-tools.js';
import { install as persistenceAdapter } from './features/persistence-adapter.js';
import { install as events } from './features/events.js';
import { Persistence } from './services/persistence.js';
import { ensureInitialized } from './services/migration.js';
import { installTransactions } from './services/transactions.js';
import { installStorageUI, downloadJson } from './ui/storage-ui.js';
import { installBackupUI } from './ui/backups.js';
import { decodeImport, emptyState } from '../shared/validation.js';
import { createI18n } from './i18n.js';
import { englishSamples } from './features/english-samples.js';

async function start() {
    const repository = new Persistence();
    installStorageUI(repository);
    const i18n = createI18n();
    i18n.start();
    try {
        await repository.load();
        i18n.setLanguage(repository.snapshot.preferences.language, { emit: false });
        const { seed } = await ensureInitialized(repository);
        // Setup or migration may select a different language than the empty database used before it.
        i18n.setLanguage(repository.snapshot.preferences.language, { emit: false });
        const ctx = {};
        for (const install of [
            configuration,
            state,
            domain,
            examples,
            catalog,
            pronunciation,
            preferences,
            dashboard,
            library,
            cards,
            editor,
            review,
            dataTools,
            persistenceAdapter,
            events,
        ])
            install(ctx);
        ctx.repository = repository;
        ctx.i18n = i18n;
        ctx.appData = { ...emptyState(), ...structuredClone(repository.snapshot.state) };
        ctx.appData.stats = { ...emptyState().stats, ...ctx.appData.stats };
        ctx.preferences = structuredClone(repository.snapshot.preferences);
        ctx.downloadJson = downloadJson;
        ctx.decodeImport = decodeImport;
        installTransactions(ctx);
        ctx.loadTheme();
        ctx.loadLanguage();
        ctx.loadReviewMode();
        ctx.loadCombinedReviewBatchSize();
        ctx.bindEvents();
        ctx.updateReviewModeUI();
        ctx.updateCombinedReviewBatchSizeUI();
        ctx.populateCategoryFilter();
        ctx.updateDashboard();
        ctx.renderCards();
        installBackupUI(ctx);
        let languageSave = Promise.resolve();
        i18n.onChange((language) => {
            languageSave = languageSave
                .then(async () => {
                    await ctx.whenIdle();
                    const saved = await ctx.runMutation(async () => {
                        ctx.preferences.language = language;
                        await ctx.saveData();
                        return true;
                    });
                    if (!saved) ctx.loadLanguage();
                    ctx.updateDashboard();
                    ctx.populateCategoryFilter();
                    ctx.renderCards();
                    i18n.apply();
                })
                .catch((error) => ctx.showToast(error.message || 'Language preference was not saved.', 'error'));
            return languageSave;
        });
        if (seed)
            await ctx.runMutation(async () => {
                if (ctx.preferences.language === 'en') {
                    ctx.appData.cards.push(...englishSamples());
                    await ctx.saveData();
                    ctx.populateCategoryFilter();
                    ctx.updateDashboard();
                    ctx.renderCards();
                    return;
                }
                await ctx.upsertFixedExpressionEntries(ctx.getEmbeddedFixedExpressionEntries(), true);
                await ctx.upsertTopicPhraseEntries(ctx.getEmbeddedTopicPhraseEntries(), true);
            });
        document.documentElement.dataset.ready = 'true';
        document.dispatchEvent(new CustomEvent('leitner-ready'));
    } catch (error) {
        repository.notify('conflict', 'برنامه به اطلاعات دسترسی پیدا نکرد: ' + error.message);
    }
}
start();

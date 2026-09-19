/** preferences: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        loadReviewMode: function loadReviewMode() {
            ctx.currentReviewMode = ctx.preferences.reviewMode;
        },
        loadLanguage: function loadLanguage() {
            ctx.i18n.setLanguage(ctx.preferences.language, { emit: false });
        },
        setReviewMode: async function setReviewMode(mode) {
            ctx.preferences.reviewMode = ctx.REVIEW_MODES.includes(mode) ? mode : 'flashcard';
            await ctx.saveData();
            ctx.loadReviewMode();
            ctx.updateReviewModeUI();
        },
        updateReviewModeUI: function updateReviewModeUI() {
            document.querySelectorAll('.mode-option').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.reviewMode === ctx.currentReviewMode);
            });
        },
        normalizeCombinedReviewBatchSize: function normalizeCombinedReviewBatchSize(value) {
            const parsed = parseInt(value, 10);
            if (!Number.isFinite(parsed)) return ctx.DEFAULT_COMBINED_REVIEW_BATCH_SIZE;
            return Math.min(ctx.MAX_COMBINED_REVIEW_BATCH_SIZE, Math.max(ctx.MIN_COMBINED_REVIEW_BATCH_SIZE, parsed));
        },
        loadCombinedReviewBatchSize: function loadCombinedReviewBatchSize() {
            ctx.combinedReviewBatchSize = ctx.normalizeCombinedReviewBatchSize(ctx.preferences.combinedBatchSize);
        },
        setCombinedReviewBatchSize: async function setCombinedReviewBatchSize(value) {
            ctx.preferences.combinedBatchSize = ctx.normalizeCombinedReviewBatchSize(value);
            await ctx.saveData();
            ctx.loadCombinedReviewBatchSize();
            ctx.updateCombinedReviewBatchSizeUI();
        },
        updateCombinedReviewBatchSizeUI: function updateCombinedReviewBatchSizeUI() {
            const input = document.getElementById('combinedBatchSizeInput');
            if (!input) return;
            input.value = String(ctx.combinedReviewBatchSize);
        },
        loadTheme: function loadTheme() {
            if (ctx.preferences.theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
            else document.documentElement.removeAttribute('data-theme');
        },
        toggleTheme: async function toggleTheme() {
            ctx.preferences.theme = ctx.preferences.theme === 'light' ? 'dark' : 'light';
            await ctx.saveData();
            ctx.loadTheme();
        },
    });
}

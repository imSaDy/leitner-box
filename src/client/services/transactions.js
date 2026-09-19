import { emptyState } from '../../shared/validation.js';

/** Serialize user mutations; restore the acknowledged snapshot on rejection. */
export function installTransactions(ctx) {
    let active = null;
    ctx.whenIdle = async () => {
        while (active) await active;
    };
    ctx.runMutation = (action) => {
        if (active || ctx.repository.blocked) return Promise.resolve(false);
        const reviewBefore = structuredClone(ctx.reviewState);
        const selectedBefore = new Set(ctx.selectedCardIds);
        const revisionBefore = ctx.repository.snapshot.revision;
        active = Promise.resolve()
            .then(action)
            .catch((error) => {
                ctx.appData = { ...emptyState(), ...structuredClone(ctx.repository.snapshot.state) };
                ctx.appData.stats = { ...emptyState().stats, ...ctx.appData.stats };
                ctx.preferences = structuredClone(ctx.repository.snapshot.preferences);
                if (ctx.repository.snapshot.revision === revisionBefore) ctx.reviewState = reviewBefore;
                ctx.selectedCardIds = selectedBefore;
                ctx.loadReviewMode();
                ctx.loadCombinedReviewBatchSize();
                ctx.loadTheme();
                ctx.updateReviewModeUI();
                ctx.updateCombinedReviewBatchSizeUI();
                ctx.updateDashboard();
                ctx.populateCategoryFilter();
                ctx.renderCards();
                ctx.showToast(error.message || 'ذخیره انجام نشد؛ دوباره تلاش کنید.', 'error');
                console.warn('Mutation rejected:', error);
                return false;
            })
            .finally(() => {
                active = null;
            });
        return active;
    };
    for (const name of [
        'addCard',
        'updateCard',
        'deleteCards',
        'moveCardsToAdjacentBox',
        'addToeflSampleCards',
        'answerCard',
        'deleteCardDuringReview',
        'toggleTheme',
        'setReviewMode',
        'setCombinedReviewBatchSize',
        'importData',
    ]) {
        const action = ctx[name];
        ctx[name] = (...args) => ctx.runMutation(() => action(...args));
    }
}

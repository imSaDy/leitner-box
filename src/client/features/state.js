/** state: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    ctx.appData = {
        cards: [],
        stats: { totalReviews: 0, correctAnswers: 0, wrongAnswers: 0, streak: 0, lastReviewDate: null, history: [] },
        customCategories: [],
        deletedImportedSourceIds: [],
    };
    ctx.reviewState = {
        boxNumber: null,
        category: null,
        mode: 'flashcard',
        cards: [],
        steps: [],
        combinedResults: {},
        currentIndex: 0,
        correct: 0,
        wrong: 0,
        isFlipped: false,
        typedAnswered: false,
        typedCorrect: false,
        typedMistakes: 0,
        sentenceAnswered: false,
        sentenceCorrect: false,
    };
    ctx.currentReviewMode = 'flashcard';
    ctx.combinedReviewBatchSize = ctx.DEFAULT_COMBINED_REVIEW_BATCH_SIZE;
    ctx.currentFilter = 'all';
    ctx.currentCategory = 'all';
    ctx.currentSearch = '';
    ctx.currentDueOnly = false;
    ctx.currentPage = 1;
    ctx.deleteCardId = null;
    ctx.pendingDeleteCardIds = [];
    ctx.selectedCardIds = new Set();
    ctx.fetchAbort = null;
    ctx.lastFetchResult = null;
    ctx.lastAddCardCategory = 'General';
    ctx.reviewAutoSpeakTimer = null;
    ctx.activeCardFormType = ctx.CARD_TYPE_VOCABULARY;
    ctx.activePronunciationAudio = null;
    ctx.customExampleLookup = null;
    ctx.wordDebounce = null;
    ctx.repository = null;
    ctx.preferences = null;
    ctx.runMutation = null;
    ctx.whenIdle = null;
    ctx.downloadJson = null;
    ctx.decodeImport = null;
    Object.assign(ctx, {});
}

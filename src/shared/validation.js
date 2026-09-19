/** The same boundary checks run before imports and before every database write. */
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.code = 'INVALID_DATA';
        this.status = 422;
    }
}
const fail = (message) => {
    throw new ValidationError(message);
};
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
function text(value, name, max, required = false) {
    if (value === undefined || value === null) {
        if (required) fail(`${name} وجود ندارد.`);
        return;
    }
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) fail(`${name} معتبر نیست.`);
}
function integer(value, name, min = 0, max = Number.MAX_SAFE_INTEGER) {
    if (!Number.isSafeInteger(value) || value < min || value > max) fail(`${name} معتبر نیست.`);
}
function date(value, name) {
    if (value !== undefined && value !== null && (typeof value !== 'string' || !Number.isFinite(Date.parse(value))))
        fail(`${name} تاریخ معتبری نیست.`);
}
function stringList(value, name) {
    if (
        !Array.isArray(value) ||
        value.length > 200000 ||
        value.some((item) => typeof item !== 'string' || item.length > 20000)
    )
        fail(`${name} معتبر نیست.`);
}

export function validateState(state) {
    if (!record(state) || !Array.isArray(state.cards)) fail('فایل باید شامل فهرست کارت‌ها باشد.');
    if (state.cards.length > 100000) fail('تعداد کارت‌ها بیش از حد مجاز است.');
    const ids = new Set();
    state.cards.forEach((card, index) => {
        const label = `کارت ${index + 1}`;
        if (!record(card)) fail(`${label} معتبر نیست.`);
        text(card.id, `شناسهٔ ${label}`, 1024, true);
        if (ids.has(card.id)) fail(`شناسهٔ تکراری در ${label} وجود دارد.`);
        ids.add(card.id);
        text(card.word, `متن ${label}`, 20000, true);
        text(card.meaning, `معنی ${label}`, 50000, true);
        text(card.category, `موضوع ${label}`, 1024, true);
        integer(card.box, `جعبهٔ ${label}`, 1, 5);
        if (card.reviewCount !== undefined) integer(card.reviewCount, `تعداد مرور ${label}`);
        if (card.cardType !== undefined && !['vocabulary', 'sentence'].includes(card.cardType))
            fail(`نوع ${label} معتبر نیست.`);
        for (const key of ['pronunciation', 'audioUrl', 'example', 'hint', 'notes', 'source', 'sourceId'])
            text(card[key], `${key} در ${label}`, 100000);
        date(card.lastReviewed, `آخرین مرور ${label}`);
        date(card.createdAt, `تاریخ ساخت ${label}`);
    });
    if (state.stats !== undefined) {
        if (!record(state.stats)) fail('آمار معتبر نیست.');
        for (const key of ['totalReviews', 'correctAnswers', 'wrongAnswers', 'streak']) {
            if (state.stats[key] !== undefined) integer(state.stats[key], `آمار ${key}`);
        }
        if (
            state.stats.history !== undefined &&
            (!Array.isArray(state.stats.history) || state.stats.history.some((item) => !record(item)))
        )
            fail('سابقهٔ مرور معتبر نیست.');
    }
    if (state.customCategories !== undefined) stringList(state.customCategories, 'موضوع‌های شخصی');
    if (state.deletedImportedSourceIds !== undefined) stringList(state.deletedImportedSourceIds, 'سوابق حذف');
    // Preserve all extra fields, ordering, dates and progress from the old file.
    return state;
}

export function validatePreferences(preferences) {
    if (!record(preferences)) fail('تنظیمات معتبر نیست.');
    const allowed = new Set(['theme', 'reviewMode', 'combinedBatchSize', 'language']);
    if (Object.keys(preferences).some((key) => !allowed.has(key))) fail('تنظیم ناشناخته است.');
    if (!['dark', 'light'].includes(preferences.theme)) fail('تم معتبر نیست.');
    if (!['flashcard', 'typing', 'combined'].includes(preferences.reviewMode)) fail('روش مرور معتبر نیست.');
    integer(preferences.combinedBatchSize, 'اندازهٔ بسته', 1, 50);
    if (preferences.language === undefined) preferences.language = 'fa';
    if (!['fa', 'en'].includes(preferences.language)) fail('زبان معتبر نیست.');
    return preferences;
}

export const defaultPreferences = () => ({
    theme: 'dark',
    reviewMode: 'flashcard',
    combinedBatchSize: 10,
    language: 'en',
});
export const emptyState = () => ({
    cards: [],
    customCategories: [],
    deletedImportedSourceIds: [],
    stats: { totalReviews: 0, correctAnswers: 0, wrongAnswers: 0, streak: 0, lastReviewDate: null, history: [] },
});

export function decodeImport(payload) {
    if (!record(payload)) fail('فرمت فایل معتبر نیست.');
    let state,
        preferences = defaultPreferences(),
        legacy = null;
    if (payload.format === 'leitner-migration-v1') {
        // The browser-only legacy app was Persian-only, so keep its migration familiar.
        preferences.language = 'fa';
        if (!record(payload.legacy) || typeof payload.legacy.leitner_data !== 'string')
            fail('اطلاعات اصلی نسخهٔ قدیمی در فایل نیست.');
        legacy = payload.legacy;
        try {
            state = JSON.parse(legacy.leitner_data);
        } catch {
            fail('اطلاعات نسخهٔ قبلی خوانا نیست.');
        }
        if (['dark', 'light'].includes(legacy.leitner_theme)) preferences.theme = legacy.leitner_theme;
        if (['flashcard', 'typing', 'combined'].includes(legacy.leitner_review_mode))
            preferences.reviewMode = legacy.leitner_review_mode;
        const batch = Number(legacy.leitner_combined_review_batch_size);
        if (Number.isInteger(batch) && batch >= 1 && batch <= 50) preferences.combinedBatchSize = batch;
    } else if (payload.format === 'leitner-backup-v2') {
        state = payload.state;
        preferences = payload.preferences;
    } else {
        state = payload;
    }
    return { state: validateState(state), preferences: validatePreferences(preferences), legacy };
}

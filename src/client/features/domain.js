/** domain: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        generateId: function generateId() {
            return crypto.randomUUID();
        },
        toPersianNumber: function toPersianNumber(num) {
            if (document.documentElement.lang === 'en') return Number(num).toLocaleString('en-US');
            const pd = '۰۱۲۳۴۵۶۷۸۹';
            return num.toString().replace(/\d/g, (d) => pd[d]);
        },
        formatDate: function formatDate(dateStr) {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString(
                    document.documentElement.lang === 'en' ? 'en-US' : 'fa-IR',
                    {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }
                );
            } catch {
                return new Date(dateStr).toLocaleDateString();
            }
        },
        normalizeBoxNumber: function normalizeBoxNumber(box) {
            return Math.min(5, Math.max(1, Number(box) || 1));
        },
        isDue: function isDue(card) {
            if (!card.lastReviewed) return true;
            const days = Math.floor((new Date() - new Date(card.lastReviewed)) / 86400000);
            return days >= ctx.BOX_INTERVALS[ctx.normalizeBoxNumber(card.box)];
        },
        escapeHtml: function escapeHtml(str) {
            const d = document.createElement('div');
            d.textContent = str == null ? '' : String(str);
            return d.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        },
        normalizeTypedAnswer: function normalizeTypedAnswer(value) {
            return (value || '')
                .trim()
                .toLowerCase()
                .replace(/[’`]/g, "'")
                .replace(/[-–—]/g, ' ')
                .replace(/[^a-z0-9'\s]/g, '')
                .replace(/\s+/g, ' ');
        },
        normalizeSentenceAnswer: function normalizeSentenceAnswer(value) {
            return (value || '')
                .trim()
                .toLowerCase()
                .replace(/[“”]/g, '"')
                .replace(/[’`]/g, "'")
                .replace(/[-–—]/g, ' ')
                .replace(/\s+/g, ' ')
                .replace(/\s+([,.;:!?])/g, '$1')
                .replace(/([,.;:!?])([a-z0-9])/g, '$1 $2')
                .replace(/[.!?]+$/g, '')
                .trim();
        },
        getCardType: function getCardType(card) {
            return card && card.cardType === ctx.CARD_TYPE_SENTENCE ? ctx.CARD_TYPE_SENTENCE : ctx.CARD_TYPE_VOCABULARY;
        },
        isSentenceCard: function isSentenceCard(card) {
            return ctx.getCardType(card) === ctx.CARD_TYPE_SENTENCE;
        },
        createSpellingHint: function createSpellingHint(word, revealedLetters) {
            let remaining = revealedLetters;
            return Array.from(word)
                .map((char) => {
                    if (!/[a-zA-Z]/.test(char)) return char;
                    if (remaining > 0) {
                        remaining--;
                        return char;
                    }
                    return '_';
                })
                .join(' ');
        },
        findKnownCategory: function findKnownCategory(category) {
            const raw = (category || '').trim();
            if (!raw) return '';
            const key = raw.toLowerCase();
            const alias = ctx.CATEGORY_ALIASES[key];
            if (alias) return alias;
            const exact = ctx.CATEGORIES.find((cat) => cat.toLowerCase() === key);
            if (exact) return exact;
            const custom = (ctx.appData.customCategories || []).find(
                (cat) =>
                    String(cat || '')
                        .trim()
                        .toLowerCase() === key
            );
            return custom ? String(custom).trim() : '';
        },
        isBuiltInCategory: function isBuiltInCategory(category) {
            const raw = (category || '').trim();
            if (!raw) return false;
            return ctx.CATEGORIES.some((cat) => cat.toLowerCase() === raw.toLowerCase());
        },
        hasCustomCategory: function hasCustomCategory(category) {
            const raw = (category || '').trim().toLowerCase();
            if (!raw) return false;
            return (ctx.appData.customCategories || []).some(
                (cat) =>
                    String(cat || '')
                        .trim()
                        .toLowerCase() === raw
            );
        },
        normalizeCategory: function normalizeCategory(category) {
            const raw = (category || '').trim();
            if (!raw) return 'General';
            return ctx.findKnownCategory(raw) || raw;
        },
        ensureCustomCategory: function ensureCustomCategory(category) {
            const normalized = ctx.normalizeCategory(category);
            if (!normalized || ctx.isBuiltInCategory(normalized) || ctx.hasCustomCategory(normalized))
                return normalized || 'General';
            if (!ctx.appData.customCategories) ctx.appData.customCategories = [];
            ctx.appData.customCategories.push(normalized);
            return normalized;
        },
        syncCustomCategoriesFromCards: function syncCustomCategoriesFromCards() {
            if (!ctx.appData.customCategories) ctx.appData.customCategories = [];
            const before = ctx.appData.customCategories.length;
            ctx.appData.cards.forEach((card) => {
                if (!card || !card.category) return;
                ctx.ensureCustomCategory(card.category);
            });
            return ctx.appData.customCategories.length !== before;
        },
        isManualCard: function isManualCard(card) {
            return card && (!card.source || card.source === 'manual');
        },
        countManualCards: function countManualCards(data) {
            return Array.isArray(data && data.cards) ? data.cards.filter(ctx.isManualCard).length : 0;
        },
        countCards: function countCards(data) {
            return Array.isArray(data && data.cards) ? data.cards.length : 0;
        },
        getCardMergeKey: function getCardMergeKey(card) {
            const category = ctx.normalizeCategory(card && card.category);
            const phrase = ctx.normalizeFixedExpression(card && card.word);
            return card && card.sourceId ? `source:${card.sourceId}` : `card:${category}::${phrase}`;
        },
        normalizeDeletedImportedSourceIds: function normalizeDeletedImportedSourceIds(data = ctx.appData) {
            const ids = Array.isArray(data.deletedImportedSourceIds) ? data.deletedImportedSourceIds : [];
            data.deletedImportedSourceIds = Array.from(
                new Set(ids.map((id) => String(id || '').trim()).filter(Boolean))
            );
            return data.deletedImportedSourceIds;
        },
        getDeletedImportedSourceIdSet: function getDeletedImportedSourceIdSet() {
            return new Set(ctx.normalizeDeletedImportedSourceIds(ctx.appData));
        },
        isDeletedImportedSourceId: function isDeletedImportedSourceId(sourceId) {
            return Boolean(sourceId) && ctx.getDeletedImportedSourceIdSet().has(String(sourceId));
        },
        getCategoryTermDeletionKey: function getCategoryTermDeletionKey(category, word) {
            const normalizedCategory = ctx.normalizeCategory(category);
            const normalizedWord = ctx.normalizeFixedExpression(word);
            return normalizedCategory && normalizedWord
                ? `category-term::${normalizedCategory}::${normalizedWord}`
                : '';
        },
        isDeletedImportedCard: function isDeletedImportedCard(candidate) {
            return ctx.getImportedDeletionKeys(candidate).some((key) => ctx.isDeletedImportedSourceId(key));
        },
        getImportedDeletionKeys: function getImportedDeletionKeys(card) {
            if (!card) return [];

            const keys = [];
            const source = card.source || '';
            const category = ctx.normalizeCategory(card.category);
            const wordKey = ctx.normalizeFixedExpression(card.word || '');

            if (card.sourceId) keys.push(String(card.sourceId));
            const categoryTermKey = ctx.getCategoryTermDeletionKey(category, wordKey);
            if (categoryTermKey) keys.push(categoryTermKey);
            if (
                category === ctx.FIXED_EXPRESSIONS_CATEGORY ||
                source === 'fixed-expressions' ||
                /^fixed-expression::/i.test(card.sourceId || '')
            ) {
                if (wordKey) keys.push(`fixed-expression::${wordKey}`);
            }
            if (source === 'topic-md' || /^topic-md::/i.test(card.sourceId || '')) {
                if (category && wordKey) keys.push(`topic-md::${category}::${wordKey}`);
            }
            if (
                source === 'telegram' ||
                category === ctx.VOCABHUB_CATEGORY ||
                /^telegram[:]/i.test(card.sourceId || '')
            ) {
                const telegramWord = ctx.compactText(card.word || '').toLowerCase();
                if (telegramWord) keys.push(`${ctx.VOCABHUB_CATEGORY}::${telegramWord}`);
            }

            return Array.from(new Set(keys.filter(Boolean)));
        },
        markImportedCardDeleted: function markImportedCardDeleted(card) {
            const keys = ctx.getImportedDeletionKeys(card);
            if (keys.length === 0) return false;

            const deletedIds = ctx.normalizeDeletedImportedSourceIds(ctx.appData);
            const existing = new Set(deletedIds);
            let changed = false;

            keys.forEach((key) => {
                if (existing.has(key)) return;
                deletedIds.push(key);
                existing.add(key);
                changed = true;
            });

            return changed;
        },
        emptyStats: function emptyStats() {
            return {
                totalReviews: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                streak: 0,
                lastReviewDate: null,
                history: [],
            };
        },
        recordReviewActivityDate: function recordReviewActivityDate() {
            if (!ctx.appData.stats) ctx.appData.stats = ctx.emptyStats();
            const today = new Date().toDateString();
            if (ctx.appData.stats.lastReviewDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                ctx.appData.stats.streak =
                    ctx.appData.stats.lastReviewDate === yesterday.toDateString() ? ctx.appData.stats.streak + 1 : 1;
                ctx.appData.stats.lastReviewDate = today;
            }
        },
    });
}

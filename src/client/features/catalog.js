/** catalog: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        getEmbeddedFixedExpressionEntries: function getEmbeddedFixedExpressionEntries() {
            return Array.isArray(globalThis.FIXED_EXPRESSIONS_EMBEDDED_CARDS)
                ? globalThis.FIXED_EXPRESSIONS_EMBEDDED_CARDS
                : [];
        },
        getEmbeddedTopicPhraseEntries: function getEmbeddedTopicPhraseEntries() {
            return Array.isArray(globalThis.TOPIC_PHRASES_EMBEDDED_CARDS)
                ? globalThis.TOPIC_PHRASES_EMBEDDED_CARDS
                : [];
        },
        getRemovedTopicPhraseSourceIds: function getRemovedTopicPhraseSourceIds() {
            return Array.isArray(globalThis.TOPIC_PHRASES_REMOVED_SOURCE_IDS)
                ? globalThis.TOPIC_PHRASES_REMOVED_SOURCE_IDS
                : [];
        },
        normalizeFixedExpression: function normalizeFixedExpression(value) {
            return ctx.compactText(value).replace(/^\*+/, '').replace(/[’`]/g, "'").toLowerCase();
        },
        getCategoryTermKey: function getCategoryTermKey(category, word) {
            const normalizedCategory = ctx.normalizeCategory(category);
            const normalizedWord = ctx.normalizeFixedExpression(word);
            return normalizedCategory && normalizedWord ? `${normalizedCategory}::${normalizedWord}` : '';
        },
        getCardCategoryTermKey: function getCardCategoryTermKey(card) {
            return ctx.getCategoryTermKey(card && card.category, card && card.word);
        },
        findDuplicateCardInCategory: function findDuplicateCardInCategory(category, word, ignoredCardId = '') {
            const key = ctx.getCategoryTermKey(category, word);
            if (!key) return null;
            return (
                ctx.appData.cards.find(
                    (card) => card && card.id !== ignoredCardId && ctx.getCardCategoryTermKey(card) === key
                ) || null
            );
        },
        hasDuplicateCardInCategory: function hasDuplicateCardInCategory(category, word, ignoredCardId = '') {
            return Boolean(ctx.findDuplicateCardInCategory(category, word, ignoredCardId));
        },
        normalizeMarkdownSectionName: function normalizeMarkdownSectionName(text) {
            return ctx
                .compactText(text)
                .replace(/^\d+\.\s*/, '')
                .replace(/\s+/g, ' ')
                .toLowerCase();
        },
        isAcademicPhrasesSection: function isAcademicPhrasesSection(section) {
            return /^academic phrases?$/.test(ctx.normalizeMarkdownSectionName(section));
        },
        parseMarkdownPhraseEntries: function parseMarkdownPhraseEntries(text, meta = {}, options = {}) {
            const entries = [];
            const seen = new Set();
            let currentSection = '';

            String(text || '')
                .split(/\r?\n/)
                .forEach((rawLine, index) => {
                    const trimmedLine = rawLine.trim();
                    const heading = trimmedLine.match(/^#{1,6}\s*(.+?)\s*$/);
                    if (heading) {
                        currentSection = ctx.normalizeMarkdownSectionName(heading[1]);
                        return;
                    }

                    const line = rawLine
                        .trim()
                        .replace(/^[-*+]\s*/, '')
                        .trim();
                    if (!line) return;
                    if (options.excludeAcademicPhrases && ctx.isAcademicPhrasesSection(currentSection)) return;

                    const match = line.match(/^\*\*(.+?)\*\*\s*[:：]\s*(.+)$/) || line.match(/^(.+?)\s*[:：]\s*(.+)$/);
                    if (!match) return;

                    const phrase = ctx.compactText(match[1].replace(/\*\*/g, ''));
                    const meaning = ctx.compactText(match[2]);
                    const key = ctx.normalizeFixedExpression(phrase);
                    if (!phrase || !meaning || seen.has(key)) return;

                    seen.add(key);
                    entries.push({ ...meta, phrase, meaning, sourceLine: index + 1, sourceSection: currentSection });
                });

            return entries;
        },
        parseFixedExpressionsMarkdown: function parseFixedExpressionsMarkdown(text) {
            return ctx.parseMarkdownPhraseEntries(text);
        },
        upsertFixedExpressionEntries: async function upsertFixedExpressionEntries(entries) {
            const seen = new Set();
            let added = 0;
            let updated = 0;
            const now = Date.now();

            entries.forEach((entry, index) => {
                const phrase = ctx.compactText(entry.phrase || entry.word || '');
                const meaning = ctx.compactText(entry.meaning || entry.persianMeaning || '');
                const incomingExample = ctx.compactText(entry.example || entry.englishExample || '');
                const key = ctx.normalizeFixedExpression(phrase);
                if (!phrase || !meaning || seen.has(key)) return;

                seen.add(key);
                const sourceId = `fixed-expression::${key}`;
                if (
                    ctx.isDeletedImportedCard({
                        word: phrase,
                        category: ctx.FIXED_EXPRESSIONS_CATEGORY,
                        source: 'fixed-expressions',
                        sourceId,
                    })
                )
                    return;

                const existing = ctx.appData.cards.find(
                    (card) =>
                        card.sourceId === sourceId ||
                        (ctx.normalizeCategory(card.category) === ctx.FIXED_EXPRESSIONS_CATEGORY &&
                            ctx.normalizeFixedExpression(card.word) === key)
                );

                if (existing) {
                    if (existing.sourceId !== sourceId && ctx.isManualCard(existing)) return;

                    const before = JSON.stringify({
                        meaning: existing.meaning,
                        example: existing.example,
                        notes: existing.notes,
                        source: existing.source,
                        sourceId: existing.sourceId,
                        sourceLine: existing.sourceLine,
                    });

                    if (!existing.meaning) existing.meaning = meaning;
                    if (!existing.example && incomingExample) existing.example = incomingExample;
                    if (!existing.source) existing.source = 'fixed-expressions';
                    if (!existing.sourceId) existing.sourceId = sourceId;
                    if (!existing.sourceLine && entry.sourceLine) existing.sourceLine = entry.sourceLine;

                    const after = JSON.stringify({
                        meaning: existing.meaning,
                        example: existing.example,
                        notes: existing.notes,
                        source: existing.source,
                        sourceId: existing.sourceId,
                        sourceLine: existing.sourceLine,
                    });
                    if (before !== after) updated++;
                    return;
                }

                ctx.appData.cards.push({
                    id: ctx.generateId(),
                    word: phrase,
                    pronunciation: '',
                    audioUrl: '',
                    meaning,
                    example: incomingExample,
                    notes: '',
                    category: ctx.FIXED_EXPRESSIONS_CATEGORY,
                    box: 1,
                    lastReviewed: null,
                    createdAt: new Date(now + index).toISOString(),
                    reviewCount: 0,
                    source: 'fixed-expressions',
                    sourceId,
                    sourceLine: entry.sourceLine || '',
                });
                added++;
            });

            if (added || updated) {
                ctx.currentPage = 1;
                await ctx.saveData();
                ctx.populateCategoryFilter();
                ctx.updateDashboard();
                ctx.renderCards();
            }

            return { added, updated };
        },
        syncFixedExpressions: async function syncFixedExpressions(silent = true) {
            let entries = ctx.getEmbeddedFixedExpressionEntries();

            if (location.protocol !== 'file:') {
                try {
                    const res = await fetch(`${ctx.FIXED_EXPRESSIONS_MD_URL}?t=${Date.now()}`, { cache: 'no-store' });
                    if (res.ok) {
                        entries = ctx.parseFixedExpressionsMarkdown(await res.text());
                    }
                } catch (e) {
                    console.error(e);
                }
            }

            const result = await ctx.upsertFixedExpressionEntries(entries);
            if (!silent && result.added > 0) {
                ctx.showToast(`${ctx.toPersianNumber(result.added)} عبارت ثابت اضافه شد`, 'success');
            }
            return result;
        },
        upsertTopicPhraseEntries: async function upsertTopicPhraseEntries(entries) {
            const seen = new Set();
            let added = 0;
            let updated = 0;
            let skippedDuplicates = 0;
            const now = Date.now();

            entries.forEach((entry, index) => {
                const phrase = ctx.compactText(entry.phrase || entry.word || '');
                const meaning = ctx.compactText(entry.meaning || entry.persianMeaning || '');
                const notes = ctx.compactText(entry.notes || entry.description || '');
                const category = ctx.normalizeCategory(entry.category);
                const incomingExample = ctx.compactText(entry.example || entry.englishExample || '');
                const key = ctx.normalizeFixedExpression(phrase);
                const scopedKey = `${category}::${key}`;
                if (!phrase || !meaning || seen.has(scopedKey)) return;

                seen.add(scopedKey);
                const sourceId = `topic-md::${category}::${key}`;
                if (
                    ctx.isDeletedImportedCard({
                        word: phrase,
                        category,
                        source: 'topic-md',
                        sourceId,
                    })
                )
                    return;

                const existing = ctx.appData.cards.find(
                    (card) =>
                        card.sourceId === sourceId ||
                        (ctx.normalizeCategory(card.category) === category &&
                            ctx.normalizeFixedExpression(card.word) === key)
                );

                if (existing) {
                    if (existing.sourceId !== sourceId && ctx.isManualCard(existing)) {
                        skippedDuplicates++;
                        return;
                    }

                    const before = JSON.stringify({
                        meaning: existing.meaning,
                        example: existing.example,
                        notes: existing.notes,
                        source: existing.source,
                        sourceId: existing.sourceId,
                        sourceFile: existing.sourceFile,
                        sourceLine: existing.sourceLine,
                        sourceSection: existing.sourceSection,
                    });

                    if (!existing.meaning) existing.meaning = meaning;
                    if (!existing.example && incomingExample) existing.example = incomingExample;
                    if (!existing.notes && notes) existing.notes = notes;
                    if (!existing.source) existing.source = 'topic-md';
                    if (!existing.sourceId) existing.sourceId = sourceId;
                    if (!existing.sourceFile && entry.sourceFile) existing.sourceFile = entry.sourceFile;
                    if (!existing.sourceLine && entry.sourceLine) existing.sourceLine = entry.sourceLine;
                    if (!existing.sourceSection && entry.sourceSection) existing.sourceSection = entry.sourceSection;

                    const after = JSON.stringify({
                        meaning: existing.meaning,
                        example: existing.example,
                        notes: existing.notes,
                        source: existing.source,
                        sourceId: existing.sourceId,
                        sourceFile: existing.sourceFile,
                        sourceLine: existing.sourceLine,
                        sourceSection: existing.sourceSection,
                    });
                    if (before !== after) updated++;
                    return;
                }

                ctx.appData.cards.push({
                    id: ctx.generateId(),
                    word: phrase,
                    pronunciation: '',
                    audioUrl: '',
                    meaning,
                    example: incomingExample,
                    notes,
                    category,
                    box: 1,
                    lastReviewed: null,
                    createdAt: new Date(now + index).toISOString(),
                    reviewCount: 0,
                    source: 'topic-md',
                    sourceId,
                    sourceFile: entry.sourceFile || '',
                    sourceLine: entry.sourceLine || '',
                    sourceSection: entry.sourceSection || '',
                });
                added++;
            });

            if (added || updated) {
                ctx.currentPage = 1;
                await ctx.saveData();
                ctx.populateCategoryFilter();
                ctx.updateDashboard();
                ctx.renderCards();
            }

            return { added, updated, skippedDuplicates };
        },
        syncTopicMarkdownPhrases: async function syncTopicMarkdownPhrases(silent = true) {
            const embeddedEntries = ctx.getEmbeddedTopicPhraseEntries();
            let entries = embeddedEntries;

            if (location.protocol !== 'file:') {
                const fetched = [];
                await Promise.all(
                    ctx.TOPIC_MARKDOWN_SOURCES.map(async (source) => {
                        try {
                            const res = await fetch(`${encodeURI(source.file)}?t=${Date.now()}`, { cache: 'no-store' });
                            if (!res.ok) return;
                            const text = await res.text();
                            fetched.push(
                                ...ctx.parseMarkdownPhraseEntries(
                                    text,
                                    {
                                        category: source.category,
                                        sourceFile: source.file,
                                    },
                                    { excludeAcademicPhrases: true }
                                )
                            );
                        } catch (e) {
                            console.error(e);
                        }
                    })
                );
                if (fetched.length > 0) entries = [...fetched, ...embeddedEntries];
            }

            const result = await ctx.upsertTopicPhraseEntries(entries);
            if (!silent && result.added > 0) {
                ctx.showToast(`${ctx.toPersianNumber(result.added)} عبارت موضوعی اضافه شد`, 'success');
            }
            return result;
        },
        shouldPreserveExistingExample: function shouldPreserveExistingExample(card) {
            return (
                ctx.normalizeCategory(card.category) === ctx.COLLOCATION_INTERMEDIATE_CATEGORY &&
                ctx.compactText(card.example || '') &&
                !ctx.isWeakGeneratedExample(card.example)
            );
        },
    });
}

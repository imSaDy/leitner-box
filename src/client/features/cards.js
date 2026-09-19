/** cards: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        applyPhoneticToCard: function applyPhoneticToCard(card, phData) {
            if (!card || !phData) return false;
            const nextPronunciation = phData.phonetic || '';
            const nextAudioUrl = phData.audioUrl || '';
            if ((card.pronunciation || '') === nextPronunciation && (card.audioUrl || '') === nextAudioUrl)
                return false;
            card.pronunciation = nextPronunciation;
            card.audioUrl = nextAudioUrl;
            return true;
        },
        fetchAndApplyCardPhonetic: async function fetchAndApplyCardPhonetic(cardId, word) {
            try {
                const cached =
                    ctx.lastFetchResult && ctx.lastFetchResult.word === word.trim().toLowerCase()
                        ? ctx.lastFetchResult
                        : null;
                const result = cached || (await ctx.fetchPhonetic(word, { abortPrevious: false, updateCache: false }));
                if (!result) return;
                await ctx.whenIdle();
                await ctx.runMutation(async () => {
                    const card = ctx.appData.cards.find((c) => c.id === cardId);
                    if (
                        !card ||
                        ctx.isSentenceCard(card) ||
                        ctx.normalizeFixedExpression(card.word) !== ctx.normalizeFixedExpression(word)
                    )
                        return;
                    if (!ctx.applyPhoneticToCard(card, result)) return;
                    await ctx.saveData();
                    ctx.renderCards();
                    ctx.refreshReviewCardIfVisible(cardId);
                });
            } catch (error) {
                if (error.name !== 'AbortError') console.warn('Pronunciation update failed', error);
            }
        },
        addCard: async function addCard(data) {
            const category = ctx.ensureCustomCategory(data.category);
            const cardType = ctx.normalizeCardFormType(data.cardType);
            const word = data.word.trim();
            if (ctx.hasDuplicateCardInCategory(category, word)) {
                ctx.showToast(
                    cardType === ctx.CARD_TYPE_SENTENCE
                        ? 'این جمله در همین دسته قبلاً وجود دارد'
                        : 'این کلمه یا عبارت در همین دسته قبلاً وجود دارد',
                    'error'
                );
                return false;
            }

            const card = {
                id: ctx.generateId(),
                cardType,
                word,
                pronunciation: '',
                audioUrl: '',
                meaning: data.meaning.trim(),
                example: cardType === ctx.CARD_TYPE_SENTENCE ? '' : data.example ? data.example.trim() : '',
                hint: cardType === ctx.CARD_TYPE_SENTENCE ? (data.hint ? data.hint.trim() : '') : '',
                notes: data.notes ? data.notes.trim() : '',
                category,
                box: 1,
                lastReviewed: null,
                createdAt: new Date().toISOString(),
                reviewCount: 0,
            };

            const cleanWord = card.word.toLowerCase();
            const cachedPhData =
                cardType === ctx.CARD_TYPE_VOCABULARY && ctx.lastFetchResult && ctx.lastFetchResult.word === cleanWord
                    ? ctx.lastFetchResult
                    : null;
            if (cachedPhData) ctx.applyPhoneticToCard(card, cachedPhData);

            ctx.appData.cards.push(card);
            if (!(await ctx.saveData())) {
                ctx.appData.cards = ctx.appData.cards.filter((c) => c.id !== card.id);
                ctx.showToast('کارت ذخیره نشد؛ لطفاً دوباره تلاش کن', 'error');
                return false;
            }
            ctx.lastFetchResult = null;
            ctx.updateDashboard();
            ctx.renderCards();
            ctx.showToast(
                cardType === ctx.CARD_TYPE_SENTENCE ? 'کارت جمله با موفقیت اضافه شد ✅' : 'کارت با موفقیت اضافه شد ✅',
                'success'
            );
            if (cardType === ctx.CARD_TYPE_VOCABULARY && !cachedPhData)
                ctx.fetchAndApplyCardPhonetic(card.id, card.word);
            return true;
        },
        updateCard: async function updateCard(id, data) {
            const card = ctx.appData.cards.find((c) => c.id === id);
            if (!card) return false;

            const nextCardType = ctx.normalizeCardFormType(data.cardType);
            const nextWord = data.word.trim();
            const nextCategory = ctx.ensureCustomCategory(data.category);
            if (ctx.hasDuplicateCardInCategory(nextCategory, nextWord, id)) {
                ctx.showToast(
                    nextCardType === ctx.CARD_TYPE_SENTENCE
                        ? 'یک کارت با همین جمله در همین دسته وجود دارد'
                        : 'یک کارت با همین کلمه یا عبارت در همین دسته وجود دارد',
                    'error'
                );
                return false;
            }

            const wordChanged = ctx.normalizeFixedExpression(card.word) !== ctx.normalizeFixedExpression(nextWord);
            const typeChanged = ctx.getCardType(card) !== nextCardType;
            card.cardType = nextCardType;
            card.word = nextWord;
            card.meaning = data.meaning.trim();
            card.example = nextCardType === ctx.CARD_TYPE_SENTENCE ? '' : data.example ? data.example.trim() : '';
            card.hint = nextCardType === ctx.CARD_TYPE_SENTENCE ? (data.hint ? data.hint.trim() : '') : '';
            card.notes = data.notes ? data.notes.trim() : '';
            card.category = nextCategory;

            if (nextCardType === ctx.CARD_TYPE_SENTENCE) {
                card.pronunciation = '';
                card.audioUrl = '';
            } else if (wordChanged || typeChanged) {
                const cachedPhData =
                    ctx.lastFetchResult && ctx.lastFetchResult.word === nextWord.toLowerCase()
                        ? ctx.lastFetchResult
                        : null;
                if (cachedPhData) {
                    ctx.applyPhoneticToCard(card, cachedPhData);
                } else {
                    card.pronunciation = '';
                    card.audioUrl = '';
                }
            }

            if (!(await ctx.saveData())) {
                ctx.showToast('ویرایش کارت ذخیره نشد؛ لطفاً دوباره تلاش کن', 'error');
                return false;
            }
            ctx.lastFetchResult = null;
            ctx.updateDashboard();
            ctx.renderCards();
            ctx.refreshReviewCardIfVisible(id);
            ctx.showToast('کارت ویرایش شد ✏️', 'success');
            if (
                nextCardType === ctx.CARD_TYPE_VOCABULARY &&
                (wordChanged || typeChanged) &&
                !card.pronunciation &&
                !card.audioUrl
            )
                ctx.fetchAndApplyCardPhonetic(id, card.word);
            return true;
        },
        getCardsByIds: function getCardsByIds(ids) {
            const wanted = new Set(ids.map((id) => String(id || '')));
            return ctx.appData.cards.filter((card) => wanted.has(card.id));
        },
        moveCardsToAdjacentBox: async function moveCardsToAdjacentBox(ids, direction) {
            const step = direction > 0 ? 1 : -1;
            const uniqueIds = Array.from(new Set(ids.map((id) => String(id || '')).filter(Boolean)));
            if (uniqueIds.length === 0) return false;

            const cardsToMove = ctx.getCardsByIds(uniqueIds);
            if (cardsToMove.length === 0) {
                ctx.clearCardSelection();
                ctx.showToast('کارت انتخاب‌شده‌ای پیدا نشد', 'info');
                return false;
            }

            const now = new Date().toISOString();
            let movedCount = 0;
            let skippedCount = 0;

            cardsToMove.forEach((card) => {
                const currentBox = ctx.normalizeBoxNumber(card.box);
                const nextBox = ctx.normalizeBoxNumber(currentBox + step);

                if (nextBox === currentBox) {
                    skippedCount++;
                    return;
                }

                card.box = nextBox;
                card.lastReviewed = step > 0 ? now : null;
                card.reviewCount = (Number(card.reviewCount) || 0) + 1;
                movedCount++;
            });

            if (movedCount === 0) {
                const boundaryMessage =
                    step > 0
                        ? 'کارت انتخاب‌شده‌ای برای انتقال به جعبه بعدی وجود ندارد'
                        : 'کارت انتخاب‌شده‌ای برای انتقال به جعبه قبلی وجود ندارد';
                ctx.updateBulkSelectionUI();
                ctx.showToast(boundaryMessage, 'info');
                return false;
            }

            if (!ctx.appData.stats) ctx.appData.stats = ctx.emptyStats();
            ctx.appData.stats.totalReviews = (Number(ctx.appData.stats.totalReviews) || 0) + movedCount;
            if (step > 0) {
                ctx.appData.stats.correctAnswers = (Number(ctx.appData.stats.correctAnswers) || 0) + movedCount;
            } else {
                ctx.appData.stats.wrongAnswers = (Number(ctx.appData.stats.wrongAnswers) || 0) + movedCount;
            }
            ctx.recordReviewActivityDate();

            if (!(await ctx.saveData())) {
                ctx.updateDashboard();
                ctx.renderCards();
                ctx.showToast('انتقال کارت‌ها ذخیره نشد', 'error');
                return false;
            }

            uniqueIds.forEach((id) => ctx.selectedCardIds.delete(id));
            ctx.updateDashboard();
            ctx.populateCategoryFilter();
            ctx.renderCards();

            const targetLabel = step > 0 ? 'جعبه بعدی' : 'جعبه قبلی';
            const skippedMessage =
                skippedCount > 0 ? `، ${ctx.toPersianNumber(skippedCount)} کارت در مرز جعبه بود` : '';
            ctx.showToast(
                `${ctx.toPersianNumber(movedCount)} کارت به ${targetLabel} منتقل شد${skippedMessage}`,
                'success'
            );
            return true;
        },
        moveSelectedCardsToAdjacentBox: function moveSelectedCardsToAdjacentBox(direction) {
            return ctx.moveCardsToAdjacentBox(ctx.getSelectedCardIds(), direction);
        },
        deleteCards: async function deleteCards(ids) {
            const uniqueIds = Array.from(new Set(ids.map((id) => String(id || '')).filter(Boolean)));
            if (uniqueIds.length === 0) return false;

            const cardsToDelete = ctx.getCardsByIds(uniqueIds);
            if (cardsToDelete.length === 0) return false;

            const deleteIds = new Set(cardsToDelete.map((card) => card.id));
            cardsToDelete.forEach(ctx.markImportedCardDeleted);
            ctx.appData.cards = ctx.appData.cards.filter((card) => !deleteIds.has(card.id));

            if (!(await ctx.saveData({ allowCardRemoval: true }))) {
                ctx.updateDashboard();
                ctx.renderCards();
                ctx.showToast('حذف کارت ذخیره نشد', 'error');
                return false;
            }

            cardsToDelete.forEach((card) => ctx.selectedCardIds.delete(card.id));
            ctx.updateDashboard();
            ctx.populateCategoryFilter();
            ctx.renderCards();
            const message =
                cardsToDelete.length === 1
                    ? 'کارت حذف شد 🗑️'
                    : `${ctx.toPersianNumber(cardsToDelete.length)} کارت حذف شد 🗑️`;
            ctx.showToast(message, 'info');
            return true;
        },
        deleteCard: function deleteCard(id) {
            return ctx.deleteCards([id]);
        },
        addToeflSampleCards: async function addToeflSampleCards() {
            const existingKeys = new Set(ctx.appData.cards.map(ctx.getCardCategoryTermKey).filter(Boolean));
            const samples = ctx.getToeflSampleWords();
            const now = Date.now();
            const cardsToAdd = [];

            samples.forEach((item, index) => {
                const key = ctx.getCategoryTermKey(item.category, item.word);
                if (existingKeys.has(key)) return;
                existingKeys.add(key);
                cardsToAdd.push({
                    id: ctx.generateId(),
                    word: item.word,
                    pronunciation: '',
                    audioUrl: '',
                    meaning: item.meaning,
                    example: '',
                    notes: 'واژه پیشنهادی برای تمرین موضوعی تافل',
                    category: item.category,
                    box: 1,
                    lastReviewed: null,
                    createdAt: new Date(now + index).toISOString(),
                    reviewCount: 0,
                    source: 'toefl-sample-pack',
                });
            });

            if (cardsToAdd.length === 0) {
                ctx.showToast('همه واژگان نمونه قبلاً اضافه شده‌اند', 'info');
                return;
            }

            ctx.appData.cards.push(...cardsToAdd);
            ctx.currentPage = 1;
            ctx.currentCategory = 'all';
            await ctx.saveData();
            ctx.populateCategoryFilter();
            ctx.updateDashboard();
            ctx.renderCards();
            ctx.showToast(`${ctx.toPersianNumber(cardsToAdd.length)} کارت نمونه تافل اضافه شد`, 'success');
        },
    });
}

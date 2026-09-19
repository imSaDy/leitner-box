/** card-editor: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        openModal: function openModal(id) {
            document.getElementById(id).classList.add('active');
            document.body.style.overflow = 'hidden';
        },
        isReviewActive: function isReviewActive() {
            const reviewOverlay = document.getElementById('reviewOverlay');
            return reviewOverlay && reviewOverlay.classList.contains('active');
        },
        closeModal: function closeModal(id) {
            document.getElementById(id).classList.remove('active');
            document.body.style.overflow =
                document.querySelector('.modal-overlay.active') || ctx.isReviewActive() ? 'hidden' : '';
        },
        populateCategorySelect: function populateCategorySelect(inputEl) {
            if (!inputEl) return;
            const datalist = document.getElementById('categoryList');
            if (!datalist) return;
            datalist.innerHTML = '';
            const allCategories = [...ctx.CATEGORIES, ...(ctx.appData.customCategories || [])];
            const seen = new Set();
            allCategories.forEach((cat) => {
                const key = String(cat || '')
                    .trim()
                    .toLowerCase();
                if (!key || seen.has(key)) return;
                seen.add(key);
                const opt = document.createElement('option');
                opt.value = cat;
                datalist.appendChild(opt);
            });
        },
        normalizeCardFormType: function normalizeCardFormType(type) {
            return type === ctx.CARD_TYPE_SENTENCE ? ctx.CARD_TYPE_SENTENCE : ctx.CARD_TYPE_VOCABULARY;
        },
        setCardFormType: function setCardFormType(type, options = {}) {
            const cardType = ctx.normalizeCardFormType(type);
            ctx.activeCardFormType = cardType;
            const isSentence = cardType === ctx.CARD_TYPE_SENTENCE;

            const inputCardType = document.getElementById('inputCardType');
            if (inputCardType) inputCardType.value = cardType;

            document.querySelectorAll('.card-type-option').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.cardType === cardType);
            });

            const vocabularyWordGroup = document.getElementById('vocabularyWordGroup');
            const sentenceTextGroup = document.getElementById('sentenceTextGroup');
            const vocabularyMeaningGroup = document.getElementById('vocabularyMeaningGroup');
            const sentenceMeaningGroup = document.getElementById('sentenceMeaningGroup');
            const vocabularyExampleGroup = document.getElementById('vocabularyExampleGroup');
            const sentenceHintGroup = document.getElementById('sentenceHintGroup');
            const phoneticHint = document.getElementById('phoneticHint');

            if (vocabularyWordGroup) vocabularyWordGroup.style.display = isSentence ? 'none' : '';
            if (sentenceTextGroup) sentenceTextGroup.style.display = isSentence ? '' : 'none';
            if (vocabularyMeaningGroup) vocabularyMeaningGroup.style.display = isSentence ? 'none' : '';
            if (sentenceMeaningGroup) sentenceMeaningGroup.style.display = isSentence ? '' : 'none';
            if (vocabularyExampleGroup) vocabularyExampleGroup.style.display = isSentence ? 'none' : '';
            if (sentenceHintGroup) sentenceHintGroup.style.display = isSentence ? '' : 'none';
            if (phoneticHint) phoneticHint.style.display = isSentence ? 'none' : '';

            const inputWord = document.getElementById('inputWord');
            const inputSentence = document.getElementById('inputSentence');
            const inputMeaning = document.getElementById('inputMeaning');
            const inputSentenceMeaning = document.getElementById('inputSentenceMeaning');
            const inputExample = document.getElementById('inputExample');
            const inputSentenceHint = document.getElementById('inputSentenceHint');

            if (inputWord) {
                inputWord.required = !isSentence;
                inputWord.disabled = isSentence;
            }
            if (inputSentence) {
                inputSentence.required = isSentence;
                inputSentence.disabled = !isSentence;
            }
            if (inputMeaning) {
                inputMeaning.required = !isSentence;
                inputMeaning.disabled = isSentence;
            }
            if (inputSentenceMeaning) {
                inputSentenceMeaning.required = isSentence;
                inputSentenceMeaning.disabled = !isSentence;
            }
            if (inputExample) inputExample.disabled = isSentence;
            if (inputSentenceHint) inputSentenceHint.disabled = !isSentence;

            if (isSentence) {
                ctx.clearWordStatus();
                ctx.lastFetchResult = null;
            }

            if (options.focus) {
                const target = isSentence ? inputSentence : inputWord;
                setTimeout(() => target && target.focus(), 50);
            }
        },
        getCardFormData: function getCardFormData() {
            const cardType = ctx.normalizeCardFormType(document.getElementById('inputCardType').value);
            const isSentence = cardType === ctx.CARD_TYPE_SENTENCE;
            return {
                cardType,
                word: isSentence
                    ? document.getElementById('inputSentence').value
                    : document.getElementById('inputWord').value,
                meaning: isSentence
                    ? document.getElementById('inputSentenceMeaning').value
                    : document.getElementById('inputMeaning').value,
                example: isSentence ? '' : document.getElementById('inputExample').value,
                hint: isSentence ? document.getElementById('inputSentenceHint').value : '',
                notes: document.getElementById('inputNotes').value,
                category: document.getElementById('inputCategory').value,
            };
        },
        openAddCard: function openAddCard() {
            document.getElementById('modalTitle').textContent = 'کارت جدید';
            document.getElementById('cardForm').reset();
            document.getElementById('editCardId').value = '';
            ctx.setCardFormType(ctx.CARD_TYPE_VOCABULARY);
            document.getElementById('inputExample').dataset.autoExample = 'false';
            document.getElementById('btnSaveCard').querySelector('span').textContent = 'ذخیره کارت';
            const catInput = document.getElementById('inputCategory');
            ctx.populateCategorySelect(catInput);
            if (catInput) {
                const preferredCategory =
                    ctx.lastAddCardCategory || (ctx.currentCategory !== 'all' ? ctx.currentCategory : 'General');
                catInput.value = preferredCategory || 'General';
            }
            const hint = document.getElementById('categoryNewHint');
            if (hint) hint.style.display = 'none';
            ctx.clearWordStatus();
            ctx.lastFetchResult = null;
            ctx.openModal('cardModal');
            setTimeout(() => document.getElementById('inputWord').focus(), 300);
        },
        resetAddCardFormForNextEntry: function resetAddCardFormForNextEntry(category) {
            clearTimeout(ctx.wordDebounce);
            ctx.wordDebounce = null;
            document.getElementById('inputWord').value = '';
            document.getElementById('inputSentence').value = '';
            document.getElementById('inputMeaning').value = '';
            document.getElementById('inputSentenceMeaning').value = '';
            document.getElementById('inputExample').value = '';
            document.getElementById('inputExample').dataset.autoExample = 'false';
            document.getElementById('inputSentenceHint').value = '';
            document.getElementById('inputNotes').value = '';
            document.getElementById('editCardId').value = '';
            document.getElementById('modalTitle').textContent = 'کارت جدید';
            ctx.setCardFormType(ctx.activeCardFormType);
            document.getElementById('btnSaveCard').querySelector('span').textContent = 'ذخیره کارت';
            const catInput = document.getElementById('inputCategory');
            if (catInput) catInput.value = category;
            const hint = document.getElementById('categoryNewHint');
            if (hint) hint.style.display = 'none';
            ctx.clearWordStatus();
            ctx.lastFetchResult = null;
            setTimeout(
                () =>
                    document
                        .getElementById(
                            ctx.activeCardFormType === ctx.CARD_TYPE_SENTENCE ? 'inputSentence' : 'inputWord'
                        )
                        .focus(),
                50
            );
        },
        openEditCard: function openEditCard(id) {
            const card = ctx.appData.cards.find((c) => c.id === id);
            if (!card) return;
            const cardType = ctx.getCardType(card);
            document.getElementById('modalTitle').textContent = 'ویرایش کارت';
            ctx.setCardFormType(cardType);
            document.getElementById('inputWord').value = cardType === ctx.CARD_TYPE_VOCABULARY ? card.word : '';
            document.getElementById('inputSentence').value = cardType === ctx.CARD_TYPE_SENTENCE ? card.word : '';
            document.getElementById('inputMeaning').value = cardType === ctx.CARD_TYPE_VOCABULARY ? card.meaning : '';
            document.getElementById('inputSentenceMeaning').value =
                cardType === ctx.CARD_TYPE_SENTENCE ? card.meaning : '';
            document.getElementById('inputExample').value =
                cardType === ctx.CARD_TYPE_VOCABULARY ? card.example || '' : '';
            document.getElementById('inputExample').dataset.autoExample = 'false';
            document.getElementById('inputSentenceHint').value =
                cardType === ctx.CARD_TYPE_SENTENCE ? card.hint || '' : '';
            document.getElementById('inputNotes').value = card.notes || '';
            document.getElementById('editCardId').value = card.id;
            document.getElementById('btnSaveCard').querySelector('span').textContent = 'بروزرسانی';
            const catInput = document.getElementById('inputCategory');
            ctx.populateCategorySelect(catInput);
            if (catInput) catInput.value = ctx.normalizeCategory(card.category);
            const hint = document.getElementById('categoryNewHint');
            if (hint) hint.style.display = 'none';
            ctx.clearWordStatus();
            if (cardType === ctx.CARD_TYPE_VOCABULARY && card.pronunciation)
                ctx.showWordStatus('success', card.pronunciation);
            ctx.lastFetchResult = null;
            ctx.openModal('cardModal');
            setTimeout(
                () =>
                    document
                        .getElementById(cardType === ctx.CARD_TYPE_SENTENCE ? 'inputSentence' : 'inputWord')
                        .focus(),
                300
            );
        },
        openDeleteConfirm: function openDeleteConfirm(id) {
            const card = ctx.appData.cards.find((c) => c.id === id);
            if (!card) return;
            ctx.deleteCardId = id;
            ctx.pendingDeleteCardIds = [id];
            document.getElementById('deleteModalTitle').textContent = '⚠️ حذف کارت';
            document.getElementById('deleteMessage').textContent = 'آیا مطمئن هستید که می‌خواهید این کارت را حذف کنید؟';
            document.getElementById('deleteWordPreview').textContent = card.word + ' → ' + card.meaning;
            document.getElementById('btnConfirmDelete').textContent = 'حذف';
            ctx.openModal('deleteModal');
        },
        openBulkDeleteConfirm: function openBulkDeleteConfirm() {
            const ids = ctx.getSelectedCardIds();
            if (ids.length === 0) {
                ctx.showToast('اول چند کارت را انتخاب کن', 'info');
                return;
            }

            const cards = ctx.getCardsByIds(ids);
            if (cards.length === 0) {
                ctx.clearCardSelection();
                ctx.showToast('کارت انتخاب‌شده‌ای پیدا نشد', 'info');
                return;
            }

            ctx.deleteCardId = null;
            ctx.pendingDeleteCardIds = cards.map((card) => card.id);
            const preview = cards
                .slice(0, 4)
                .map((card) => `${card.word} → ${card.meaning}`)
                .join('\n');
            const more = cards.length > 4 ? `\n… و ${ctx.toPersianNumber(cards.length - 4)} کارت دیگر` : '';

            document.getElementById('deleteModalTitle').textContent = '⚠️ حذف چند کارت';
            document.getElementById('deleteMessage').textContent =
                `آیا مطمئن هستید که می‌خواهید ${ctx.toPersianNumber(cards.length)} کارت انتخاب‌شده را حذف کنید؟`;
            document.getElementById('deleteWordPreview').textContent = preview + more;
            document.getElementById('btnConfirmDelete').textContent = 'حذف همه';
            ctx.openModal('deleteModal');
        },
        showWordStatus: function showWordStatus(type, text) {
            const el = document.getElementById('wordStatus');
            el.className = 'input-status ' + type;
            if (type === 'loading') {
                el.innerHTML = '<div class="spinner-small"></div> در حال دریافت اطلاعات...';
            } else if (type === 'success') {
                el.innerHTML = `<span class="status-phonetic">${ctx.escapeHtml(text)}</span>`;
            } else if (type === 'error') {
                el.innerHTML = '<span class="status-notfound">اطلاعات یافت نشد</span>';
            }
        },
        clearWordStatus: function clearWordStatus() {
            document.getElementById('wordStatus').className = 'input-status';
            document.getElementById('wordStatus').innerHTML = '';
        },
        handleWordInput: function handleWordInput() {
            const word = document.getElementById('inputWord').value.trim();
            if (!word || word.length < 2) {
                ctx.clearWordStatus();
                ctx.lastFetchResult = null;
                return;
            }

            clearTimeout(ctx.wordDebounce);
            ctx.wordDebounce = setTimeout(async () => {
                ctx.showWordStatus('loading', '');
                const result = await ctx.fetchPhonetic(word);
                if (document.getElementById('inputWord').value.trim() !== word) return;
                if (result) {
                    if (result.phonetic) ctx.showWordStatus('success', result.phonetic);
                    else ctx.showWordStatus('error', '');
                } else {
                    ctx.showWordStatus('error', '');
                    ctx.lastFetchResult = null;
                }
            }, 600);
        },
    });
}

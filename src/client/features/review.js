/** review: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        buildCombinedReviewSteps: function buildCombinedReviewSteps(cards) {
            const steps = [];
            const batchSize = ctx.normalizeCombinedReviewBatchSize(ctx.combinedReviewBatchSize);
            for (let i = 0; i < cards.length; i += batchSize) {
                const chunk = cards.slice(i, i + batchSize);
                chunk.forEach((card) =>
                    steps.push({ cardId: card.id, phase: ctx.isSentenceCard(card) ? 'sentence' : 'flashcard' })
                );
                chunk.forEach((card) => {
                    if (!ctx.isSentenceCard(card)) steps.push({ cardId: card.id, phase: 'typing' });
                });
            }
            return steps;
        },
        createReviewSteps: function createReviewSteps(cards, mode) {
            if (mode === 'combined') return ctx.buildCombinedReviewSteps(cards);
            const phase = mode === 'typing' ? 'typing' : 'flashcard';
            return cards.map((card) => ({ cardId: card.id, phase: ctx.isSentenceCard(card) ? 'sentence' : phase }));
        },
        startReviewSession: function startReviewSession(cards, boxNumber = null, category = null) {
            const shuffled = [...cards].sort(() => Math.random() - 0.5);
            const steps = ctx.createReviewSteps(shuffled, ctx.currentReviewMode);
            ctx.reviewState = {
                boxNumber,
                category,
                mode: ctx.currentReviewMode,
                cards: shuffled,
                steps,
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

            const flashcardContainer = document.getElementById('reviewCard').parentElement;
            const typingContainer = document.getElementById('typingReviewContainer');
            const sentenceContainer = document.getElementById('sentenceReviewContainer');
            document.getElementById('reviewComplete').style.display = 'none';
            flashcardContainer.style.display = 'none';
            typingContainer.style.display = 'none';
            if (sentenceContainer) sentenceContainer.style.display = 'none';
            document.getElementById('reviewActions').style.display = 'none';

            ctx.updateReviewCard();
            document.getElementById('reviewOverlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        },
        startCategoryReview: function startCategoryReview(category, boxNumber = null) {
            const normalizedCategory = ctx.normalizeCategory(category);
            const dueCards = ctx.getDueCardsForCategory(normalizedCategory, boxNumber);
            if (dueCards.length === 0) {
                ctx.showToast('کارتی برای مرور در این جعبه نیست', 'info');
                return;
            }

            ctx.startReviewSession(dueCards, boxNumber, normalizedCategory);
        },
        startReview: function startReview(boxNumber) {
            const dueCards = ctx.appData.cards.filter((c) => c.box === boxNumber && ctx.isDue(c));
            if (dueCards.length === 0) {
                ctx.showToast('کارتی برای مرور در این جعبه نیست', 'info');
                return;
            }

            ctx.startReviewSession(dueCards, boxNumber, null);
        },
        hasPendingCombinedReviewResult: function hasPendingCombinedReviewResult() {
            if (ctx.reviewState.mode !== 'combined') return false;
            return Object.values(ctx.reviewState.combinedResults || {}).some(
                (result) => result.flashcardCorrect !== null && result.typingCorrect === null
            );
        },
        isReviewCompleteVisible: function isReviewCompleteVisible() {
            const complete = document.getElementById('reviewComplete');
            return complete && complete.style.display !== 'none';
        },
        shouldConfirmReviewExit: function shouldConfirmReviewExit() {
            if (!ctx.isReviewActive() || ctx.isReviewCompleteVisible()) return false;
            const typingInput = document.getElementById('typingAnswerInput');
            const sentenceInput = document.getElementById('sentenceAnswerInput');
            return (
                ctx.reviewState.currentIndex > 0 ||
                ctx.reviewState.typedAnswered ||
                ctx.reviewState.sentenceAnswered ||
                ctx.hasPendingCombinedReviewResult() ||
                Boolean(typingInput && typingInput.value.trim()) ||
                Boolean(sentenceInput && sentenceInput.value.trim())
            );
        },
        closeReview: function closeReview(options = {}) {
            if (!options.force && ctx.shouldConfirmReviewExit()) {
                const message =
                    ctx.reviewState.mode === 'combined'
                        ? 'از مرور ترکیبی خارج می‌شوی؟ کارت‌هایی که هر دو مرحله‌شان کامل شده ذخیره شده‌اند، اما جواب‌های مرحله‌ی ناقص ذخیره نمی‌شود.'
                        : 'از مرور خارج می‌شوی؟ پاسخ‌های ثبت‌شده ذخیره شده‌اند، اما ادامه‌ی جلسه متوقف می‌شود.';
                if (!confirm(ctx.i18n.text(message))) return;
            }

            document.getElementById('reviewOverlay').classList.remove('active');
            ctx.clearReviewAutoPronunciation();
            ctx.clearReviewCardVisualState();
            document.body.style.overflow = document.querySelector('.modal-overlay.active') ? 'hidden' : '';
            ctx.updateDashboard();
            ctx.renderCards();
        },
        getCurrentReviewStep: function getCurrentReviewStep() {
            const step = ctx.reviewState.steps[ctx.reviewState.currentIndex];
            if (!step) return null;

            const card =
                ctx.appData.cards.find((c) => c.id === step.cardId) ||
                ctx.reviewState.cards.find((c) => c.id === step.cardId) ||
                null;
            if (!card) return null;

            return { ...step, card };
        },
        getCurrentReviewCard: function getCurrentReviewCard() {
            const step = ctx.getCurrentReviewStep();
            return step ? step.card : null;
        },
        getCurrentReviewPhase: function getCurrentReviewPhase() {
            const step = ctx.getCurrentReviewStep();
            if (step) return step.phase;
            return ctx.reviewState.mode === 'typing' ? 'typing' : 'flashcard';
        },
        isCurrentTypingReview: function isCurrentTypingReview() {
            return ctx.getCurrentReviewPhase() === 'typing';
        },
        isCurrentSentenceReview: function isCurrentSentenceReview() {
            return ctx.getCurrentReviewPhase() === 'sentence';
        },
        editCardDuringReview: function editCardDuringReview() {
            const card = ctx.getCurrentReviewCard();
            if (!card) return;
            ctx.openEditCard(card.id);
        },
        clearReviewAutoPronunciation: function clearReviewAutoPronunciation() {
            if (ctx.reviewAutoSpeakTimer) {
                clearTimeout(ctx.reviewAutoSpeakTimer);
                ctx.reviewAutoSpeakTimer = null;
            }
            ctx.stopActivePronunciationAudio();
        },
        clearReviewCardVisualState: function clearReviewCardVisualState() {
            const cardInner = document.getElementById('reviewCardInner');
            if (cardInner) cardInner.classList.remove('flipped', 'no-transition');
            ctx.reviewState.isFlipped = false;
            const actions = document.getElementById('reviewActions');
            if (actions) actions.style.display = 'none';
        },
        resetReviewCardToFrontInstantly: function resetReviewCardToFrontInstantly(cardInner) {
            if (!cardInner) return false;
            const hadBackVisible = ctx.reviewState.isFlipped || cardInner.classList.contains('flipped');
            if (!hadBackVisible) {
                cardInner.classList.remove('no-transition');
                return false;
            }
            cardInner.classList.add('no-transition');
            cardInner.classList.remove('flipped');
            void cardInner.offsetHeight;
            ctx.reviewState.isFlipped = false;
            return hadBackVisible;
        },
        restoreReviewCardFlipAnimation: function restoreReviewCardFlipAnimation(cardInner) {
            if (!cardInner) return;
            cardInner.classList.remove('no-transition');
        },
        scheduleReviewAutoPronunciation: function scheduleReviewAutoPronunciation(card, options = {}) {
            ctx.clearReviewAutoPronunciation();
            if (ctx.isSentenceCard(card)) return;
            if (!card || !card.word) return;

            const cardId = card.id;
            const allowTyping = options.allowTyping === true;
            ctx.reviewAutoSpeakTimer = setTimeout(() => {
                ctx.reviewAutoSpeakTimer = null;
                const currentCard = ctx.getCurrentReviewCard();
                if (!ctx.isReviewActive() || !currentCard || currentCard.id !== cardId) return;
                if (ctx.isCurrentTypingReview() && !allowTyping) return;
                ctx.speakWord(currentCard.word, currentCard.audioUrl || '');
            }, ctx.REVIEW_AUTO_PRONUNCIATION_DELAY_MS);
        },
        refreshReviewCardIfVisible: function refreshReviewCardIfVisible(cardId) {
            if (!ctx.isReviewActive()) return;
            const sessionIndex = ctx.reviewState.cards.findIndex((card) => card.id === cardId);
            const stepIndex = ctx.reviewState.steps.findIndex((step) => step.cardId === cardId);
            if (sessionIndex === -1 && stepIndex === -1) return;

            const updatedCard = ctx.appData.cards.find((card) => card.id === cardId);
            if (!updatedCard) return;
            if (sessionIndex !== -1) ctx.reviewState.cards[sessionIndex] = updatedCard;

            const currentStep = ctx.reviewState.steps[ctx.reviewState.currentIndex];
            if (currentStep && currentStep.cardId === cardId) {
                if (ctx.isSentenceCard(updatedCard)) {
                    currentStep.phase = 'sentence';
                    ctx.reviewState.steps = ctx.reviewState.steps.filter(
                        (step, index) =>
                            index <= ctx.reviewState.currentIndex || step.cardId !== cardId || step.phase !== 'typing'
                    );
                    delete ctx.reviewState.combinedResults[cardId];
                } else if (currentStep.phase === 'sentence') {
                    currentStep.phase = ctx.reviewState.mode === 'typing' ? 'typing' : 'flashcard';
                    if (ctx.reviewState.mode === 'combined') {
                        currentStep.phase = 'flashcard';
                        const nextStep = ctx.reviewState.steps[ctx.reviewState.currentIndex + 1];
                        if (!nextStep || nextStep.cardId !== cardId || nextStep.phase !== 'typing') {
                            ctx.reviewState.steps.splice(ctx.reviewState.currentIndex + 1, 0, {
                                cardId,
                                phase: 'typing',
                            });
                        }
                    }
                }
                ctx.updateReviewCard();
            }
        },
        updateReviewCard: function updateReviewCard() {
            const card = ctx.getCurrentReviewCard();
            if (!card) return;

            const phase = ctx.getCurrentReviewPhase();
            const total = ctx.reviewState.steps.length || ctx.reviewState.cards.length;
            const current = ctx.reviewState.currentIndex + 1;

            document.getElementById('reviewCurrent').textContent = current;
            document.getElementById('reviewTotal').textContent = total;
            document.getElementById('reviewProgressFill').style.width = `${(current / total) * 100}%`;

            if (phase === 'typing') {
                document.getElementById('reviewCard').parentElement.style.display = 'none';
                document.getElementById('typingReviewContainer').style.display = 'flex';
                const sentenceContainer = document.getElementById('sentenceReviewContainer');
                if (sentenceContainer) sentenceContainer.style.display = 'none';
                ctx.updateTypingReviewCard(card);
                return;
            }

            if (phase === 'sentence') {
                document.getElementById('reviewCard').parentElement.style.display = 'none';
                document.getElementById('typingReviewContainer').style.display = 'none';
                const sentenceContainer = document.getElementById('sentenceReviewContainer');
                if (sentenceContainer) sentenceContainer.style.display = 'flex';
                ctx.updateSentenceReviewCard(card);
                return;
            }

            document.getElementById('reviewCard').parentElement.style.display = 'flex';
            document.getElementById('typingReviewContainer').style.display = 'none';
            const sentenceContainer = document.getElementById('sentenceReviewContainer');
            if (sentenceContainer) sentenceContainer.style.display = 'none';

            const cardInner = document.getElementById('reviewCardInner');
            const wasFlipped = ctx.resetReviewCardToFrontInstantly(cardInner);

            // Now safely update content; the front face is showing and the back is hidden.
            document.getElementById('reviewWord').textContent = card.word;
            document.getElementById('reviewPronunciation').textContent = card.pronunciation || '';
            document.getElementById('reviewBoxBadge').textContent = ctx.PERSIAN_BOX_NAMES[card.box];

            document.getElementById('reviewWordBack').textContent = card.word;
            document.getElementById('reviewMeaning').textContent = card.meaning;
            document.getElementById('reviewBoxBadgeBack').textContent = ctx.PERSIAN_BOX_NAMES[card.box];

            // Show category badge
            const reviewCategory = ctx.normalizeCategory(card.category);
            const catBadge = document.getElementById('reviewCategoryBadge');
            if (catBadge) catBadge.textContent = reviewCategory;
            const catBadgeBack = document.getElementById('reviewCategoryBadgeBack');
            if (catBadgeBack) catBadgeBack.textContent = reviewCategory;

            const exSec = document.getElementById('reviewExample');
            if (card.example) {
                exSec.style.display = 'flex';
                document.getElementById('reviewExampleText').textContent = card.example;
            } else {
                exSec.style.display = 'none';
            }

            const noteSec = document.getElementById('reviewNotes');
            if (card.notes) {
                noteSec.style.display = 'block';
                document.getElementById('reviewNotesText').textContent = card.notes;
            } else {
                noteSec.style.display = 'none';
            }

            ctx.reviewState.isFlipped = false;
            document.getElementById('reviewActions').style.display = 'none';

            // Restore transition and play entrance animation in the next frame
            if (wasFlipped) {
                requestAnimationFrame(() => {
                    ctx.restoreReviewCardFlipAnimation(cardInner);
                    // Entrance animation for the new card
                    const reviewCard = document.getElementById('reviewCard');
                    reviewCard.classList.remove('card-entrance');
                    void reviewCard.offsetHeight;
                    reviewCard.classList.add('card-entrance');
                });
            } else {
                ctx.restoreReviewCardFlipAnimation(cardInner);
            }

            ctx.scheduleReviewAutoPronunciation(card);
        },
        updateTypingReviewCard: function updateTypingReviewCard(card) {
            const category = ctx.normalizeCategory(card.category);
            ctx.reviewState.typedAnswered = false;
            ctx.reviewState.typedCorrect = false;
            ctx.reviewState.typedMistakes = 0;

            document.getElementById('typingBoxBadge').textContent = ctx.PERSIAN_BOX_NAMES[card.box];
            document.getElementById('typingCategoryBadge').textContent = category;
            document.getElementById('typingMeaning').textContent = card.meaning;

            const input = document.getElementById('typingAnswerInput');
            input.value = '';
            input.disabled = false;
            input.classList.remove('correct', 'wrong');
            document.getElementById('btnCheckTypedAnswer').disabled = false;
            document.getElementById('btnGiveUpTyping').disabled = false;
            document.getElementById('btnNextTypedCard').style.display = 'none';
            document.getElementById('typingFeedback').className = 'typing-feedback';
            document.getElementById('typingFeedback').textContent = '';
            document.getElementById('typingHint').textContent = '';
            document.getElementById('typingReveal').style.display = 'none';
            document.getElementById('typingExample').style.display = 'none';
            document.getElementById('reviewActions').style.display = 'none';
            setTimeout(() => input.focus(), 100);
        },
        updateSentenceReviewCard: function updateSentenceReviewCard(card) {
            const category = ctx.normalizeCategory(card.category);
            ctx.reviewState.sentenceAnswered = false;
            ctx.reviewState.sentenceCorrect = false;

            const sentenceCard = document.querySelector('.sentence-review-card');
            if (sentenceCard) sentenceCard.classList.remove('sentence-answered');

            document.getElementById('sentenceBoxBadge').textContent = ctx.PERSIAN_BOX_NAMES[card.box];
            document.getElementById('sentenceCategoryBadge').textContent = category;
            document.getElementById('sentenceReviewMeaning').textContent = card.meaning;

            const input = document.getElementById('sentenceAnswerInput');
            input.value = '';
            input.disabled = false;
            input.classList.remove('correct', 'wrong');
            document.getElementById('btnCheckSentenceAnswer').disabled = false;
            document.getElementById('btnGiveUpSentence').disabled = false;
            document.getElementById('btnNextSentenceCard').style.display = 'none';
            document.getElementById('btnCheckSentenceAnswer').style.display = 'flex';
            document.getElementById('btnGiveUpSentence').style.display = 'flex';

            const hintButton = document.getElementById('btnShowSentenceHint');
            const hasHint = Boolean((card.hint || '').trim());
            hintButton.disabled = !hasHint;
            hintButton.title = hasHint ? 'نمایش راهنمایی' : 'برای این جمله راهنمایی ثبت نشده';
            hintButton.style.display = 'flex';

            const feedback = document.getElementById('sentenceFeedback');
            feedback.className = 'sentence-feedback';
            feedback.textContent = '';

            const hintPanel = document.getElementById('sentenceHintPanel');
            hintPanel.textContent = '';
            hintPanel.style.display = 'none';

            document.getElementById('sentenceCorrectAnswer').textContent = card.word;
            document.getElementById('sentenceReveal').style.display = 'none';
            document.getElementById('sentenceNotesReview').style.display = 'none';
            document.getElementById('reviewActions').style.display = 'none';
            ctx.clearReviewAutoPronunciation();
            setTimeout(() => input.focus(), 100);
        },
        showSentenceHint: function showSentenceHint(card) {
            if (!card || ctx.reviewState.sentenceAnswered) return;
            const feedback = document.getElementById('sentenceFeedback');
            const hintPanel = document.getElementById('sentenceHintPanel');
            const hintText = (card.hint || '').trim();
            if (!hintText) {
                feedback.className = 'sentence-feedback info';
                feedback.textContent = 'برای این جمله راهنمایی ثبت نشده';
                return;
            }
            hintPanel.textContent = hintText;
            hintPanel.style.display = 'block';
            feedback.className = 'sentence-feedback info';
            feedback.textContent = 'راهنمایی نمایش داده شد';
            document.getElementById('sentenceAnswerInput').focus();
        },
        revealSentenceAnswer: function revealSentenceAnswer(card, correct, userAnswer = '') {
            ctx.reviewState.sentenceAnswered = true;
            ctx.reviewState.sentenceCorrect = correct;

            const input = document.getElementById('sentenceAnswerInput');
            input.disabled = true;
            input.classList.toggle('correct', correct);
            input.classList.toggle('wrong', !correct);

            const feedback = document.getElementById('sentenceFeedback');
            feedback.className = `sentence-feedback ${correct ? 'correct' : 'wrong'}`;
            feedback.textContent = correct ? 'درست بود' : userAnswer ? 'نادرست بود' : 'پاسخ نمایش داده شد';

            const sentenceCard = document.querySelector('.sentence-review-card');
            if (sentenceCard) sentenceCard.classList.add('sentence-answered');
            const hintPanel = document.getElementById('sentenceHintPanel');
            hintPanel.textContent = '';
            hintPanel.style.display = 'none';

            document.getElementById('sentenceCorrectAnswer').textContent = card.word;
            document.getElementById('sentenceReveal').style.display = 'flex';

            const notes = document.getElementById('sentenceNotesReview');
            const noteText = (card.notes || '').trim();
            if (noteText) {
                notes.textContent = noteText;
                notes.style.display = 'block';
            } else {
                notes.style.display = 'none';
            }

            document.getElementById('btnCheckSentenceAnswer').disabled = true;
            document.getElementById('btnGiveUpSentence').disabled = true;
            document.getElementById('btnShowSentenceHint').disabled = true;
            document.getElementById('btnCheckSentenceAnswer').style.display = 'none';
            document.getElementById('btnGiveUpSentence').style.display = 'none';
            document.getElementById('btnShowSentenceHint').style.display = 'none';
            document.getElementById('btnNextSentenceCard').style.display = 'flex';
            document.getElementById('btnNextSentenceCard').focus();
        },
        checkSentenceAnswer: function checkSentenceAnswer() {
            const card = ctx.getCurrentReviewCard();
            if (!card || ctx.reviewState.sentenceAnswered) return;

            const input = document.getElementById('sentenceAnswerInput');
            const userAnswer = input.value.trim();
            if (!userAnswer) {
                const feedback = document.getElementById('sentenceFeedback');
                feedback.className = 'sentence-feedback info';
                feedback.textContent = 'اول جمله انگلیسی را تایپ کن';
                input.focus();
                return;
            }

            const correct = ctx.normalizeSentenceAnswer(userAnswer) === ctx.normalizeSentenceAnswer(card.word);
            ctx.revealSentenceAnswer(card, correct, userAnswer);
        },
        giveUpSentenceAnswer: function giveUpSentenceAnswer() {
            const card = ctx.getCurrentReviewCard();
            if (!card || ctx.reviewState.sentenceAnswered) return;
            ctx.revealSentenceAnswer(card, false, '');
        },
        advanceSentenceCard: function advanceSentenceCard() {
            if (!ctx.reviewState.sentenceAnswered) {
                ctx.checkSentenceAnswer();
                return;
            }
            ctx.answerCard(ctx.reviewState.sentenceCorrect);
        },
        revealTypedAnswer: function revealTypedAnswer(card, correct, userAnswer = '') {
            ctx.reviewState.typedAnswered = true;
            ctx.reviewState.typedCorrect = correct;

            const input = document.getElementById('typingAnswerInput');
            input.disabled = true;
            input.classList.toggle('correct', correct);
            input.classList.toggle('wrong', !correct);

            const feedback = document.getElementById('typingFeedback');
            feedback.className = `typing-feedback ${correct ? 'correct' : 'wrong'}`;
            feedback.textContent = correct ? 'درست بود' : userAnswer ? 'نادرست بود' : 'پاسخ نمایش داده شد';
            document.getElementById('typingHint').textContent = '';

            document.getElementById('typingAnswerWord').textContent = card.word;
            document.getElementById('typingAnswerPronunciation').textContent = card.pronunciation || '';
            document.getElementById('typingReveal').style.display = 'flex';

            const example = document.getElementById('typingExample');
            if (card.example) {
                example.textContent = card.example;
                example.style.display = 'block';
            } else {
                example.style.display = 'none';
            }

            document.getElementById('btnCheckTypedAnswer').disabled = true;
            document.getElementById('btnGiveUpTyping').disabled = true;
            document.getElementById('btnNextTypedCard').style.display = 'flex';
            document.getElementById('btnNextTypedCard').focus();
            ctx.scheduleReviewAutoPronunciation(card, { allowTyping: true });
        },
        showTypingHint: function showTypingHint(card) {
            const feedback = document.getElementById('typingFeedback');
            const hint = document.getElementById('typingHint');
            const input = document.getElementById('typingAnswerInput');
            const remaining = ctx.MAX_TYPING_HINTS - ctx.reviewState.typedMistakes;

            feedback.className = 'typing-feedback wrong';
            feedback.textContent =
                remaining > 0
                    ? `غلط بود؛ ${ctx.toPersianNumber(remaining)} فرصت دیگر داری`
                    : 'غلط بود؛ آخرین تلاش را انجام بده';
            hint.textContent = `Hint: ${ctx.createSpellingHint(card.word, ctx.reviewState.typedMistakes)}`;
            input.value = '';
            input.classList.remove('correct');
            input.classList.add('wrong');
            setTimeout(() => {
                input.classList.remove('wrong');
                input.focus();
            }, 250);
        },
        checkTypedAnswer: function checkTypedAnswer() {
            const card = ctx.getCurrentReviewCard();
            if (!card || ctx.reviewState.typedAnswered) return;

            const input = document.getElementById('typingAnswerInput');
            const userAnswer = input.value.trim();
            if (!userAnswer) {
                const feedback = document.getElementById('typingFeedback');
                feedback.className = 'typing-feedback info';
                feedback.textContent = 'اول جواب انگلیسی را تایپ کن';
                input.focus();
                return;
            }

            const correct = ctx.normalizeTypedAnswer(userAnswer) === ctx.normalizeTypedAnswer(card.word);
            if (correct) {
                ctx.revealTypedAnswer(card, true, userAnswer);
                return;
            }

            if (ctx.reviewState.typedMistakes < ctx.MAX_TYPING_HINTS) {
                ctx.reviewState.typedMistakes++;
                ctx.showTypingHint(card);
                return;
            }

            ctx.revealTypedAnswer(card, false, userAnswer);
        },
        giveUpTypedAnswer: function giveUpTypedAnswer() {
            const card = ctx.getCurrentReviewCard();
            if (!card || ctx.reviewState.typedAnswered) return;
            ctx.revealTypedAnswer(card, false, '');
        },
        advanceTypedCard: function advanceTypedCard() {
            if (!ctx.reviewState.typedAnswered) {
                ctx.checkTypedAnswer();
                return;
            }
            ctx.answerCard(ctx.reviewState.typedCorrect);
        },
        flipCard: function flipCard() {
            if (ctx.reviewState.isFlipped) return;
            ctx.reviewState.isFlipped = true;
            document.getElementById('reviewCardInner').classList.add('flipped');
            document.getElementById('reviewActions').style.display = 'flex';
        },
        speakCurrentReviewCard: function speakCurrentReviewCard() {
            const card = ctx.getCurrentReviewCard();
            if (card) {
                if (ctx.isSentenceCard(card) && ctx.isCurrentSentenceReview() && !ctx.reviewState.sentenceAnswered)
                    return;
                ctx.clearReviewAutoPronunciation();
                ctx.speakWord(card.word, card.audioUrl || '');
            }
        },
        getCombinedResult: function getCombinedResult(cardId) {
            if (!ctx.reviewState.combinedResults[cardId]) {
                ctx.reviewState.combinedResults[cardId] = { flashcardCorrect: null, typingCorrect: null };
            }
            return ctx.reviewState.combinedResults[cardId];
        },
        advanceReviewStep: function advanceReviewStep() {
            ctx.reviewState.currentIndex++;
            const total = ctx.reviewState.steps.length || ctx.reviewState.cards.length;

            if (ctx.reviewState.currentIndex >= total) ctx.finishReview();
            else ctx.updateReviewCard();
        },
        answerCombinedStep: async function answerCombinedStep(original, phase, correct) {
            const result = ctx.getCombinedResult(original.id);

            if (phase === 'flashcard') {
                result.flashcardCorrect = correct === true;
                ctx.advanceReviewStep();
                return;
            }

            result.typingCorrect = correct === true;
            const finalCorrect = result.flashcardCorrect === true && result.typingCorrect === true;
            const currentBox = Number(original.box) || 1;

            if (finalCorrect) {
                ctx.reviewState.correct++;
                original.box = Math.min(currentBox + 1, 5);
            } else {
                ctx.reviewState.wrong++;
                original.box = Math.max(currentBox - 1, 1);
            }

            original.lastReviewed = new Date().toISOString();
            original.reviewCount = (original.reviewCount || 0) + 1;
            ctx.appData.stats.totalReviews++;
            if (finalCorrect) ctx.appData.stats.correctAnswers++;
            else ctx.appData.stats.wrongAnswers++;

            ctx.prepareLastReviewCommit();
            await ctx.saveData();
            ctx.advanceReviewStep();
        },
        answerCard: async function answerCard(correct) {
            const step = ctx.getCurrentReviewStep();
            const card = step ? step.card : null;
            if (!card) return;
            const original = ctx.appData.cards.find((c) => c.id === card.id);
            if (!original) return;

            if (ctx.reviewState.mode === 'combined' && step.phase !== 'sentence') {
                await ctx.answerCombinedStep(original, step.phase, correct);
                return;
            }

            const currentBox = Number(original.box) || 1;
            if (correct) {
                ctx.reviewState.correct++;
                original.box = Math.min(currentBox + 1, 5);
            } else {
                ctx.reviewState.wrong++;
                original.box = ctx.reviewState.mode === 'combined' ? Math.max(currentBox - 1, 1) : 1;
            }

            original.lastReviewed = new Date().toISOString();
            original.reviewCount = (original.reviewCount || 0) + 1;
            ctx.appData.stats.totalReviews++;
            if (correct) ctx.appData.stats.correctAnswers++;
            else ctx.appData.stats.wrongAnswers++;

            ctx.prepareLastReviewCommit();
            await ctx.saveData();
            ctx.advanceReviewStep();
        },
        deleteCardDuringReview: async function deleteCardDuringReview() {
            const card = ctx.getCurrentReviewCard();
            if (!card) return;

            if (!confirm(ctx.i18n.text(`آیا از حذف کارت «${card.word}» مطمئن هستید؟`))) return;

            ctx.markImportedCardDeleted(card);
            // Remove from main data
            ctx.appData.cards = ctx.appData.cards.filter((c) => c.id !== card.id);

            // Remove from review session
            ctx.reviewState.cards = ctx.reviewState.cards.filter((c) => c.id !== card.id);
            ctx.reviewState.steps = ctx.reviewState.steps.filter((step) => step.cardId !== card.id);
            delete ctx.reviewState.combinedResults[card.id];

            const completes = ctx.reviewState.steps.length === 0 || ctx.reviewState.cards.length === 0;
            if (completes) ctx.prepareLastReviewCommit(true);
            await ctx.saveData({ allowCardRemoval: true });

            ctx.showToast(`کارت «${card.word}» حذف شد 🗑️`, 'info');

            // If no more cards, finish review
            if (ctx.reviewState.steps.length === 0 || ctx.reviewState.cards.length === 0) {
                ctx.finishReview();
                return;
            }

            // If we were at the end, go back one
            if (ctx.reviewState.currentIndex >= ctx.reviewState.steps.length) {
                ctx.reviewState.currentIndex = ctx.reviewState.steps.length - 1;
            }

            ctx.updateReviewCard();
        },
        finishReview: function finishReview() {
            ctx.clearReviewAutoPronunciation();

            ctx.clearReviewCardVisualState();

            document.getElementById('reviewCard').parentElement.style.display = 'none';
            document.getElementById('typingReviewContainer').style.display = 'none';
            const sentenceContainer = document.getElementById('sentenceReviewContainer');
            if (sentenceContainer) sentenceContainer.style.display = 'none';
            document.getElementById('reviewActions').style.display = 'none';
            document.getElementById('reviewComplete').style.display = 'flex';

            const total = ctx.reviewState.correct + ctx.reviewState.wrong;
            document.getElementById('completeCorrect').textContent = ctx.reviewState.correct;
            document.getElementById('completeWrong').textContent = ctx.reviewState.wrong;
            document.getElementById('completeAccuracy').textContent =
                `${total > 0 ? Math.round((ctx.reviewState.correct / total) * 100) : 0}%`;
            setTimeout(() => {
                const finishButton = document.getElementById('btnFinishReview');
                if (finishButton) finishButton.focus();
            }, 50);
        },
        prepareLastReviewCommit: function prepareLastReviewCommit(force = false) {
            if (
                !force &&
                ctx.reviewState.currentIndex + 1 < (ctx.reviewState.steps.length || ctx.reviewState.cards.length)
            )
                return;
            ctx.recordReviewActivityDate();
            ctx.appData.stats.history.unshift({
                date: new Date().toISOString(),
                box: ctx.reviewState.boxNumber,
                category: ctx.reviewState.category,
                correct: ctx.reviewState.correct,
                wrong: ctx.reviewState.wrong,
                total: ctx.reviewState.cards.length,
            });
            ctx.appData.stats.history = ctx.appData.stats.history.slice(0, 50);
        },
    });
}

/** events: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        bindEvents: function bindEvents() {
            document.getElementById('btnAddCard').addEventListener('click', ctx.openAddCard);
            document.getElementById('btnAddCardEmpty').addEventListener('click', ctx.openAddCard);
            document.querySelectorAll('.mode-option').forEach((btn) => {
                btn.addEventListener('click', () => ctx.setReviewMode(btn.dataset.reviewMode));
            });
            const combinedBatchInput = document.getElementById('combinedBatchSizeInput');
            if (combinedBatchInput) {
                combinedBatchInput.addEventListener('change', () =>
                    ctx.setCombinedReviewBatchSize(combinedBatchInput.value)
                );
                combinedBatchInput.addEventListener('blur', ctx.updateCombinedReviewBatchSizeUI);
                combinedBatchInput.addEventListener('keydown', (e) => {
                    if (e.key !== 'Enter') return;
                    e.preventDefault();
                    ctx.setCombinedReviewBatchSize(combinedBatchInput.value);
                    combinedBatchInput.blur();
                });
            }

            document.getElementById('btnCloseModal').addEventListener('click', () => ctx.closeModal('cardModal'));
            document.getElementById('btnCancelModal').addEventListener('click', () => ctx.closeModal('cardModal'));
            document
                .getElementById('btnCloseCategoryBoxModal')
                .addEventListener('click', () => ctx.closeModal('categoryBoxModal'));
            document
                .getElementById('btnCancelCategoryBoxModal')
                .addEventListener('click', () => ctx.closeModal('categoryBoxModal'));

            ['cardModal', 'statsModal', 'exportModal', 'deleteModal', 'categoryBoxModal'].forEach((id) => {
                document.getElementById(id).addEventListener('click', (e) => {
                    if (e.target === e.currentTarget) ctx.closeModal(id);
                });
            });

            document.querySelectorAll('.card-type-option').forEach((btn) => {
                btn.addEventListener('click', () => ctx.setCardFormType(btn.dataset.cardType, { focus: true }));
            });
            document.getElementById('inputWord').addEventListener('input', ctx.handleWordInput);
            document.getElementById('inputExample').addEventListener('input', (e) => {
                e.target.dataset.autoExample = 'false';
            });
            document.getElementById('inputCategory').addEventListener('input', () => {
                const val = document.getElementById('inputCategory').value.trim();
                const allCats = [...ctx.CATEGORIES, ...(ctx.appData.customCategories || [])];
                const isNew =
                    val &&
                    !allCats.some(
                        (cat) =>
                            String(cat || '')
                                .trim()
                                .toLowerCase() === val.toLowerCase()
                    );
                const hint = document.getElementById('categoryNewHint');
                if (hint) hint.style.display = isNew ? 'flex' : 'none';
            });

            // Card form submit
            document.getElementById('cardForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const btn = document.getElementById('btnSaveCard');
                btn.disabled = true;
                btn.querySelector('span').textContent = 'در حال ذخیره...';

                const data = ctx.getCardFormData();

                data.category = ctx.normalizeCategory(data.category);

                const editId = document.getElementById('editCardId').value;
                const savedCategory = ctx.normalizeCategory(data.category);
                let saved = false;
                const idleLabel = editId ? 'بروزرسانی' : 'ذخیره کارت';
                try {
                    if (editId) {
                        saved = await ctx.updateCard(editId, data);
                        if (saved) ctx.closeModal('cardModal');
                    } else {
                        saved = await ctx.addCard(data);
                        if (saved) {
                            ctx.lastAddCardCategory = savedCategory;
                            ctx.resetAddCardFormForNextEntry(savedCategory);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    ctx.showToast('ذخیره کارت انجام نشد', 'error');
                } finally {
                    btn.disabled = false;
                    btn.querySelector('span').textContent = idleLabel;
                }

                if (!saved) return;
                ctx.populateCategoryFilter();
                ctx.renderCards();
            });

            // Delete
            document.getElementById('btnConfirmDelete').addEventListener('click', async () => {
                if (ctx.pendingDeleteCardIds.length > 0) {
                    const deleted = await ctx.deleteCards(ctx.pendingDeleteCardIds);
                    if (!deleted) return;
                    ctx.closeModal('deleteModal');
                    ctx.deleteCardId = null;
                    ctx.pendingDeleteCardIds = [];
                }
            });
            document.getElementById('btnCancelDelete').addEventListener('click', () => {
                ctx.deleteCardId = null;
                ctx.pendingDeleteCardIds = [];
                ctx.closeModal('deleteModal');
            });
            document
                .getElementById('selectPageCards')
                .addEventListener('change', (e) => ctx.setVisibleCardsSelection(e.target.checked));
            document.getElementById('btnClearSelection').addEventListener('click', ctx.clearCardSelection);
            document
                .getElementById('btnMoveSelectedPrev')
                .addEventListener('click', () => ctx.moveSelectedCardsToAdjacentBox(-1));
            document
                .getElementById('btnMoveSelectedNext')
                .addEventListener('click', () => ctx.moveSelectedCardsToAdjacentBox(1));
            document.getElementById('btnDeleteSelected').addEventListener('click', ctx.openBulkDeleteConfirm);

            // Stats
            document.getElementById('btnStats').addEventListener('click', () => {
                ctx.updateStatsModal();
                ctx.openModal('statsModal');
            });
            document.getElementById('btnCloseStats').addEventListener('click', () => ctx.closeModal('statsModal'));

            // Export/Import
            document.getElementById('btnExport').addEventListener('click', () => ctx.openModal('exportModal'));
            document.getElementById('btnCloseExport').addEventListener('click', () => ctx.closeModal('exportModal'));
            document.getElementById('btnDoExport').addEventListener('click', ctx.exportData);
            document.getElementById('importFile').addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    ctx.importData(e.target.files[0]);
                    e.target.value = '';
                }
            });

            // Review buttons (per box)
            for (let box = 1; box <= 5; box++) {
                document.getElementById(`reviewBox${box}`).addEventListener('click', () => ctx.startReview(box));
            }

            // Review interactions
            document.getElementById('reviewCard').addEventListener('click', (e) => {
                if (e.target.closest('.btn-speak')) return;
                ctx.flipCard();
            });
            document.getElementById('btnCorrect').addEventListener('click', () => ctx.answerCard(true));
            document.getElementById('btnWrong').addEventListener('click', () => ctx.answerCard(false));
            document.getElementById('btnEditDuringReview').addEventListener('click', ctx.editCardDuringReview);
            document.getElementById('btnEditDuringTyping').addEventListener('click', ctx.editCardDuringReview);
            document.getElementById('btnEditDuringSentence').addEventListener('click', ctx.editCardDuringReview);
            document.getElementById('btnDeleteDuringReview').addEventListener('click', ctx.deleteCardDuringReview);
            document.getElementById('btnDeleteDuringTyping').addEventListener('click', ctx.deleteCardDuringReview);
            document.getElementById('btnDeleteDuringSentence').addEventListener('click', ctx.deleteCardDuringReview);
            document.getElementById('btnExitReview').addEventListener('click', ctx.closeReview);
            document.getElementById('btnFinishReview').addEventListener('click', ctx.closeReview);

            document.getElementById('btnSpeakFront').addEventListener('click', (e) => {
                e.stopPropagation();
                ctx.speakCurrentReviewCard();
            });
            document.getElementById('btnSpeakBack').addEventListener('click', (e) => {
                e.stopPropagation();
                ctx.speakCurrentReviewCard();
            });
            document.getElementById('btnSpeakTyping').addEventListener('click', (e) => {
                e.stopPropagation();
                ctx.speakCurrentReviewCard();
            });
            document.getElementById('btnSpeakSentence').addEventListener('click', (e) => {
                e.stopPropagation();
                ctx.speakCurrentReviewCard();
            });
            document.getElementById('typingAnswerForm').addEventListener('submit', (e) => {
                e.preventDefault();
                ctx.checkTypedAnswer();
            });
            document.getElementById('btnGiveUpTyping').addEventListener('click', ctx.giveUpTypedAnswer);
            document.getElementById('btnNextTypedCard').addEventListener('click', ctx.advanceTypedCard);
            document.getElementById('sentenceAnswerForm').addEventListener('submit', (e) => {
                e.preventDefault();
                ctx.checkSentenceAnswer();
            });
            document
                .getElementById('btnShowSentenceHint')
                .addEventListener('click', () => ctx.showSentenceHint(ctx.getCurrentReviewCard()));
            document.getElementById('btnGiveUpSentence').addEventListener('click', ctx.giveUpSentenceAnswer);
            document.getElementById('btnNextSentenceCard').addEventListener('click', ctx.advanceSentenceCard);

            document.getElementById('btnThemeToggle').addEventListener('click', ctx.toggleTheme);

            window.addEventListener('beforeunload', (e) => {
                if (!ctx.shouldConfirmReviewExit()) return;
                e.preventDefault();
                e.returnValue = '';
            });

            // Search
            document.getElementById('searchInput').addEventListener('input', (e) => {
                ctx.currentSearch = e.target.value;
                ctx.currentPage = 1;
                ctx.renderCards();
            });
            document.getElementById('dueOnlyToggle').addEventListener('click', () => {
                ctx.currentDueOnly = !ctx.currentDueOnly;
                ctx.currentPage = 1;
                ctx.renderCards();
            });

            // Box filter tabs
            document.querySelectorAll('.filter-tab').forEach((tab) => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
                    tab.classList.add('active');
                    ctx.currentFilter = tab.dataset.filter;
                    ctx.currentPage = 1;
                    ctx.renderCards();
                });
            });

            // Category filter
            document.getElementById('categoryFilter').addEventListener('change', (e) => {
                ctx.currentCategory = e.target.value;
                ctx.currentPage = 1;
                ctx.renderCards();
            });

            // Pagination
            document.getElementById('btnPrevPage').addEventListener('click', () => {
                ctx.currentPage--;
                ctx.renderCards();
            });
            document.getElementById('btnNextPage').addEventListener('click', () => {
                ctx.currentPage++;
                ctx.renderCards();
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT')
                    return;

                const reviewActive = document.getElementById('reviewOverlay').classList.contains('active');
                if (reviewActive) {
                    if (ctx.isReviewCompleteVisible()) {
                        if (e.code === 'Enter' || e.code === 'Space' || e.code === 'Escape') {
                            e.preventDefault();
                            ctx.closeReview({ force: true });
                        }
                        return;
                    }
                    if (ctx.isCurrentTypingReview()) {
                        if (e.code === 'Enter' || e.code === 'Space') {
                            e.preventDefault();
                            ctx.advanceTypedCard();
                        }
                        if (e.code === 'KeyS') {
                            e.preventDefault();
                            ctx.speakCurrentReviewCard();
                        }
                        if (e.code === 'Escape') {
                            e.preventDefault();
                            ctx.closeReview();
                        }
                        return;
                    }
                    if (ctx.isCurrentSentenceReview()) {
                        if (e.code === 'Enter' || e.code === 'Space') {
                            e.preventDefault();
                            ctx.advanceSentenceCard();
                        }
                        if (e.code === 'KeyS') {
                            e.preventDefault();
                            ctx.speakCurrentReviewCard();
                        }
                        if (e.code === 'Escape') {
                            e.preventDefault();
                            ctx.closeReview();
                        }
                        return;
                    }
                    if ((e.code === 'Space' || e.code === 'Enter') && !ctx.reviewState.isFlipped) {
                        e.preventDefault();
                        ctx.flipCard();
                    }
                    if (e.code === 'ArrowRight' && ctx.reviewState.isFlipped) {
                        e.preventDefault();
                        ctx.answerCard(true);
                    }
                    if (e.code === 'ArrowLeft' && ctx.reviewState.isFlipped) {
                        e.preventDefault();
                        ctx.answerCard(false);
                    }
                    if (e.code === 'KeyS') {
                        e.preventDefault();
                        ctx.speakCurrentReviewCard();
                    }
                    if (e.code === 'Escape') {
                        e.preventDefault();
                        ctx.closeReview();
                    }
                } else {
                    const anyModal = document.querySelector('.modal-overlay.active');
                    if (anyModal) {
                        if (e.code === 'Escape') {
                            e.preventDefault();
                            anyModal.classList.remove('active');
                            document.body.style.overflow = '';
                        }
                        return;
                    }
                    if (e.code === 'KeyN') {
                        e.preventDefault();
                        ctx.openAddCard();
                    }
                    if (e.code === 'KeyT') {
                        e.preventDefault();
                        ctx.toggleTheme();
                    }
                }
            });

            if ('speechSynthesis' in window) {
                window.speechSynthesis.getVoices();
                window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
            }
        },
    });
}

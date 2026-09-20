/** library: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        updateDueOnlyToggleUI: function updateDueOnlyToggleUI() {
            const toggle = document.getElementById('dueOnlyToggle');
            if (!toggle) return;
            toggle.classList.toggle('active', ctx.currentDueOnly);
            toggle.setAttribute('aria-pressed', ctx.currentDueOnly ? 'true' : 'false');
        },
        getFilteredCards: function getFilteredCards() {
            let filtered = [...ctx.appData.cards];
            if (ctx.currentFilter !== 'all') filtered = filtered.filter((c) => c.box === parseInt(ctx.currentFilter));
            if (ctx.currentCategory !== 'all')
                filtered = filtered.filter((c) => ctx.normalizeCategory(c.category) === ctx.currentCategory);
            if (ctx.currentDueOnly) filtered = filtered.filter(ctx.isDue);
            if (ctx.currentSearch.trim()) {
                const q = ctx.currentSearch.trim().toLowerCase();
                filtered = filtered.filter(
                    (c) =>
                        c.word.toLowerCase().includes(q) ||
                        c.meaning.toLowerCase().includes(q) ||
                        (c.pronunciation && c.pronunciation.toLowerCase().includes(q)) ||
                        ctx.normalizeCategory(c.category).toLowerCase().includes(q)
                );
            }
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            return filtered;
        },
        syncSelectedCardIds: function syncSelectedCardIds() {
            const existingIds = new Set(ctx.appData.cards.map((card) => card.id));
            Array.from(ctx.selectedCardIds).forEach((id) => {
                if (!existingIds.has(id)) ctx.selectedCardIds.delete(id);
            });
        },
        getSelectedCardIds: function getSelectedCardIds() {
            ctx.syncSelectedCardIds();
            return Array.from(ctx.selectedCardIds);
        },
        getSelectedCards: function getSelectedCards() {
            return ctx.getCardsByIds(ctx.getSelectedCardIds());
        },
        updateBulkSelectionUI: function updateBulkSelectionUI() {
            ctx.syncSelectedCardIds();

            const selectedIds = ctx.getSelectedCardIds();
            const selectedCards = ctx.getSelectedCards();
            const bar = document.getElementById('bulkActionsBar');
            const count = document.getElementById('selectedCardsCount');
            const deleteBtn = document.getElementById('btnDeleteSelected');
            const movePrevBtn = document.getElementById('btnMoveSelectedPrev');
            const moveNextBtn = document.getElementById('btnMoveSelectedNext');
            const selectPage = document.getElementById('selectPageCards');
            const pageCheckboxes = Array.from(document.querySelectorAll('.card-select-checkbox'));
            const canMovePrev = selectedCards.some((card) => ctx.normalizeBoxNumber(card.box) > 1);
            const canMoveNext = selectedCards.some((card) => ctx.normalizeBoxNumber(card.box) < 5);

            if (bar) bar.style.display = selectedIds.length > 0 ? 'flex' : 'none';
            if (count) count.textContent = `${ctx.toPersianNumber(selectedIds.length)} کارت انتخاب شده`;
            if (deleteBtn) deleteBtn.disabled = selectedIds.length === 0;
            if (movePrevBtn) movePrevBtn.disabled = selectedIds.length === 0 || !canMovePrev;
            if (moveNextBtn) moveNextBtn.disabled = selectedIds.length === 0 || !canMoveNext;

            document.querySelectorAll('.card-row').forEach((row) => {
                row.classList.toggle('selected', ctx.selectedCardIds.has(row.dataset.id));
            });

            if (selectPage) {
                const pageIds = pageCheckboxes.map((input) => input.dataset.id);
                const selectedOnPage = pageIds.filter((id) => ctx.selectedCardIds.has(id)).length;
                selectPage.disabled = pageIds.length === 0;
                selectPage.checked = pageIds.length > 0 && selectedOnPage === pageIds.length;
                selectPage.indeterminate = selectedOnPage > 0 && selectedOnPage < pageIds.length;
            }
        },
        setVisibleCardsSelection: function setVisibleCardsSelection(selected) {
            document.querySelectorAll('.card-select-checkbox').forEach((input) => {
                if (selected) ctx.selectedCardIds.add(input.dataset.id);
                else ctx.selectedCardIds.delete(input.dataset.id);
                input.checked = selected;
            });
            ctx.updateBulkSelectionUI();
        },
        clearCardSelection: function clearCardSelection() {
            ctx.selectedCardIds.clear();
            document.querySelectorAll('.card-select-checkbox').forEach((input) => {
                input.checked = false;
            });
            ctx.updateBulkSelectionUI();
        },
        renderCards: function renderCards() {
            const emptyState = document.getElementById('emptyState');
            const tableWrapper = document.getElementById('cardsTableWrapper');
            const tbody = document.getElementById('cardsTableBody');
            ctx.syncSelectedCardIds();
            ctx.updateDueOnlyToggleUI();

            if (ctx.appData.cards.length === 0) {
                emptyState.style.display = '';
                tableWrapper.style.display = 'none';
                ctx.updateBulkSelectionUI();
                return;
            }

            emptyState.style.display = 'none';
            tableWrapper.style.display = '';

            const filtered = ctx.getFilteredCards();
            const totalPages = Math.max(1, Math.ceil(filtered.length / ctx.ITEMS_PER_PAGE));
            if (ctx.currentPage > totalPages) ctx.currentPage = totalPages;
            if (ctx.currentPage < 1) ctx.currentPage = 1;

            const startIdx = (ctx.currentPage - 1) * ctx.ITEMS_PER_PAGE;
            const pageItems = filtered.slice(startIdx, startIdx + ctx.ITEMS_PER_PAGE);

            tbody.innerHTML = '';

            if (filtered.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--text-muted);">کارتی با این فیلتر پیدا نشد</td></tr>`;
            } else {
                pageItems.forEach((card, i) => {
                    const tr = document.createElement('tr');
                    tr.className = `card-row ${ctx.selectedCardIds.has(card.id) ? 'selected' : ''}`;
                    tr.dataset.id = card.id;
                    tr.dataset.box = card.box;
                    tr.style.animationDelay = `${i * 0.03}s`;
                    const dueLabel = ctx.isDue(card)
                        ? '<span class="status-due">🔔 آماده</span>'
                        : '<span class="status-wait">⏳ انتظار</span>';
                    const cat = ctx.normalizeCategory(card.category);
                    const sentence = ctx.isSentenceCard(card);
                    const leadControl = sentence
                        ? '<span class="card-type-chip">جمله</span>'
                        : `<button class="btn-speak-mini" data-word="${ctx.escapeHtml(card.word)}" data-audio="${ctx.escapeHtml(card.audioUrl || '')}" title="پخش تلفظ">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
                            </button>`;
                    const phoneticCell = sentence
                        ? '<span class="phonetic-text sentence-type-label">تمرین جمله</span>'
                        : `<span class="phonetic-text">${ctx.escapeHtml(card.pronunciation || '—')}</span>`;

                    tr.innerHTML = `
                    <td class="col-select">
                        <label class="table-checkbox" title="انتخاب این کارت">
                            <input type="checkbox" class="card-select-checkbox" data-id="${ctx.escapeHtml(card.id)}" ${ctx.selectedCardIds.has(card.id) ? 'checked' : ''}>
                            <span></span>
                        </label>
                    </td>
                    <td class="col-word">
                        <div class="cell-word-group">
                            ${leadControl}
                            <span class="word-text ${sentence ? 'sentence-word-text' : ''}">${ctx.escapeHtml(card.word)}</span>
                        </div>
                    </td>
                    <td class="col-phonetic">${phoneticCell}</td>
                    <td class="col-meaning">${ctx.escapeHtml(card.meaning)}</td>
                    <td class="col-category"><span class="category-badge">${ctx.escapeHtml(cat)}</span></td>
                    <td class="col-box"><span class="box-badge box-badge-${card.box}">${ctx.PERSIAN_BOX_NAMES[card.box]}</span></td>
                    <td class="col-status">${dueLabel}</td>
                    <td class="col-actions">
                        <div class="row-actions">
                            <button class="card-action-btn edit" data-id="${ctx.escapeHtml(card.id)}" title="ویرایش">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="card-action-btn delete" data-id="${ctx.escapeHtml(card.id)}" title="حذف">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                `;
                    tbody.appendChild(tr);
                });
            }

            // Pagination
            document.getElementById('currentPage').textContent = ctx.toPersianNumber(ctx.currentPage);
            document.getElementById('totalPages').textContent = ctx.toPersianNumber(totalPages);
            document.getElementById('btnPrevPage').disabled = ctx.currentPage <= 1;
            document.getElementById('btnNextPage').disabled = ctx.currentPage >= totalPages;
            document.getElementById('pagination').style.display = totalPages <= 1 ? 'none' : 'flex';

            // Bind actions
            tbody.querySelectorAll('.card-action-btn.edit').forEach((btn) => {
                btn.addEventListener('click', () => ctx.openEditCard(btn.dataset.id));
            });
            tbody.querySelectorAll('.card-action-btn.delete').forEach((btn) => {
                btn.addEventListener('click', () => ctx.openDeleteConfirm(btn.dataset.id));
            });
            tbody.querySelectorAll('.card-select-checkbox').forEach((input) => {
                input.addEventListener('change', () => {
                    if (input.checked) ctx.selectedCardIds.add(input.dataset.id);
                    else ctx.selectedCardIds.delete(input.dataset.id);
                    ctx.updateBulkSelectionUI();
                });
            });
            tbody.querySelectorAll('.btn-speak-mini').forEach((btn) => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    ctx.speakWord(btn.dataset.word, btn.dataset.audio || '');
                });
            });
            ctx.updateBulkSelectionUI();
        },
    });
}

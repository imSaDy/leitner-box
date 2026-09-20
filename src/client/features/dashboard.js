/** dashboard: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        updateDashboard: function updateDashboard() {
            const total = ctx.appData.cards.length;
            const mastered = ctx.appData.cards.filter((c) => c.box === 5).length;
            let totalDue = 0;

            document.getElementById('totalCards').textContent = total;
            document.getElementById('masteredCards').textContent = mastered;

            for (let box = 1; box <= 5; box++) {
                const bc = ctx.appData.cards.filter((c) => c.box === box);
                const dc = bc.filter(ctx.isDue);
                totalDue += dc.length;
                document.getElementById(`box${box}Count`).textContent = bc.length;
                const pct = total > 0 ? (bc.length / total) * 100 : 0;
                document.getElementById(`box${box}Progress`).style.width = `${pct}%`;
                document.getElementById(`box${box}Due`).innerHTML =
                    `<span class="due-badge">${ctx.toPersianNumber(dc.length)} کارت آماده مرور</span>`;
                document.getElementById(`reviewBox${box}`).disabled = dc.length === 0;
            }

            document.getElementById('dueCards').textContent = totalDue;

            // Update category review section
            ctx.updateCategoryReview();
        },
        updateCategoryReview: function updateCategoryReview() {
            const container = document.getElementById('categoryReviewList');
            if (!container) return;
            container.innerHTML = '';

            // Get categories that have due cards
            const catMap = Object.create(null);
            ctx.appData.cards.forEach((c) => {
                const cat = ctx.normalizeCategory(c.category);
                if (!catMap[cat]) catMap[cat] = { total: 0, due: 0 };
                catMap[cat].total++;
                if (ctx.isDue(c)) catMap[cat].due++;
            });

            const cats = Object.entries(catMap).sort((a, b) => b[1].due - a[1].due || a[0].localeCompare(b[0]));

            if (cats.length === 0) {
                container.innerHTML = '<div class="cat-empty">هنوز کارتی اضافه نشده</div>';
                return;
            }

            cats.forEach(([cat, info]) => {
                const div = document.createElement('div');
                div.className = 'cat-review-item';
                if (info.due === 0) div.classList.add('no-due');
                div.innerHTML = `
                <div class="cat-review-info">
                    <span class="cat-review-name">${ctx.escapeHtml(cat)}</span>
                    <span class="cat-review-count">${ctx.toPersianNumber(info.total)} کارت · ${ctx.toPersianNumber(info.due)} آماده</span>
                </div>
                <button class="cat-review-btn" data-category="${ctx.escapeHtml(cat)}" ${info.due === 0 ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    مرور
                </button>
            `;
                container.appendChild(div);
            });

            // Bind review buttons
            container.querySelectorAll('.cat-review-btn').forEach((btn) => {
                btn.addEventListener('click', () => ctx.openCategoryBoxPicker(btn.dataset.category));
            });
        },
        getDueCardsForCategory: function getDueCardsForCategory(category, boxNumber = null) {
            const normalizedCategory = ctx.normalizeCategory(category);
            return ctx.appData.cards.filter((card) => {
                if (ctx.normalizeCategory(card.category) !== normalizedCategory) return false;
                if (boxNumber !== null && Number(card.box) !== Number(boxNumber)) return false;
                return ctx.isDue(card);
            });
        },
        getCategoryBoxStats: function getCategoryBoxStats(category) {
            const normalizedCategory = ctx.normalizeCategory(category);
            const stats = {};
            for (let box = 1; box <= 5; box++) stats[box] = { total: 0, due: 0 };

            ctx.appData.cards.forEach((card) => {
                if (ctx.normalizeCategory(card.category) !== normalizedCategory) return;
                const box = Math.min(5, Math.max(1, Number(card.box) || 1));
                stats[box].total++;
                if (ctx.isDue(card)) stats[box].due++;
            });

            return stats;
        },
        renderCategoryBoxPicker: function renderCategoryBoxPicker(category) {
            const picker = document.getElementById('categoryBoxPicker');
            if (!picker) return;
            const normalizedCategory = ctx.normalizeCategory(category);
            const stats = ctx.getCategoryBoxStats(normalizedCategory);
            const allDue = Object.values(stats).reduce((sum, info) => sum + info.due, 0);
            const allTotal = Object.values(stats).reduce((sum, info) => sum + info.total, 0);

            document.getElementById('categoryBoxModalTitle').textContent = normalizedCategory;
            picker.innerHTML = `
            <button class="category-box-option category-box-option-all" type="button" data-category="${ctx.escapeHtml(normalizedCategory)}" data-box="all" ${allDue === 0 ? 'disabled' : ''}>
                <span class="category-box-option-title">همه جعبه‌ها</span>
                <span class="category-box-option-count">${ctx.toPersianNumber(allDue)} آماده از ${ctx.toPersianNumber(allTotal)}</span>
            </button>
            ${[1, 2, 3, 4, 5]
                .map(
                    (box) => `
                <button class="category-box-option" type="button" data-category="${ctx.escapeHtml(normalizedCategory)}" data-box="${box}" ${stats[box].due === 0 ? 'disabled' : ''}>
                    <span class="category-box-option-title">${ctx.PERSIAN_BOX_NAMES[box]}</span>
                    <span class="category-box-option-count">${ctx.toPersianNumber(stats[box].due)} آماده از ${ctx.toPersianNumber(stats[box].total)}</span>
                </button>
            `
                )
                .join('')}
        `;

            picker.querySelectorAll('.category-box-option').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const selectedBox = btn.dataset.box === 'all' ? null : Number(btn.dataset.box);
                    ctx.closeModal('categoryBoxModal');
                    ctx.startCategoryReview(btn.dataset.category, selectedBox);
                });
            });
        },
        openCategoryBoxPicker: function openCategoryBoxPicker(category) {
            const normalizedCategory = ctx.normalizeCategory(category);
            if (ctx.getDueCardsForCategory(normalizedCategory).length === 0) {
                ctx.showToast('کارتی برای مرور در این دسته نیست', 'info');
                return;
            }
            ctx.renderCategoryBoxPicker(normalizedCategory);
            ctx.openModal('categoryBoxModal');
        },
        populateCategoryFilter: function populateCategoryFilter() {
            const select = document.getElementById('categoryFilter');
            if (!select) return;
            const current = ctx.currentCategory || select.value || 'all';
            select.innerHTML = '<option value="all">همه دسته‌ها</option>';
            // Get categories that actually have cards
            const usedCats = new Set(ctx.appData.cards.map((c) => ctx.normalizeCategory(c.category)));
            const allCats = [...ctx.CATEGORIES, ...(ctx.appData.customCategories || [])];
            const seenCats = new Set();
            allCats.forEach((cat) => {
                const key = String(cat || '')
                    .trim()
                    .toLowerCase();
                if (!key || seenCats.has(key)) return;
                seenCats.add(key);
                const normalizedCat = ctx.normalizeCategory(cat);
                if (usedCats.has(normalizedCat)) {
                    const count = ctx.appData.cards.filter(
                        (c) => ctx.normalizeCategory(c.category) === normalizedCat
                    ).length;
                    const opt = document.createElement('option');
                    opt.setAttribute('translate', 'no');
                    opt.value = normalizedCat;
                    opt.textContent = `${normalizedCat} (${count})`;
                    select.appendChild(opt);
                }
            });
            const hasCurrent = Array.from(select.options).some((opt) => opt.value === current);
            select.value = hasCurrent ? current : 'all';
            ctx.currentCategory = select.value;
        },
    });
}

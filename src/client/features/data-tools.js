/** data-tools: extracted behavior; dependencies and mutable session state live in ctx. */
export function install(ctx) {
    Object.assign(ctx, {
        updateStatsModal: function updateStatsModal() {
            document.getElementById('statTotalCards').textContent = ctx.appData.cards.length;
            document.getElementById('statTotalReviews').textContent = ctx.appData.stats.totalReviews;
            const ta = ctx.appData.stats.correctAnswers + ctx.appData.stats.wrongAnswers;
            document.getElementById('statAccuracy').textContent =
                `${ta > 0 ? Math.round((ctx.appData.stats.correctAnswers / ta) * 100) : 0}%`;
            const lastReview = ctx.appData.stats.lastReviewDate;
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            document.getElementById('statStreak').textContent =
                !lastReview || [today.toDateString(), yesterday.toDateString()].includes(lastReview)
                    ? ctx.appData.stats.streak
                    : 0;

            const maxC = Math.max(
                1,
                ...[1, 2, 3, 4, 5].map((b) => ctx.appData.cards.filter((c) => c.box === b).length)
            );
            for (let b = 1; b <= 5; b++) {
                const count = ctx.appData.cards.filter((c) => c.box === b).length;
                document.getElementById(`chartBar${b}`).style.height =
                    `${Math.max(3, maxC > 0 ? (count / maxC) * 100 : 0)}%`;
                document.getElementById(`chartValue${b}`).textContent = count;
            }

            const hc = document.getElementById('historyList');
            hc.innerHTML = '';
            if (ctx.appData.stats.history.length === 0) {
                hc.innerHTML = '<div class="history-empty">هنوز مروری انجام نشده</div>';
            } else {
                ctx.appData.stats.history.slice(0, 20).forEach((e) => {
                    const d = document.createElement('div');
                    d.className = 'history-item';
                    const label = e.category ? e.category : e.box ? ctx.PERSIAN_BOX_NAMES[e.box] : '';
                    d.innerHTML = `<span class="history-date">${ctx.formatDate(e.date)} · ${ctx.escapeHtml(label)}</span><div class="history-result"><span class="history-correct">✅ ${ctx.escapeHtml(e.correct)}</span><span class="history-wrong">❌ ${ctx.escapeHtml(e.wrong)}</span></div>`;
                    hc.appendChild(d);
                });
            }
        },
        exportData: function exportData() {
            ctx.downloadJson(
                {
                    format: 'leitner-backup-v2',
                    createdAt: new Date().toISOString(),
                    state: ctx.repository.snapshot.state,
                    preferences: ctx.repository.snapshot.preferences,
                },
                'leitner-backup-' + new Date().toISOString().slice(0, 10) + '.json'
            );
            ctx.showToast('نسخهٔ پشتیبان دانلود شد', 'success');
        },
        importData: async function importData(file) {
            try {
                const imported = ctx.decodeImport(JSON.parse(await file.text())).state;
                if (imported.cards && Array.isArray(imported.cards)) {
                    const existingIds = new Set(ctx.appData.cards.map((c) => c.id));
                    const existingCategoryTermKeys = new Set(
                        ctx.appData.cards.map(ctx.getCardCategoryTermKey).filter(Boolean)
                    );
                    const importedDeletedIds = Array.isArray(imported.deletedImportedSourceIds)
                        ? imported.deletedImportedSourceIds
                        : [];
                    const deletedIds = new Set([
                        ...ctx.normalizeDeletedImportedSourceIds(ctx.appData),
                        ...importedDeletedIds.map((id) => String(id || '').trim()).filter(Boolean),
                    ]);
                    ctx.appData.deletedImportedSourceIds = Array.from(deletedIds);

                    let addedCount = 0;
                    let skippedDuplicates = 0;
                    imported.cards.forEach((card) => {
                        if (existingIds.has(card.id)) return;

                        card.category = ctx.normalizeCategory(card.category);
                        const categoryTermKey = ctx.getCardCategoryTermKey(card);
                        if (categoryTermKey && existingCategoryTermKeys.has(categoryTermKey)) {
                            skippedDuplicates++;
                            return;
                        }

                        ctx.appData.cards.push(card);
                        existingIds.add(card.id);
                        if (categoryTermKey) existingCategoryTermKeys.add(categoryTermKey);
                        addedCount++;
                    });
                    ctx.syncCustomCategoriesFromCards();
                    await ctx.saveData();
                    ctx.populateCategoryFilter();
                    ctx.updateDashboard();
                    ctx.renderCards();
                    const duplicateNote =
                        skippedDuplicates > 0 ? `، ${ctx.toPersianNumber(skippedDuplicates)} تکراری رد شد` : '';
                    ctx.showToast(
                        `${ctx.toPersianNumber(addedCount)} کارت جدید اضافه شد${duplicateNote} 📤`,
                        'success'
                    );
                    ctx.closeModal('exportModal');
                } else {
                    ctx.showToast('فرمت فایل نامعتبر است', 'error');
                }
            } catch (error) {
                throw error;
            }
        },
        showToast: function showToast(message, type = 'info') {
            const c = document.getElementById('toastContainer');
            const t = document.createElement('div');
            t.className = `toast toast-${type}`;
            t.textContent = message;
            c.appendChild(t);
            setTimeout(() => {
                t.classList.add('toast-out');
                setTimeout(() => t.remove(), 300);
            }, 3000);
        },
    });
}

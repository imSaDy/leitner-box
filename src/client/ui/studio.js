/* UI enhancements only: no access to card data, persistence or scheduling. */
(function () {
    'use strict';
    function initStudio() {
        const $ = (id) => document.getElementById(id);
        const fa = (value) => Number(value).toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'fa-IR');
        const observe = (element, options, callback) => {
            const observer = new MutationObserver(callback);
            observer.observe(element, options);
            return observer;
        };
        function renderToday() {
            const today = new Date();
            $('todayDate').dateTime =
                `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            $('todayDate').textContent = today.toLocaleDateString(
                document.documentElement.lang === 'en' ? 'en-US' : 'fa-IR',
                { weekday: 'long', day: 'numeric', month: 'long' }
            );
        }
        renderToday();

        // Delegate the welcome action to an existing review button. Its disabled
        // state is the authority; this layer never computes which cards are due.
        function syncWelcome() {
            const total = Number($('totalCards').textContent) || 0;
            const due = Number($('dueCards').textContent) || 0;
            const firstReady = [...document.querySelectorAll('.box-review-btn')].find((button) => !button.disabled);
            const start = $('btnStudyStart');
            start.disabled = total > 0 && !firstReady;
            $('studyStartLabel').textContent = !total
                ? 'اولین کارت را بسازید'
                : firstReady
                  ? 'شروع مرور'
                  : 'مرورهای امروز انجام شده';
            $('studyMessage').textContent = !total
                ? 'یادگیری از یک واژه شروع می‌شود. اولین کارت را بسازید.'
                : due
                  ? `${fa(due)} کارت آماده است؛ امروز هم فرصتی برای به خاطر سپردن.`
                  : 'در حال حاضر کارتی آمادهٔ مرور نیست. به‌موقع برگردید و ادامه دهید.';
            $('studyCaption').textContent =
                firstReady && total
                    ? `شروع از جعبهٔ ${fa(firstReady.dataset.box)} · روش مرور را پایین انتخاب کنید`
                    : !total
                      ? 'کلمه، عبارت یا جمله؛ با مثال‌ها و یادداشت‌های خودتان.'
                      : 'می‌توانید کارت تازه اضافه کنید یا کتابخانه را ببینید.';
            syncLibrary();
        }
        $('btnStudyStart').addEventListener('click', () => {
            if (!(Number($('totalCards').textContent) || 0)) {
                $('btnAddCard').click();
                return;
            }
            const firstReady = [...document.querySelectorAll('.box-review-btn')].find((button) => !button.disabled);
            if (firstReady) firstReady.click();
        });
        observe($('headerStats'), { childList: true, subtree: true, characterData: true }, syncWelcome);
        syncWelcome();

        const modeHelp = {
            flashcard: 'کارت را ببینید، پاسخ را به یاد بیاورید و خودتان ارزیابی کنید.',
            typing: 'معنی فارسی را ببینید و معادل انگلیسی را تایپ کنید.',
            combined: 'اول مرور کارت‌ها، بعد تمرین تایپ؛ تعداد کارت‌های هر بسته را انتخاب کنید.',
        };
        function syncModes() {
            document.querySelectorAll('.mode-option').forEach((button) => {
                const active = button.classList.contains('active');
                button.setAttribute('aria-pressed', String(active));
                if (active) $('modeExplainer').textContent = modeHelp[button.dataset.reviewMode];
            });
        }
        observe($('reviewModeToggle'), { attributes: true, subtree: true, attributeFilter: ['class'] }, syncModes);
        syncModes();

        let showAllTopics = false;
        function filterTopics() {
            const query = $('topicSearch').value.trim().toLocaleLowerCase();
            const items = [...$('categoryReviewList').querySelectorAll('.cat-review-item')];
            let matches = 0;
            items.forEach((item) => {
                const name = item.querySelector('.cat-review-name');
                name.title = name.textContent;
                const match = name.textContent.toLocaleLowerCase().includes(query);
                item.hidden = !match || (!query && !showAllTopics && matches >= 6);
                if (match) matches++;
                const button = item.querySelector('.cat-review-btn');
                button.setAttribute('aria-label', `مرور موضوع ${name.textContent}`);
            });
            $('topicCount').textContent = items.length ? `${fa(items.length)} موضوع` : '';
            $('topicNoResults').hidden = !query || matches > 0 || !items.length;
            const more = $('btnTopicsMore');
            more.hidden = items.length <= 6 || Boolean(query);
            more.setAttribute('aria-expanded', String(showAllTopics));
            more.textContent = showAllTopics ? 'نمایش کمتر ↑' : `نمایش همهٔ ${fa(items.length)} موضوع ↓`;
        }
        $('topicSearch').addEventListener('input', filterTopics);
        $('btnTopicsMore').addEventListener('click', () => {
            showAllTopics = !showAllTopics;
            filterTopics();
            if (!showAllTopics) $('topicSearch').focus({ preventScroll: true });
        });
        observe($('categoryReviewList'), { childList: true }, filterTopics);
        filterTopics();

        function syncLibrary() {
            const filtered = Boolean(
                $('searchInput').value ||
                $('categoryFilter').value !== 'all' ||
                $('dueOnlyToggle').getAttribute('aria-pressed') === 'true' ||
                !document.querySelector('.filter-tab[data-filter="all"]').classList.contains('active')
            );
            $('btnClearFilters').hidden = !filtered;
            const rows = $('cardsTableBody').querySelectorAll('.card-row');
            $('libraryPageCount').textContent =
                rows.length && $('cardsTableWrapper').style.display !== 'none'
                    ? `${fa(rows.length)} کارت در این صفحه`
                    : '';
            rows.forEach((row) => {
                const word = row.querySelector('.word-text').textContent;
                row.querySelector('.word-text').title = word;
                row.querySelector('.card-select-checkbox').setAttribute('aria-label', `انتخاب ${word}`);
                row.querySelector('.card-action-btn.edit').setAttribute('aria-label', `ویرایش ${word}`);
                row.querySelector('.card-action-btn.delete').setAttribute('aria-label', `حذف ${word}`);
            });
            document
                .querySelectorAll('.filter-tab')
                .forEach((button) => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
        }
        $('btnClearFilters').addEventListener('click', () => {
            $('searchInput').value = '';
            $('searchInput').dispatchEvent(new Event('input', { bubbles: true }));
            $('categoryFilter').value = 'all';
            $('categoryFilter').dispatchEvent(new Event('change', { bubbles: true }));
            if ($('dueOnlyToggle').getAttribute('aria-pressed') === 'true') $('dueOnlyToggle').click();
            document.querySelector('.filter-tab[data-filter="all"]').click();
            $('searchInput').focus({ preventScroll: true });
        });
        observe($('cardsTableBody'), { childList: true }, syncLibrary);
        syncLibrary();
        $('selectPageCards').setAttribute('aria-label', 'انتخاب همهٔ کارت‌های این صفحه');

        // Dialog semantics and a Tab-only focus boundary. Existing Escape,
        // review answers, confirmation dialogs and form submission are untouched.
        const overlays = [...document.querySelectorAll('.modal-overlay'), $('reviewOverlay')];
        const backgrounds = [
            $('appHeader'),
            $('studyDesk'),
            $('shortcutsHint'),
            document.querySelector('.storage-bar'),
        ];
        const returnTargets = new Map();
        let currentOverlay = null;
        overlays.forEach((overlay) => {
            const title = overlay.querySelector('h2');
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('tabindex', '-1');
            if (overlay.id === 'reviewOverlay') overlay.setAttribute('aria-label', 'جلسهٔ مرور');
            else if (title) {
                if (!title.id) title.id = `${overlay.id}Heading`;
                overlay.setAttribute('aria-labelledby', title.id);
            } else overlay.setAttribute('aria-label', overlay.id === 'reviewOverlay' ? 'جلسهٔ مرور' : 'پنجرهٔ برنامه');
            observe(overlay, { attributes: true, attributeFilter: ['class'] }, syncOverlays);
        });
        function activeOverlay() {
            if (!$('persistenceOverlay').hidden) return $('persistenceOverlay');
            if (!$('storageSetup').hidden) return $('storageSetup');
            const modals = overlays.filter(
                (overlay) => overlay.id !== 'reviewOverlay' && overlay.classList.contains('active')
            );
            return modals.at(-1) || ($('reviewOverlay').classList.contains('active') ? $('reviewOverlay') : null);
        }
        function focusables(overlay) {
            return [...overlay.querySelectorAll('button, a[href], input, textarea, select, [tabindex="0"]')].filter(
                (element) =>
                    !element.disabled &&
                    !element.closest('[inert]') &&
                    element.getClientRects().length &&
                    getComputedStyle(element).visibility !== 'hidden'
            );
        }
        function syncOverlays() {
            const next = activeOverlay();
            backgrounds.forEach((element) => {
                element.inert = Boolean(next);
            });
            overlays.forEach((overlay) => {
                overlay.inert = overlay !== next;
            });
            if (next === currentOverlay) return;
            const previous = currentOverlay;
            currentOverlay = next;
            if (next && !returnTargets.has(next)) returnTargets.set(next, document.activeElement);
            if (previous && (previous.hidden || !previous.classList.contains('active'))) {
                const target = returnTargets.get(previous);
                returnTargets.delete(previous);
                if (target && target.isConnected && !target.disabled && (!next || next.contains(target)))
                    target.focus({ preventScroll: true });
            }
            if (next && !next.contains(document.activeElement)) {
                // Let the original form/review code choose its input first.
                requestAnimationFrame(() => {
                    if (activeOverlay() === next && !next.contains(document.activeElement))
                        (focusables(next)[0] || next).focus({ preventScroll: true });
                });
            }
        }
        for (const id of ['storageSetup', 'persistenceOverlay']) {
            $(id).tabIndex = -1;
            observe($(id), { attributes: true, attributeFilter: ['hidden'] }, syncOverlays);
        }
        syncOverlays();
        function syncCardFaces() {
            const flipped = $('reviewCardInner').classList.contains('flipped');
            const front = document.querySelector('.review-card-front');
            const back = document.querySelector('.review-card-back');
            front.inert = flipped;
            back.inert = !flipped;
            front.setAttribute('aria-hidden', String(flipped));
            back.setAttribute('aria-hidden', String(!flipped));
        }
        observe($('reviewCardInner'), { attributes: true, attributeFilter: ['class'] }, syncCardFaces);
        syncCardFaces();
        document.addEventListener('keydown', (event) => {
            const overlay = activeOverlay();
            if (event.key === 'Tab' && overlay) {
                const items = focusables(overlay);
                const first = items[0] || overlay;
                const last = items.at(-1) || overlay;
                if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement))) {
                    event.preventDefault();
                    last.focus();
                } else if (
                    !event.shiftKey &&
                    (document.activeElement === last || !items.includes(document.activeElement))
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }
            if (
                event.key === '/' &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey &&
                !overlay &&
                !event.target.closest('input, textarea, select, [contenteditable="true"]')
            ) {
                event.preventDefault();
                $('searchInput').focus();
            }
        });
        document.querySelectorAll('button[title]').forEach((button) => {
            if (!button.hasAttribute('aria-label') && !button.textContent.trim())
                button.setAttribute('aria-label', button.title);
        });
        document.querySelectorAll('.btn-close').forEach((button) => button.setAttribute('aria-label', 'بستن پنجره'));
        $('typingAnswerInput').setAttribute('aria-label', 'پاسخ انگلیسی');
        $('sentenceAnswerInput').setAttribute('aria-label', 'جملهٔ انگلیسی');

        const navLinks = [...document.querySelectorAll('.workspace-nav a')];
        const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href')));
        let scrollQueued = false;
        function syncNavigation() {
            scrollQueued = false;
            let index = 0;
            sections.forEach((section, i) => {
                if (section.getBoundingClientRect().top < 160) index = i;
            });
            navLinks.forEach((link, i) => {
                link.classList.toggle('active', i === index);
                if (i === index) link.setAttribute('aria-current', 'location');
                else link.removeAttribute('aria-current');
            });
        }
        window.addEventListener(
            'scroll',
            () => {
                if (!scrollQueued) {
                    scrollQueued = true;
                    requestAnimationFrame(syncNavigation);
                }
            },
            { passive: true }
        );
        syncNavigation();
        document.addEventListener('leitner-language-change', () => {
            renderToday();
            syncWelcome();
            syncModes();
            filterTopics();
            syncLibrary();
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStudio);
    else initStudio();
})();

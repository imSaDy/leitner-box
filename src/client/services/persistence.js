import { ApiClient } from './api.js';
import { pendingStore } from './pending-store.js';
import { validateState, validatePreferences } from '../../shared/validation.js';

/** Acknowledged writes only. Retries retain the SAME operation ID and payload. */
export class Persistence extends EventTarget {
    api = new ApiClient();
    snapshot = null;
    pending = null;
    blocked = false;
    #retry = null;
    #retryTimer = null;

    notify(status, message = '') {
        this.dispatchEvent(new CustomEvent('status', { detail: { status, message } }));
    }
    async load() {
        const pending = await pendingStore.read();
        if (pending) this.pending = pending;
        let snapshot = await this.api.request('/api/state');
        validateState(snapshot.state);
        validatePreferences(snapshot.preferences);
        this.snapshot = snapshot;
        if (pending) {
            this.notify('saving', 'در حال بازیابی ذخیرهٔ در انتظار…');
            const operationId = pending.body?.operationId;
            if (typeof operationId !== 'string' || !/^[a-zA-Z0-9_-]{12,100}$/.test(operationId)) {
                this.blocked = true;
                this.notify('storage-error', 'اطلاعات ذخیره‌نشده پیدا شد. لطفاً نسخهٔ آن را دریافت کنید.');
                throw new Error('The pending write has an invalid operation ID.');
            }
            const operation = await this.api.request(`/api/operations/${encodeURIComponent(operationId)}`);
            if (operation.committed) {
                await pendingStore.clear();
                this.pending = null;
                snapshot = await this.api.request('/api/state');
                this.snapshot = snapshot;
            } else if (pending.body.expectedRevision === snapshot.revision) {
                await this.#sendPending();
                snapshot = await this.api.request('/api/state');
                this.snapshot = snapshot;
            } else {
                this.blocked = true;
                this.notify('conflict', 'اطلاعات ذخیره‌نشده با نسخهٔ جدید تفاوت دارد. لطفاً نسخهٔ در انتظار را دریافت کنید.');
                throw new Error('A pending write conflicts with the current database revision.');
            }
        }
        this.blocked = false;
        this.notify('saved', 'ذخیره در پایگاه داده');
        return structuredClone(snapshot);
    }
    retry() {
        this.#retry?.();
    }
    async discardPending() {
        await pendingStore.clear();
        this.pending = null;
    }
    async #waitForRetry(delay) {
        await new Promise((resolve) => {
            let settled = false;
            const resume = () => {
                if (settled) return;
                settled = true;
                clearTimeout(this.#retryTimer);
                this.#retryTimer = null;
                this.#retry = null;
                resolve();
            };
            this.#retry = resume;
            this.#retryTimer = setTimeout(resume, delay);
        });
    }
    async #sendPending() {
        let attempts = 0;
        let reconnectDelay = 1500;
        while (true) {
            try {
                const result = await this.api.request(this.pending.url, {
                    method: this.pending.method,
                    body: this.pending.body,
                });
                const draft = this.pending.draft;
                this.snapshot = { revision: result.revision, initialized: true, ...structuredClone(draft) };
                await pendingStore.clear();
                this.pending = null;
                this.notify('saved', 'در پایگاه داده ذخیره شد');
                return structuredClone(this.snapshot);
            } catch (error) {
                if (['DATABASE_CHANGED', 'DATABASE_CORRUPT'].includes(error.code) || error.status >= 500) {
                    this.blocked = true;
                    this.notify('storage-error', error.message);
                    throw error;
                }
                // A validation/conflict response is a definitive rejection.
                // A network loss is ambiguous: retry the same operation ID.
                if (error.status && error.status < 500) {
                    if (error.code !== 'REVISION_CONFLICT') {
                        await pendingStore.clear();
                        this.pending = null;
                    }
                    this.blocked = error.code === 'REVISION_CONFLICT';
                    this.notify(this.blocked ? 'conflict' : 'error', error.message);
                    throw error;
                }
                if (++attempts < 2) continue;
                this.notify(
                    'offline',
                    'تأیید ذخیره دریافت نشد. اطلاعات در انتظار است؛ برنامه خودکار دوباره تلاش می‌کند.'
                );
                await this.#waitForRetry(reconnectDelay);
                reconnectDelay = Math.min(reconnectDelay * 2, 10000);
                this.notify('saving', 'در حال بررسی و ذخیره…');
            }
        }
    }
    async save(state, preferences, { allowCardRemoval = false, reason = 'save' } = {}) {
        if (this.pending || this.blocked) throw new Error('Another write is pending or the window is stale.');
        validateState(state);
        validatePreferences(preferences);
        const draft = structuredClone({ state, preferences });
        this.pending = {
            url: '/api/state',
            method: 'PUT',
            draft,
            body: {
                ...draft,
                expectedRevision: this.snapshot.revision,
                operationId: crypto.randomUUID(),
                allowCardRemoval,
                reason,
            },
        };
        this.notify('saving', 'در حال ذخیره…');
        try {
            await pendingStore.add(this.pending);
        } catch (error) {
            this.blocked = true;
            this.notify('storage-error', 'نسخهٔ ایمن تغییرات ساخته نشد. لطفاً اطلاعات در انتظار را دریافت کنید.');
            throw error;
        }
        return this.#sendPending();
    }
    async migrate(payload, draft, restore = false) {
        if (this.pending || this.blocked) throw new Error('Another write is pending or the window is stale.');
        this.pending = {
            url: '/api/migrate',
            method: 'POST',
            draft: structuredClone({ state: draft.state, preferences: draft.preferences }),
            body: { payload, expectedRevision: this.snapshot.revision, operationId: crypto.randomUUID(), restore },
        };
        this.notify('saving', 'در حال انتقال اطلاعات…');
        try {
            await pendingStore.add(this.pending);
        } catch (error) {
            this.blocked = true;
            this.notify('storage-error', 'نسخهٔ ایمن تغییرات ساخته نشد. لطفاً اطلاعات در انتظار را دریافت کنید.');
            throw error;
        }
        return this.#sendPending();
    }
}

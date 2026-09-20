import { ApiClient } from './api.js';
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
        const snapshot = await this.api.request('/api/state');
        validateState(snapshot.state);
        validatePreferences(snapshot.preferences);
        this.snapshot = snapshot;
        this.blocked = false;
        this.notify('saved', 'ذخیره در پایگاه داده');
        return structuredClone(snapshot);
    }
    retry() {
        this.#retry?.();
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
                this.pending = null;
                this.notify('saved', 'در پایگاه داده ذخیره شد');
                return structuredClone(this.snapshot);
            } catch (error) {
                // A validation/conflict response is a definitive rejection. A
                // network loss or 5xx is ambiguous: do not invent a new write.
                if (error.status && error.status < 500) {
                    this.pending = null;
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
        return this.#sendPending();
    }
}

export class ApiError extends Error {
    constructor(message, code, status) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export class ApiClient {
    #token = null;
    async session() {
        const response = await fetch('/api/session', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new ApiError('ارتباط با برنامه برقرار نشد.', 'CONNECTION', response.status);
        this.#token = (await response.json()).token;
    }
    async request(url, { method = 'GET', body, refreshSession = true } = {}) {
        if (!this.#token) await this.session();
        const response = await fetch(url, {
            method,
            cache: 'no-store',
            signal: AbortSignal.timeout(12000),
            headers: {
                'X-Leitner-Token': this.#token,
                ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
            },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        });
        const result = await response.json();
        if (response.status === 403 && result.error === 'SESSION_EXPIRED' && refreshSession) {
            await this.session();
            return this.request(url, { method, body, refreshSession: false });
        }
        if (!response.ok) throw new ApiError(result.message || 'درخواست انجام نشد.', result.error, response.status);
        return result;
    }
}

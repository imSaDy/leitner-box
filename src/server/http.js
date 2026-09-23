import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { projectRoot, publicRoot } from './config.js';
import { AppError } from './errors.js';

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
};

export function createApplicationServer(repository, config) {
    const token = randomBytes(32).toString('hex');
    const json = (res, status, data) => {
        res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(data));
    };
    async function body(req) {
        if (!String(req.headers['content-type'] || '').startsWith('application/json'))
            throw new AppError('CONTENT_TYPE', 'نوع درخواست معتبر نیست.', 415);
        let size = 0;
        const chunks = [];
        for await (const chunk of req) {
            size += chunk.length;
            if (size > config.maxBodyBytes) throw new AppError('TOO_LARGE', 'حجم فایل بیش از حد مجاز است.', 413);
            chunks.push(chunk);
        }
        try {
            return JSON.parse(Buffer.concat(chunks).toString('utf8'));
        } catch {
            throw new AppError('INVALID_JSON', 'فایل JSON خوانا نیست.', 400);
        }
    }
    function authorized(req, origin) {
        const candidate = Buffer.from(String(req.headers['x-leitner-token'] || ''));
        const expected = Buffer.from(token);
        if (req.headers.origin && req.headers.origin !== origin)
            throw new AppError('ORIGIN', 'مبدأ درخواست مجاز نیست.', 403);
        if (candidate.length !== expected.length || !timingSafeEqual(candidate, expected))
            throw new AppError('SESSION_EXPIRED', 'ارتباط برنامه تازه شده است؛ دوباره تلاش کنید.', 403);
    }
    const server = http.createServer(async (req, res) => {
        try {
            const address = server.address();
            const origin = `http://127.0.0.1:${address.port}`;
            if (req.headers.host !== `127.0.0.1:${address.port}` && req.headers.host !== `localhost:${address.port}`)
                throw new AppError('HOST', 'میزبان مجاز نیست.', 403);
            // Keep one browser origin so migration and session security are predictable.
            if (req.headers.host.startsWith('localhost:')) {
                res.writeHead(302, { Location: `${origin}${req.url}` });
                res.end();
                return;
            }
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('Referrer-Policy', 'no-referrer');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
            const url = new URL(req.url, origin);
            if (url.pathname === '/api/health' && req.method === 'GET') {
                let databaseIssue = repository.storageFailure || null;
                if (!databaseIssue) {
                    try {
                        repository.assertCurrentDatabase({ verifyIntegrity: false });
                    } catch (error) {
                        databaseIssue = error.code || 'DATABASE_UNAVAILABLE';
                    }
                }
                json(res, 200, {
                    application: 'leitner-box',
                    version: '2.1.8',
                    database: 'sqlite',
                    ready: !databaseIssue,
                    ...(databaseIssue ? { databaseIssue } : {}),
                    initialized: databaseIssue ? null : repository.read().initialized,
                });
                return;
            }
            if (url.pathname === '/api/session' && req.method === 'GET') {
                if (
                    req.headers['sec-fetch-site'] === 'cross-site' ||
                    (req.headers.origin && req.headers.origin !== origin)
                )
                    throw new AppError('ORIGIN', 'مبدأ درخواست مجاز نیست.', 403);
                json(res, 200, { token });
                return;
            }
            if (url.pathname.startsWith('/api/')) {
                authorized(req, origin);
                if (url.pathname === '/api/state' && req.method === 'GET') {
                    repository.assertCurrentDatabase();
                    json(res, 200, repository.read());
                    return;
                }
                if (url.pathname === '/api/state' && req.method === 'PUT') {
                    json(res, 200, repository.commit(await body(req)));
                    return;
                }
                if (url.pathname === '/api/migrate' && req.method === 'POST') {
                    const input = await body(req);
                    json(
                        res,
                        200,
                        repository.migrate(
                            input.payload,
                            input.expectedRevision,
                            input.operationId,
                            input.restore === true
                        )
                    );
                    return;
                }
                if (url.pathname.startsWith('/api/operations/') && req.method === 'GET') {
                    const result = repository.operation(
                        decodeURIComponent(url.pathname.slice('/api/operations/'.length))
                    );
                    json(res, 200, result ? { committed: true, revision: result.revision } : { committed: false });
                    return;
                }
                if (url.pathname === '/api/backups' && req.method === 'GET') {
                    json(res, 200, { backups: repository.backups.list(), databasePath: repository.filename });
                    return;
                }
                if (url.pathname === '/api/backups' && req.method === 'POST') {
                    await body(req);
                    const name = repository.createBackup();
                    json(res, 201, { name });
                    return;
                }
                if (url.pathname.startsWith('/api/backups/') && req.method === 'GET') {
                    const name = decodeURIComponent(url.pathname.slice('/api/backups/'.length));
                    const data = repository.backups.read(name);
                    res.writeHead(200, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Content-Disposition': `attachment; filename="${name}"`,
                        'Cache-Control': 'no-store',
                    });
                    res.end(data);
                    return;
                }
                if (url.pathname === '/api/export' && req.method === 'GET') {
                    const snapshot = repository.read();
                    json(res, 200, {
                        format: 'leitner-backup-v2',
                        createdAt: new Date().toISOString(),
                        state: snapshot.state,
                        preferences: snapshot.preferences,
                    });
                    return;
                }
                throw new AppError('NOT_FOUND', 'مسیر پیدا نشد.', 404);
            }
            if (!['GET', 'HEAD'].includes(req.method)) throw new AppError('METHOD', 'درخواست مجاز نیست.', 405);
            let relative = decodeURIComponent(url.pathname);
            let base = publicRoot;
            if (relative.startsWith('/src/client/')) {
                base = path.join(projectRoot, 'src/client');
                relative = relative.slice('/src/client'.length);
            } else if (relative.startsWith('/src/shared/')) {
                base = path.join(projectRoot, 'src/shared');
                relative = relative.slice('/src/shared'.length);
            } else if (relative === '/') relative = '/index.html';
            const filename = path.resolve(base, `.${relative}`);
            if (!filename.startsWith(base + path.sep) || !fs.existsSync(filename) || !fs.statSync(filename).isFile())
                throw new AppError('NOT_FOUND', 'فایل پیدا نشد.', 404);
            // Source/server, user data, migration archives and backup directories
            // are never mounted as static files.
            res.setHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.dictionaryapi.dev; media-src 'self' https://translate.google.com https://api.dictionaryapi.dev https://ssl.gstatic.com https://*.gstatic.com https://*.dictionaryapi.dev; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
            );
            res.writeHead(200, {
                'Content-Type': mime[path.extname(filename)] || 'application/octet-stream',
                'Cache-Control': 'no-cache',
            });
            if (req.method === 'HEAD') res.end();
            else fs.createReadStream(filename).pipe(res);
        } catch (error) {
            const sqliteFailure = error.code === 'ERR_SQLITE_ERROR';
            const databaseCorrupt = sqliteFailure && [11, 26].includes(error.errcode & 255);
            let responseError = error;
            if (sqliteFailure) {
                repository.storageFailure = databaseCorrupt ? 'DATABASE_CORRUPT' : 'DATABASE_UNAVAILABLE';
                responseError = new AppError(
                    repository.storageFailure,
                    databaseCorrupt
                        ? 'ذخیره در پایگاه داده با خطا روبه‌رو شد. اطلاعات در انتظار را دریافت کنید و برنامه را دوباره اجرا کنید.'
                        : 'پایگاه داده در دسترس نیست. اطلاعات در انتظار را دریافت کنید و برنامه را دوباره اجرا کنید.',
                    503
                );
            }
            if (!res.headersSent)
                json(res, responseError.status || 500, {
                    error: responseError.code || 'SERVER_ERROR',
                    message: responseError.status
                        ? responseError.message
                        : 'ذخیره انجام نشد؛ ارتباط یا دسترسی به پایگاه داده را بررسی کنید.',
                });
            else res.end();
            if (!error.status) console.error('Request failed:', error);
        }
    });
    server.requestTimeout = 30000;
    server.headersTimeout = 15000;
    return server;
}

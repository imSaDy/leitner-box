import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { AppError } from '../errors.js';

export const checksum = (value) =>
    createHash('sha256')
        .update(typeof value === 'string' ? value : JSON.stringify(value))
        .digest('hex');

export class BackupStore {
    constructor(directory) {
        this.directory = directory;
        fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    }
    content(snapshot, reason) {
        const content = {
            format: 'leitner-backup-v2',
            createdAt: new Date().toISOString(),
            reason,
            revision: snapshot.revision,
            state: snapshot.state,
            preferences: snapshot.preferences,
        };
        content.checksum = checksum({ state: content.state, preferences: content.preferences });
        return content;
    }
    write(snapshot, reason = 'automatic') {
        const content = this.content(snapshot, reason);
        const name = `${content.createdAt.replace(/[:.]/g, '-')}_${reason}_${randomUUID().slice(0, 8)}.json`;
        const target = path.join(this.directory, name);
        const temporary = `${target}.tmp`;
        const fd = fs.openSync(temporary, 'wx', 0o600);
        try {
            fs.writeFileSync(fd, JSON.stringify(content, null, 2));
            fs.fsyncSync(fd);
        } finally {
            fs.closeSync(fd);
        }
        fs.renameSync(temporary, target);
        this.prune();
        return name;
    }
    list() {
        return fs
            .readdirSync(this.directory)
            .filter((name) => /^\d{4}-.*\.json$/.test(name))
            .sort()
            .reverse()
            .map((name) => {
                const stat = fs.statSync(path.join(this.directory, name));
                return { name, bytes: stat.size, createdAt: stat.mtime.toISOString() };
            });
    }
    read(name) {
        if (!name || path.basename(name) !== name || !this.list().some((item) => item.name === name))
            throw new AppError('NOT_FOUND', 'پشتیبان پیدا نشد.', 404);
        const raw = fs.readFileSync(path.join(this.directory, name), 'utf8');
        return this.verify(raw);
    }
    verify(raw) {
        const parsed = JSON.parse(raw);
        if (parsed.checksum !== checksum({ state: parsed.state, preferences: parsed.preferences }))
            throw new AppError('BACKUP_CORRUPT', 'فایل پشتیبان آسیب دیده است.', 422);
        return raw;
    }
    prune() {
        // Keep 30 routine snapshots; migration/restore/manual snapshots are never
        // automatically removed. Each path comes from this exact directory.
        const routine = this.list().filter((item) => item.name.includes('_automatic_'));
        for (const item of routine.slice(30)) fs.unlinkSync(path.join(this.directory, item.name));
    }
}

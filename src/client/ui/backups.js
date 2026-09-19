import { downloadJson } from './storage-ui.js';
import { decodeImport } from '../../shared/validation.js';

export function installBackupUI(ctx) {
    const list = document.getElementById('backupList');
    const info = document.getElementById('backupInfo');
    const api = ctx.repository.api;
    async function refresh() {
        try {
            const result = await api.request('/api/backups');
            document.getElementById('databasePath').textContent = result.databasePath;
            list.replaceChildren();
            for (const item of result.backups.slice(0, 20)) {
                const button = document.createElement('button');
                button.className = 'backup-item';
                button.type = 'button';
                const locale = document.documentElement.lang === 'en' ? 'en-US' : 'fa-IR';
                button.textContent = `${new Date(item.createdAt).toLocaleString(locale)} · دریافت نسخه`;
                button.addEventListener('click', async () => {
                    try {
                        downloadJson(await api.request('/api/backups/' + encodeURIComponent(item.name)), item.name);
                    } catch (error) {
                        info.textContent = error.message;
                    }
                });
                list.append(button);
            }
            const locale = document.documentElement.lang === 'en' ? 'en-US' : 'fa-IR';
            info.textContent = result.backups.length
                ? `${result.backups.length.toLocaleString(locale)} نسخهٔ پشتیبان موجود است.`
                : 'اولین نسخهٔ پشتیبان را بسازید.';
        } catch (error) {
            info.textContent = error.message;
        }
    }
    document.getElementById('btnBackups').addEventListener('click', () => {
        ctx.openModal('backupModal');
        refresh();
    });
    document.getElementById('btnCloseBackups').addEventListener('click', () => ctx.closeModal('backupModal'));
    document.getElementById('btnCreateBackup').addEventListener('click', async (event) => {
        event.currentTarget.disabled = true;
        try {
            await api.request('/api/backups', { method: 'POST', body: {} });
            await refresh();
        } catch (error) {
            info.textContent = error.message;
        } finally {
            document.getElementById('btnCreateBackup').disabled = false;
        }
    });
    document.getElementById('restoreFile').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) return;
        try {
            const payload = JSON.parse(await file.text());
            const draft = decodeImport(payload);
            if (
                !confirm(
                    `بازیابی ${draft.state.cards.length.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'fa-IR')} کارت و سابقهٔ مرور؟ اطلاعات فعلی جایگزین می‌شود و قبل از آن یک نسخهٔ پشتیبان ساخته خواهد شد.`
                )
            )
                return;
            await ctx.runMutation(async () => {
                await ctx.repository.migrate(payload, draft, true);
                location.reload();
            });
        } catch (error) {
            info.textContent = error.message;
        }
    });
}

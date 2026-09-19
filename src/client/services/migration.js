import { decodeImport, emptyState, defaultPreferences } from '../../shared/validation.js';
import { downloadJson } from '../ui/storage-ui.js';

export function readLegacyBrowserData() {
    // Read-only migration bridge. Never clear or continue writing browser data.
    try {
        if (!localStorage.getItem('leitner_data')) return null;
        const legacy = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith('leitner_')) legacy[key] = localStorage.getItem(key);
        }
        return { format: 'leitner-migration-v1', legacy };
    } catch {
        return null;
    }
}

export async function ensureInitialized(repository) {
    const setup = document.getElementById('storageSetup');
    const legacy = readLegacyBrowserData();
    let candidate = null;
    const error = document.getElementById('setupError');
    const description = document.getElementById('setupDescription');
    const importButton = document.getElementById('btnSetupImport');
    function preview(payload) {
        try {
            const decoded = decodeImport(payload);
            candidate = { payload, decoded };
            description.textContent = `${decoded.state.cards.length.toLocaleString('fa-IR')} کارت به همراه سابقهٔ مرور آمادهٔ انتقال است. نسخهٔ قبلی پاک نمی‌شود.`;
            importButton.hidden = false;
            error.textContent = '';
        } catch (e) {
            error.textContent = e.message;
            candidate = null;
            importButton.hidden = true;
        }
    }
    if (repository.snapshot.initialized) {
        setup.hidden = true;
        return { seed: false };
    }
    setup.hidden = false;
    if (legacy) preview(legacy);
    return new Promise((resolve) => {
        const fileInput = document.getElementById('setupImportFile');
        fileInput.addEventListener('change', async () => {
            const file = fileInput.files[0];
            if (!file) return;
            try {
                preview(JSON.parse(await file.text()));
            } catch {
                error.textContent = 'فایل JSON خوانا نیست.';
            }
        });
        const nonce = new URLSearchParams(location.hash.slice(1)).get('migration');
        const receive = (event) => {
            if (
                !window.opener ||
                event.source !== window.opener ||
                event.origin !== 'null' ||
                event.data?.nonce !== nonce ||
                event.data?.type !== 'leitner-migration'
            )
                return;
            preview(event.data.payload);
        };
        window.addEventListener('message', receive);
        if (nonce && window.opener) window.opener.postMessage({ type: 'leitner-ready', nonce }, '*');
        async function finish(payload, draft, seed) {
            try {
                await repository.migrate(payload, draft);
                setup.hidden = true;
                window.removeEventListener('message', receive);
                resolve({ seed });
            } catch (e) {
                error.textContent = e.message;
            }
        }
        importButton.addEventListener('click', () => {
            if (candidate) finish(candidate.payload, candidate.decoded, false);
        });
        document.getElementById('btnSetupEmpty').addEventListener('click', () => {
            const state = emptyState(),
                preferences = defaultPreferences();
            finish({ format: 'leitner-backup-v2', state, preferences }, { state, preferences }, false);
        });
        document.getElementById('btnSetupSamples').addEventListener('click', () => {
            const state = emptyState(),
                preferences = defaultPreferences();
            finish({ format: 'leitner-backup-v2', state, preferences }, { state, preferences }, true);
        });
        document.getElementById('btnDownloadLegacy').addEventListener('click', () => {
            if (legacy) downloadJson(legacy, 'leitner-legacy-original.json');
        });
        document.getElementById('btnDownloadLegacy').hidden = !legacy;
    });
}

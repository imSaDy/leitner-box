export function downloadJson(value, filename) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function installStorageUI(repository) {
    const overlay = document.getElementById('persistenceOverlay');
    const status = document.getElementById('storageStatus');
    const message = document.getElementById('persistenceMessage');
    let locked = false;
    let exportedPending = false;
    let lastPending = null;
    function lock(value) {
        locked = value;
        overlay.hidden = !value;
        document.body.classList.toggle('storage-busy', value);
    }
    repository.addEventListener('status', ({ detail }) => {
        if (lastPending !== repository.pending) exportedPending = false;
        lastPending = repository.pending;
        status.dataset.state = detail.status;
        status.textContent = detail.message;
        message.textContent = detail.message;
        document.getElementById('btnRetryStorage').hidden = detail.status !== 'offline';
        document.getElementById('btnEmergencyExport').hidden = !repository.pending;
        document.getElementById('btnReloadStorage').hidden = !['conflict', 'storage-error'].includes(detail.status);
        if (['saving', 'offline', 'storage-error', 'conflict'].includes(detail.status)) lock(true);
        else lock(false);
    });
    for (const event of ['click', 'keydown', 'submit'])
        document.addEventListener(
            event,
            (e) => {
                if (locked && !e.target.closest('#persistenceOverlay')) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true
        );
    document.getElementById('btnRetryStorage').addEventListener('click', () => repository.retry());
    document.getElementById('btnReloadStorage').addEventListener('click', async () => {
        if (repository.pending) {
            if (!exportedPending) {
                message.textContent = 'ابتدا نسخهٔ اطلاعات در انتظار را دریافت کنید، سپس دوباره بارگذاری کنید.';
                return;
            }
            try {
                await repository.discardPending();
            } catch (error) {
                message.textContent = error.message;
                return;
            }
        }
        location.reload();
    });
    document.getElementById('btnEmergencyExport').addEventListener('click', () => {
        const draft = repository.pending?.draft;
        if (draft) {
            downloadJson({ format: 'leitner-backup-v2', ...draft }, 'leitner-pending-save.json');
            exportedPending = true;
        }
    });
    window.addEventListener('beforeunload', (event) => {
        if (repository.pending) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    return { lock };
}

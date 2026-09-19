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
    function lock(value) {
        locked = value;
        overlay.hidden = !value;
        document.body.classList.toggle('storage-busy', value);
    }
    repository.addEventListener('status', ({ detail }) => {
        status.dataset.state = detail.status;
        status.textContent = detail.message;
        message.textContent = detail.message;
        document.getElementById('btnRetryStorage').hidden = detail.status !== 'offline';
        document.getElementById('btnEmergencyExport').hidden = detail.status !== 'offline';
        document.getElementById('btnReloadStorage').hidden = detail.status !== 'conflict';
        if (['saving', 'offline', 'conflict'].includes(detail.status)) lock(true);
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
    document.getElementById('btnReloadStorage').addEventListener('click', () => location.reload());
    document.getElementById('btnEmergencyExport').addEventListener('click', () => {
        const draft = repository.pending?.draft;
        if (draft) downloadJson({ format: 'leitner-backup-v2', ...draft }, 'leitner-pending-save.json');
    });
    window.addEventListener('beforeunload', (event) => {
        if (repository.pending) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    return { lock };
}

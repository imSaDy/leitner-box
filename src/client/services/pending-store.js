const DATABASE = 'leitner-pending-writes';
const STORE = 'writes';

function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function transaction(mode, action) {
    const database = await openDatabase();
    try {
        return await new Promise((resolve, reject) => {
            const tx = database.transaction(STORE, mode);
            const request = action(tx.objectStore(STORE));
            let result;
            request.onsuccess = () => {
                result = request.result;
            };
            tx.oncomplete = () => resolve(result);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error || new Error('Pending write was not saved.'));
        });
    } finally {
        database.close();
    }
}

export const pendingStore = {
    read: () => transaction('readonly', (store) => store.get('pending')),
    add: (pending) => transaction('readwrite', (store) => store.add(pending, 'pending')),
    clear: () => transaction('readwrite', (store) => store.delete('pending')),
};

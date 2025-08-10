// db.js - CRUD com IndexedDB para Listou
// Funções: dbAddItem, dbGetItems, dbUpdateItem, dbDeleteItem, dbGetTemplates, dbLoadTemplate
// Futuro: merge de listas, histórico, sync, etc.

const DB_NAME = 'listou-db';
const DB_VERSION = 2;
const STORE_ITEMS = 'items';
const STORE_TEMPLATES = 'templates';
const STORE_SUPERMARKETS = 'supermarkets';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_ITEMS)) {
                db.createObjectStore(STORE_ITEMS, { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
                db.createObjectStore(STORE_TEMPLATES, { keyPath: 'name' });
            }
            if (!db.objectStoreNames.contains(STORE_SUPERMARKETS)) {
                db.createObjectStore(STORE_SUPERMARKETS, { keyPath: 'id', autoIncrement: true });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function dbAddItem(item) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ITEMS, 'readwrite');
        tx.objectStore(STORE_ITEMS).add(item);
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function dbGetItems() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ITEMS, 'readonly');
        const req = tx.objectStore(STORE_ITEMS).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

export async function dbUpdateItem(id, update) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ITEMS, 'readwrite');
        const store = tx.objectStore(STORE_ITEMS);
        const getReq = store.get(Number(id));
        getReq.onsuccess = () => {
            const item = getReq.result;
            if (!item) return resolve();
            
            // Atualizações incrementais
            if (update.$inc) {
                item.qty = (item.qty || 1) + (update.$inc.qty || 0);
            }
            
            // Atualizações diretas
            if (update.qty !== undefined) item.qty = update.qty;
            if (update.bought !== undefined) item.bought = update.bought;
            if (update.purchased !== undefined) item.purchased = update.purchased;
            if (update.price !== undefined) item.price = update.price;
            if (update.name !== undefined) item.name = update.name;
            if (update.category !== undefined) item.category = update.category;
            
            store.put(item);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function dbGetItemById(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ITEMS, 'readonly');
        const req = tx.objectStore(STORE_ITEMS).get(Number(id));
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

export async function dbDeleteItem(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ITEMS, 'readwrite');
        tx.objectStore(STORE_ITEMS).delete(Number(id));
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

// Templates
export async function dbGetTemplates() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TEMPLATES, 'readonly');
        const req = tx.objectStore(STORE_TEMPLATES).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

export async function dbLoadTemplate(name) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction([STORE_TEMPLATES, STORE_ITEMS], 'readwrite');
        const tReq = tx.objectStore(STORE_TEMPLATES).get(name);
        tReq.onsuccess = () => {
            const tpl = tReq.result;
            if (tpl && tpl.items) {
                for (const item of tpl.items) {
                    tx.objectStore(STORE_ITEMS).add({ ...item, bought: false });
                }
            }
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

// Inicializar template padrão se não existir
(async function initTemplates() {
    const db = await openDB();
    const tx = db.transaction(STORE_TEMPLATES, 'readwrite');
    const store = tx.objectStore(STORE_TEMPLATES);
    store.get('compra-mes').onsuccess = e => {
        if (!e.target.result) {
            store.add({
                name: 'compra-mes',
                items: [
                    { name: 'Arroz', qty: 5 },
                    { name: 'Feijão', qty: 2 },
                    { name: 'Óleo', qty: 1 },
                    { name: 'Açúcar', qty: 2 }
                ]
            });
        }
    };
})();

// Supermercados
export async function dbAddSupermarket(supermarket) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SUPERMARKETS, 'readwrite');
        const addReq = tx.objectStore(STORE_SUPERMARKETS).add({
            ...supermarket,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        addReq.onsuccess = () => resolve(addReq.result);
        tx.onerror = reject;
    });
}

export async function dbGetSupermarkets() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SUPERMARKETS, 'readonly');
        const req = tx.objectStore(STORE_SUPERMARKETS).getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

export async function dbUpdateSupermarket(id, update) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SUPERMARKETS, 'readwrite');
        const store = tx.objectStore(STORE_SUPERMARKETS);
        const getReq = store.get(Number(id));
        getReq.onsuccess = () => {
            const supermarket = getReq.result;
            if (!supermarket) return resolve();
            
            Object.assign(supermarket, update, {
                updatedAt: new Date().toISOString()
            });
            
            store.put(supermarket);
        };
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function dbDeleteSupermarket(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SUPERMARKETS, 'readwrite');
        tx.objectStore(STORE_SUPERMARKETS).delete(Number(id));
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function dbGetSupermarketById(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SUPERMARKETS, 'readonly');
        const req = tx.objectStore(STORE_SUPERMARKETS).get(Number(id));
        req.onsuccess = () => resolve(req.result);
        req.onerror = reject;
    });
}

// Exporta funções para uso global (compatibilidade com app.js não-módulo)
window.dbAddItem = dbAddItem;
window.dbGetItems = dbGetItems;
window.dbUpdateItem = dbUpdateItem;
window.dbDeleteItem = dbDeleteItem;
window.dbGetItemById = dbGetItemById;
window.dbGetTemplates = dbGetTemplates;
window.dbLoadTemplate = dbLoadTemplate;
window.dbAddSupermarket = dbAddSupermarket;
window.dbGetSupermarkets = dbGetSupermarkets;
window.dbUpdateSupermarket = dbUpdateSupermarket;
window.dbDeleteSupermarket = dbDeleteSupermarket;
window.dbGetSupermarketById = dbGetSupermarketById;

// TODO: Função de merge de listas (atualizar preços/quantidades)
// TODO: Sincronização futura (premium)

/**
 * IndexedDB Service for Decoelectric Offline Budget Requests & Background Sync
 * Permite guardar cotizaciones y solicitudes de presupuesto en IndexedDB cuando
 * no hay conexión a internet y mantener la cola lista para sincronización en segundo plano.
 */

import { QuoteRequest, OfflinePendingQuote } from '../types';

const DB_NAME = 'decoelectric_offline_db';
const DB_VERSION = 1;
const PENDING_STORE = 'pending_quotes';
const HISTORY_STORE = 'synced_quotes_history';

// Fallback en localStorage si IndexedDB no está disponible (modo incógnito restrictivo, etc.)
const LOCAL_STORAGE_FALLBACK_KEY = 'decoelectric_offline_pending_quotes';
const LOCAL_STORAGE_HISTORY_KEY = 'decoelectric_offline_synced_history';

let dbInstance: IDBDatabase | null = null;

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Abre y configura la base de datos IndexedDB
 */
export function openOfflineDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error('IndexedDB no está soportado en este entorno.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Almacén de solicitudes pendientes
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        const pendingStore = db.createObjectStore(PENDING_STORE, { keyPath: 'id' });
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        pendingStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      // 2. Almacén de historial de sincronizados
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = (event: Event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };
      resolve(dbInstance);
    };

    request.onerror = (event: Event) => {
      console.warn('[IndexedDB] Error al abrir base de datos, usando fallback:', event);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Guarda una solicitud de presupuesto offline en IndexedDB
 */
export async function saveOfflineQuote(quote: QuoteRequest): Promise<OfflinePendingQuote> {
  const offlineId = quote.id?.startsWith('REQ-')
    ? quote.id
    : `OFFLINE-REQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  const quoteWithMeta: QuoteRequest = {
    ...quote,
    id: offlineId,
    isOfflineCreated: true,
    offlineSyncStatus: 'pending',
    createdAt: quote.createdAt || new Date().toISOString(),
  };

  const pendingItem: OfflinePendingQuote = {
    id: offlineId,
    quoteData: quoteWithMeta,
    timestamp: Date.now(),
    syncStatus: 'pending',
    attempts: 0,
  };

  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      const req = store.put(pendingItem);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[IndexedDB] Fallback a LocalStorage para guardar cotización offline:', err);
    saveOfflineQuoteLocalStorage(pendingItem);
  }

  // Notificar al sistema
  dispatchSyncUpdateEvent();
  return pendingItem;
}

/**
 * Obtiene todas las solicitudes pendientes de sincronización
 */
export async function getPendingQuotes(): Promise<OfflinePendingQuote[]> {
  try {
    const db = await openOfflineDatabase();
    return await new Promise<OfflinePendingQuote[]>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readonly');
      const store = transaction.objectStore(PENDING_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as OfflinePendingQuote[];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    return getPendingQuotesLocalStorage();
  }
}

/**
 * Obtiene la cantidad de solicitudes pendientes de sincronización
 */
export async function getPendingQuotesCount(): Promise<number> {
  try {
    const db = await openOfflineDatabase();
    return await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readonly');
      const store = transaction.objectStore(PENDING_STORE);
      const req = store.count();

      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getPendingQuotesLocalStorage().length;
  }
}

/**
 * Actualiza el estado de una solicitud en IndexedDB
 */
export async function updatePendingQuoteStatus(
  id: string,
  status: 'pending' | 'syncing' | 'synced' | 'failed',
  error?: string
): Promise<void> {
  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as OfflinePendingQuote | undefined;
        if (!item) {
          return resolve();
        }
        item.syncStatus = status;
        if (status === 'syncing') {
          item.attempts += 1;
        }
        if (error) {
          item.lastError = error;
        }
        const putReq = store.put(item);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    updatePendingQuoteStatusLocalStorage(id, status, error);
  }

  dispatchSyncUpdateEvent();
}

/**
 * Marca una solicitud como sincronizada: la pasa al historial y la quita de pendientes
 */
export async function markQuoteAsSynced(id: string, finalServerId?: string): Promise<void> {
  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE, HISTORY_STORE], 'readwrite');
      const pendingStore = transaction.objectStore(PENDING_STORE);
      const historyStore = transaction.objectStore(HISTORY_STORE);

      const getReq = pendingStore.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result as OfflinePendingQuote | undefined;
        if (item) {
          item.syncStatus = 'synced';
          item.quoteData.offlineSyncStatus = 'synced';
          item.quoteData.syncedAt = new Date().toISOString();
          if (finalServerId) {
            item.quoteData.id = finalServerId;
          }
          historyStore.put(item);
          pendingStore.delete(id);
        }
        resolve();
      };

      transaction.onerror = () => reject(transaction.error);
    });
  } catch {
    markQuoteAsSyncedLocalStorage(id, finalServerId);
  }

  dispatchSyncUpdateEvent();
}

/**
 * Elimina una solicitud pendiente
 */
export async function removePendingQuote(id: string): Promise<void> {
  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE], 'readwrite');
      const store = transaction.objectStore(PENDING_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    removePendingQuoteLocalStorage(id);
  }

  dispatchSyncUpdateEvent();
}

/**
 * Obtiene el historial de cotizaciones que fueron sincronizadas exitosamente
 */
export async function getSyncedQuotesHistory(): Promise<OfflinePendingQuote[]> {
  try {
    const db = await openOfflineDatabase();
    return await new Promise<OfflinePendingQuote[]>((resolve, reject) => {
      const transaction = db.transaction([HISTORY_STORE], 'readonly');
      const store = transaction.objectStore(HISTORY_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result as OfflinePendingQuote[];
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getSyncedQuotesHistoryLocalStorage();
  }
}

/**
 * Limpia todas las solicitudes pendientes y el historial
 */
export async function clearAllOfflineQuotes(): Promise<void> {
  try {
    const db = await openOfflineDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([PENDING_STORE, HISTORY_STORE], 'readwrite');
      transaction.objectStore(PENDING_STORE).clear();
      transaction.objectStore(HISTORY_STORE).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch {}

  try {
    localStorage.removeItem(LOCAL_STORAGE_FALLBACK_KEY);
    localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
  } catch {}

  dispatchSyncUpdateEvent();
}

// ---------------------------------------------------------------------------
// Fallbacks en LocalStorage
// ---------------------------------------------------------------------------

function getPendingQuotesLocalStorage(): OfflinePendingQuote[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineQuoteLocalStorage(item: OfflinePendingQuote) {
  try {
    const list = getPendingQuotesLocalStorage();
    const updated = [item, ...list.filter((x) => x.id !== item.id)];
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[LocalStorage] Error en fallback de guardado:', e);
  }
}

function updatePendingQuoteStatusLocalStorage(
  id: string,
  status: 'pending' | 'syncing' | 'synced' | 'failed',
  error?: string
) {
  try {
    const list = getPendingQuotesLocalStorage();
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          syncStatus: status,
          attempts: status === 'syncing' ? item.attempts + 1 : item.attempts,
          lastError: error || item.lastError,
        };
      }
      return item;
    });
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(updated));
  } catch {}
}

function markQuoteAsSyncedLocalStorage(id: string, finalServerId?: string) {
  try {
    const list = getPendingQuotesLocalStorage();
    const target = list.find((x) => x.id === id);
    const updatedList = list.filter((x) => x.id !== id);
    localStorage.setItem(LOCAL_STORAGE_FALLBACK_KEY, JSON.stringify(updatedList));

    if (target) {
      target.syncStatus = 'synced';
      target.quoteData.offlineSyncStatus = 'synced';
      target.quoteData.syncedAt = new Date().toISOString();
      if (finalServerId) {
        target.quoteData.id = finalServerId;
      }
      const history = getSyncedQuotesHistoryLocalStorage();
      localStorage.setItem(
        LOCAL_STORAGE_HISTORY_KEY,
        JSON.stringify([target, ...history].slice(0, 50))
      );
    }
  } catch {}
}

function removePendingQuoteLocalStorage(id: string) {
  try {
    const list = getPendingQuotesLocalStorage();
    localStorage.setItem(
      LOCAL_STORAGE_FALLBACK_KEY,
      JSON.stringify(list.filter((x) => x.id !== id))
    );
  } catch {}
}

function getSyncedQuotesHistoryLocalStorage(): OfflinePendingQuote[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dispatchSyncUpdateEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('decoelectric-offline-queue-changed'));
  }
}

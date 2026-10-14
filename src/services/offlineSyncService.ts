/**
 * Background Sync Service for Decoelectric
 * Detecta automáticamente cuando se recupera la conexión a internet
 * y sincroniza las solicitudes de presupuesto pendientes almacenadas en IndexedDB.
 */

import {
  getPendingQuotes,
  markQuoteAsSynced,
  updatePendingQuoteStatus,
  getPendingQuotesCount,
  saveOfflineQuote,
} from './indexedDBStorage';
import { db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import { QuoteRequest } from '../types';
import { saveLocalQuote } from './firestoreService';

let isSyncInProgress = false;
let autoSyncInitialized = false;

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  totalPending: number;
  errors: string[];
}

/**
 * Registra una tarea de background sync en el Service Worker si el navegador lo soporta
 */
export async function requestServiceWorkerSync(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      // Registrar la etiqueta de sincronización
      // @ts-ignore - Background Sync API
      await reg.sync.register('sync-budget-quotes');
      console.log('[OfflineSync] Background Sync registrado en Service Worker: sync-budget-quotes');
      return true;
    }
  } catch (e) {
    console.log('[OfflineSync] SyncManager no disponible, se utilizará evento online estándar');
  }
  return false;
}

/**
 * Guarda una solicitud de presupuesto para sincronización en segundo plano.
 * Si ya hay conexión, intenta enviarla inmediatamente; de lo contrario la almacena en IndexedDB.
 */
export async function submitOrQueueQuoteRequest(quote: QuoteRequest): Promise<{
  ticketId: string;
  isQueuedOffline: boolean;
}> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // Si no hay red, guardamos directo en IndexedDB
  if (!isOnline) {
    const saved = await saveOfflineQuote(quote);
    await requestServiceWorkerSync();
    return {
      ticketId: saved.id,
      isQueuedOffline: true,
    };
  }

  // Si hay red, intentamos guardar y si falla por red, encolamos en IndexedDB
  try {
    const id = quote.id || `REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalQuote: QuoteRequest = {
      ...quote,
      id,
      status: quote.status || 'nueva',
      createdAt: quote.createdAt || new Date().toISOString(),
      offlineSyncStatus: 'synced',
    };

    saveLocalQuote(finalQuote);
    await setDoc(doc(db, 'quoteRequests', id), finalQuote);

    return {
      ticketId: id,
      isQueuedOffline: false,
    };
  } catch (error: any) {
    console.warn('[OfflineSync] Error al enviar directamente a Firestore, guardando en cola IndexedDB:', error);
    const saved = await saveOfflineQuote(quote);
    await requestServiceWorkerSync();
    return {
      ticketId: saved.id,
      isQueuedOffline: true,
    };
  }
}

/**
 * Ejecuta la sincronización de todas las solicitudes pendientes en IndexedDB hacia Firestore
 */
export async function syncPendingQuotes(force = false): Promise<SyncResult> {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (!isOnline && !force) {
    const count = await getPendingQuotesCount();
    return {
      syncedCount: 0,
      failedCount: 0,
      totalPending: count,
      errors: ['Dispositivo sin conexión a internet.'],
    };
  }

  if (isSyncInProgress) {
    console.log('[OfflineSync] Sincronización ya en curso, omitiendo ejecución redundante.');
    const count = await getPendingQuotesCount();
    return {
      syncedCount: 0,
      failedCount: 0,
      totalPending: count,
      errors: [],
    };
  }

  isSyncInProgress = true;
  notifySyncState(true);

  const pending = await getPendingQuotes();
  const result: SyncResult = {
    syncedCount: 0,
    failedCount: 0,
    totalPending: pending.length,
    errors: [],
  };

  if (pending.length === 0) {
    isSyncInProgress = false;
    notifySyncState(false);
    return result;
  }

  console.log(`[OfflineSync] Iniciando sincronización en segundo plano de ${pending.length} presupuestos...`);

  for (const item of pending) {
    try {
      await updatePendingQuoteStatus(item.id, 'syncing');

      // Generar ID de servidor si tenía prefijo temporal offline
      const serverId = item.id.startsWith('OFFLINE-')
        ? `REQ-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
        : item.id;

      const quoteToUpload: QuoteRequest = {
        ...item.quoteData,
        id: serverId,
        offlineSyncStatus: 'synced',
        syncedAt: new Date().toISOString(),
      };

      // Guardar en Firestore
      await setDoc(doc(db, 'quoteRequests', serverId), quoteToUpload);

      // Actualizar caché local de citas
      saveLocalQuote(quoteToUpload);

      // Marcar en IndexedDB como sincronizado
      await markQuoteAsSynced(item.id, serverId);

      result.syncedCount += 1;
      console.log(`[OfflineSync] Cotización ${item.id} sincronizada con éxito como ${serverId}`);
    } catch (err: any) {
      console.error(`[OfflineSync] Error al sincronizar ${item.id}:`, err);
      const errMsg = err?.message || String(err);
      result.failedCount += 1;
      result.errors.push(errMsg);
      await updatePendingQuoteStatus(item.id, 'failed', errMsg);
    }
  }

  isSyncInProgress = false;
  notifySyncState(false);

  // Si se sincronizó al menos una, disparar evento de éxito para toasts y badges
  if (result.syncedCount > 0) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('decoelectric-quotes-synced-success', {
          detail: {
            syncedCount: result.syncedCount,
            timestamp: new Date().toLocaleTimeString('es-DO', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        })
      );
    }
  }

  return result;
}

/**
 * Notifica a la interfaz gráfica el estado del sync
 */
function notifySyncState(isSyncing: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('decoelectric-sync-status-changed', {
        detail: { isSyncing },
      })
    );
  }
}

/**
 * Inicializa los escuchadores globales de red para sincronización automática
 */
export function initBackgroundSyncListeners() {
  if (autoSyncInitialized || typeof window === 'undefined') return;
  autoSyncInitialized = true;

  // 1. Detección automática al recuperar internet
  window.addEventListener('online', async () => {
    console.log('[OfflineSync] Conexión a internet restablecida. Iniciando auto-sincronización...');
    setTimeout(() => {
      syncPendingQuotes();
    }, 1200);
  });

  // 2. Escuchar mensajes del Service Worker si dispara background sync
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'TRIGGER_BACKGROUND_SYNC') {
        console.log('[OfflineSync] Mensaje recibido del Service Worker: TRIGGER_BACKGROUND_SYNC');
        syncPendingQuotes();
      }
    });
  }

  // 3. Revisión inicial al cargar la página si hay conexión
  if (navigator.onLine) {
    setTimeout(() => {
      getPendingQuotesCount().then((count) => {
        if (count > 0) {
          console.log(`[OfflineSync] Se encontraron ${count} presupuestos pendientes de sincronizar. Sincronizando...`);
          syncPendingQuotes();
        }
      });
    }, 2500);
  }

  // 4. Intervalo de verificación periódica si hay pendientes y estamos online
  setInterval(async () => {
    if (navigator.onLine && !isSyncInProgress) {
      const count = await getPendingQuotesCount();
      if (count > 0) {
        syncPendingQuotes();
      }
    }
  }, 45000);
}

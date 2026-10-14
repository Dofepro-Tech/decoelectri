import { useState, useEffect, useCallback } from 'react';
import {
  getPendingQuotes,
  getPendingQuotesCount,
  getSyncedQuotesHistory,
  removePendingQuote,
  clearAllOfflineQuotes,
} from '../services/indexedDBStorage';
import { syncPendingQuotes, SyncResult } from '../services/offlineSyncService';
import { OfflinePendingQuote } from '../types';

export function useOfflineSync() {
  const [pendingQuotes, setPendingQuotes] = useState<OfflinePendingQuote[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncedHistory, setSyncedHistory] = useState<OfflinePendingQuote[]>([]);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [quotes, count, history] = await Promise.all([
        getPendingQuotes(),
        getPendingQuotesCount(),
        getSyncedQuotesHistory(),
      ]);
      setPendingQuotes(quotes);
      setPendingCount(count);
      setSyncedHistory(history);
    } catch (err) {
      console.warn('[useOfflineSync] Error refreshing offline data:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();

    const handleQueueChange = () => {
      refreshData();
    };

    const handleSyncStatus = (e: any) => {
      if (e.detail?.isSyncing !== undefined) {
        setIsSyncing(e.detail.isSyncing);
      }
    };

    const handleSyncSuccess = () => {
      refreshData();
    };

    window.addEventListener('decoelectric-offline-queue-changed', handleQueueChange);
    window.addEventListener('decoelectric-sync-status-changed', handleSyncStatus);
    window.addEventListener('decoelectric-quotes-synced-success', handleSyncSuccess);

    return () => {
      window.removeEventListener('decoelectric-offline-queue-changed', handleQueueChange);
      window.removeEventListener('decoelectric-sync-status-changed', handleSyncStatus);
      window.removeEventListener('decoelectric-quotes-synced-success', handleSyncSuccess);
    };
  }, [refreshData]);

  const syncNow = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncPendingQuotes(true);
      setLastSyncResult(res);
      await refreshData();
      return res;
    } finally {
      setIsSyncing(false);
    }
  }, [refreshData]);

  const removePending = useCallback(async (id: string) => {
    await removePendingQuote(id);
    await refreshData();
  }, [refreshData]);

  const clearAll = useCallback(async () => {
    await clearAllOfflineQuotes();
    await refreshData();
  }, [refreshData]);

  return {
    pendingQuotes,
    pendingCount,
    isSyncing,
    syncedHistory,
    lastSyncResult,
    syncNow,
    removePending,
    clearAll,
    refreshData,
  };
}

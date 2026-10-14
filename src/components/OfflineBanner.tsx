import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  PhoneCall,
  CheckCircle,
  ChevronRight,
  X,
  RefreshCw,
  Database
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useOfflineSync } from '../hooks/useOfflineSync';

interface OfflineBannerProps {
  onOpenCompanyInfo: () => void;
  onOpenSyncQueue?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  onOpenCompanyInfo,
  onOpenSyncQueue,
}) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const { pendingCount, isSyncing, syncNow } = useOfflineSync();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
  const [syncedCountNotice, setSyncedCountNotice] = useState<number | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setIsDismissed(false);
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Escuchar cuando se sincronicen solicitudes exitosamente
  useEffect(() => {
    const handleSuccess = (e: any) => {
      const count = e.detail?.syncedCount;
      if (count && count > 0) {
        setSyncedCountNotice(count);
        setShowRestoredNotice(true);
        const timer = setTimeout(() => {
          setSyncedCountNotice(null);
          setShowRestoredNotice(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('decoelectric-quotes-synced-success', handleSuccess);
    return () => {
      window.removeEventListener('decoelectric-quotes-synced-success', handleSuccess);
    };
  }, []);

  // Notificación de conexión restablecida o sincronización completada
  if (showRestoredNotice) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn px-4 max-w-lg w-full pointer-events-none">
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-2xl border border-emerald-400 text-xs font-bold pointer-events-auto">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <div>
              <p>¡Conexión a internet restablecida!</p>
              {syncedCountNotice ? (
                <p className="text-[11px] font-normal text-emerald-100">
                  🎉 Se {syncedCountNotice === 1 ? 'sincronizó 1 solicitud de presupuesto' : `sincronizaron ${syncedCountNotice} solicitudes`} en segundo plano desde IndexedDB.
                </p>
              ) : isSyncing ? (
                <p className="text-[11px] font-normal text-emerald-100 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Sincronizando datos en segundo plano...
                </p>
              ) : (
                <p className="text-[11px] font-normal text-emerald-100">
                  Todos los servicios en línea y presupuestos disponibles.
                </p>
              )}
            </div>
          </div>

          {onOpenSyncQueue && (
            <button
              type="button"
              onClick={onOpenSyncQueue}
              className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold shrink-0 transition-colors"
            >
              Ver
            </button>
          )}
        </div>
      </div>
    );
  }

  // Notificación discreta mientras esté en línea pero con sincronización en proceso
  if (isOnline && isSyncing) {
    return (
      <div className="fixed top-20 right-4 z-40 animate-fadeIn pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-600 text-white shadow-xl border border-sky-400 text-xs font-bold pointer-events-auto">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Sincronizando presupuestos en segundo plano...</span>
        </div>
      </div>
    );
  }

  // Si está online y no hay aviso de restored, no mostramos banner principal
  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-18 sm:top-20 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none animate-fadeIn">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-2xl border-2 border-amber-300">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Modo Sin Conexión</span>
            </div>

            {pendingCount > 0 ? (
              <span className="text-xs font-bold bg-slate-950 text-amber-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400" />
                <span>{pendingCount} presupuesto(s) en IndexedDB esperando red</span>
              </span>
            ) : (
              <span className="hidden md:inline text-xs font-semibold text-slate-900">
                — Puedes guardar solicitudes; se sincronizarán solas al volver la red.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {pendingCount > 0 && onOpenSyncQueue && (
              <button
                type="button"
                onClick={onOpenSyncQueue}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-amber-300 hover:bg-slate-900 transition-all font-bold text-xs shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ver Cola ({pendingCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenCompanyInfo}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 transition-all font-bold text-xs shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Teléfonos</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-amber-600/30 text-slate-950 transition-colors"
              title="Ocultar aviso"
              aria-label="Cerrar aviso offline"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

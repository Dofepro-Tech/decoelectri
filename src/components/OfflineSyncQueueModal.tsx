import React from 'react';
import {
  X,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Clock,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineSyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSyncQueueModal: React.FC<OfflineSyncQueueModalProps> = ({ isOpen, onClose }) => {
  const { isOnline } = useOnlineStatus();
  const {
    pendingQuotes,
    pendingCount,
    isSyncing,
    syncedHistory,
    syncNow,
    removePending,
    clearAll,
  } = useOfflineSync();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Cola de Sincronización en Segundo Plano
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  IndexedDB
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Presupuestos guardados localmente cuando no tienes internet.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Estado de Red: {isOnline ? 'En línea (Conectado)' : 'Sin conexión (Modo Offline)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 transition-all shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}</span>
              </button>
            )}

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Limpiar cola"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Pending Quotes Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Solicitudes en Espera de Conexión ({pendingCount})</span>
              </h4>
              {pendingCount > 0 && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Se enviarán automáticamente al detectar internet
                </span>
              )}
            </div>

            {pendingQuotes.length === 0 ? (
              <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  ¡No hay solicitudes pendientes!
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Todas las solicitudes de presupuesto están sincronizadas con la base de datos de Decoelectric.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingQuotes.map((item) => {
                  const q = item.quoteData;
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-amber-200 dark:border-amber-900/60 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
                            {item.id}
                          </span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {q.fullName || 'Cliente Sin Nombre'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>{item.syncStatus === 'syncing' ? 'Sincronizando...' : 'Pendiente'}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => removePending(item.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Eliminar de la cola"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Teléfono</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{q.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Sector</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{q.sector || 'Santo Domingo Este'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Servicio</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400 uppercase">{q.serviceNeeded}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Presupuesto</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            RD$ {(q.budgetDOP || 0).toLocaleString('es-DO')}
                          </span>
                        </div>
                      </div>

                      {q.additionalDetails && (
                        <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 line-clamp-2">
                          {q.additionalDetails}
                        </p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Guardado en IndexedDB: {new Date(item.timestamp).toLocaleString('es-DO')}</span>
                        {item.attempts > 0 && (
                          <span className="text-amber-500 font-semibold">Reintentos: {item.attempts}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Synced History Section */}
          {syncedHistory.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Historial Reciente de Sincronizados ({syncedHistory.length})</span>
              </h4>

              <div className="space-y-2">
                {syncedHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.quoteData.fullName || 'Cliente'}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-sky-600 bg-sky-50 dark:bg-sky-950 px-1.5 py-0.5 rounded">
                          {item.quoteData.serviceNeeded}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.quoteData.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Sincronizado: {new Date(item.quoteData.syncedAt || item.timestamp).toLocaleTimeString('es-DO')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        RD$ {(item.quoteData.budgetDOP || 0).toLocaleString('es-DO')}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-500 flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> En Firestore
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Info Box */}
          <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Garantía de Entrega Sin Conexión</span>
              <p className="text-[11px] leading-relaxed text-sky-800 dark:text-sky-300">
                Tus datos nunca se pierden. El sistema utiliza <strong>IndexedDB</strong> local para persistir de manera segura la información y se apoya en los eventos de red del navegador y <strong>Service Workers</strong> para sincronizar con la base de datos central en segundo plano.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {pendingCount > 0
              ? `${pendingCount} solicitud(es) pendiente(s)`
              : 'Todo sincronizado'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { WifiOff, PhoneCall, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineBannerProps {
  onOpenCompanyInfo: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onOpenCompanyInfo }) => {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);
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
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (showRestoredNotice) {
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-600 text-white shadow-xl border border-emerald-400 text-xs font-bold">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>¡Conexión a internet restablecida! Todos los servicios en línea disponibles.</span>
        </div>
      </div>
    );
  }

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-18 sm:top-20 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none animate-fadeIn">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 shadow-2xl border-2 border-amber-300">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950"></span>
            </span>
            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wide">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Modo Sin Conexión</span>
            </div>
            <span className="hidden md:inline text-xs font-semibold text-slate-900">
              — Estás viendo los datos guardados en caché de Decoelectric.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onOpenCompanyInfo}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 transition-all font-bold text-xs shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Teléfonos & Empresa</span>
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

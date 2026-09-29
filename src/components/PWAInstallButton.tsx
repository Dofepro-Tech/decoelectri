import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si ya está ejecutándose como aplicación instalada
  if (isInstalled) {
    if (variant === 'dropdown') {
      return (
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>App Instalada</span>
        </div>
      );
    }
    return null;
  }

  // Si no es instalable y no es iOS, en modo dropdown podemos mostrar cómo guardar acceso directo o nada
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleAction = () => {
    if (isInstallable) {
      install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'dropdown' ? (
        <button
          type="button"
          onClick={handleAction}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors ${className}`}
        >
          <Download className="w-4 h-4 text-sky-500" />
          <span>Instalar App Decoelectric</span>
        </button>
      ) : variant === 'full' ? (
        <button
          type="button"
          onClick={handleAction}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-bold text-xs shadow-md hover:from-sky-500 hover:to-blue-600 transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <span>Instalar App (Offline)</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAction}
          title="Instalar aplicación en tu dispositivo"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      )}

      {/* Modal Guía para iOS */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white relative">
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Instalar en iPhone o iPad</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Decoelectric PWA Offline</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <p>Toca el botón <Share className="w-3.5 h-3.5 inline mx-1 text-sky-600" /> <strong>Compartir</strong> en la barra inferior de Safari.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <p>Desplázate hacia abajo y selecciona <strong>"Agregar al inicio"</strong>.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <p>Toca <strong>Agregar</strong> arriba a la derecha. ¡Listo! Tendrás acceso con o sin internet.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#003366] text-white font-bold text-xs hover:bg-[#002244] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

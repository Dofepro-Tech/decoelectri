import React, { useState, useEffect } from 'react';
import {
  Cookie,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Check,
  X,
  Settings2,
  ExternalLink
} from 'lucide-react';
import {
  getStoredPreferences,
  savePreferences,
  rejectOptionalCookies,
  CookiePreferences
} from '../utils/cookieUtils';

interface CookieBannerProps {
  onOpenPolicy?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPolicy }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(getStoredPreferences);
  const [isVisible, setIsVisible] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Estados temporales para el modal de personalización
  const [tempAi, setTempAi] = useState(true);
  const [tempAnalytics, setTempAnalytics] = useState(true);

  useEffect(() => {
    const current = getStoredPreferences();
    setPreferences(current);
    setTempAi(current.aiAssistant);
    setTempAnalytics(current.analytics);

    // Si aún no ha respondido, mostrar el banner tras 800ms
    if (!current.hasAnswered) {
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Escuchar eventos globales para reabrir el configurador de cookies desde footer o navbar
  useEffect(() => {
    const handleOpenSettings = () => {
      const current = getStoredPreferences();
      setTempAi(current.aiAssistant);
      setTempAnalytics(current.analytics);
      setShowConfigModal(true);
    };

    window.addEventListener('decoelectric-open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('decoelectric-open-cookie-settings', handleOpenSettings);
  }, []);

  const handleAcceptAll = async () => {
    await savePreferences({ aiAssistant: true, analytics: true });
    setIsVisible(false);
    setShowConfigModal(false);
  };

  const handleRejectOptional = async () => {
    await rejectOptionalCookies();
    setIsVisible(false);
    setShowConfigModal(false);
  };

  const handleSaveCustom = async () => {
    await savePreferences({ aiAssistant: tempAi, analytics: tempAnalytics });
    setIsVisible(false);
    setShowConfigModal(false);
  };

  return (
    <>
      {/* Banner Principal de Cookies */}
      {isVisible && !showConfigModal && (
        <aside
          id="cookie-consent-banner"
          aria-label="Aviso de cookies y privacidad"
          className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-md z-40 p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Privacidad & Cookies
                </h4>
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  aria-label="Cerrar con esenciales"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Utilizamos cookies técnicas para garantizar el funcionamiento del cotizador, y opcionales para potenciar el Asistente IA DecoBot y análisis de navegación.
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Personalizar</span>
              </button>
              {onOpenPolicy && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={onOpenPolicy}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>Política</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 justify-end">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Solo Esenciales
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sm transition-all"
              >
                Aceptar Todas
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Modal de Personalización de Preferencias de Cookies */}
      {showConfigModal && (
        <div
          id="cookie-settings-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowConfigModal(false)}
        >
          <div
            id="cookie-settings-container"
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Cookie className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Preferencias de Cookies & Privacidad
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Decoelectric • Control de datos del usuario
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de Categorías */}
            <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
              {/* 1. Cookies Esenciales */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Cookies Estrictamente Necesarias
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                      Obligatorias
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Permiten la autenticación con Firebase, recordar presupuestos guardados y la selección de modo claro/oscuro. No pueden desactivarse.
                  </p>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* 2. Asistente IA DecoBot & Voz */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Asistente IA DecoBot & Conversaciones
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Permite recordar el hilo de la conversación, personalización técnica de materiales y síntesis de voz en las consultas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTempAi(!tempAi)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    tempAi ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={tempAi}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      tempAi ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Analítica & Rendimiento */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Rendimiento & Métricas de Uso
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Nos ayuda a saber qué servicios y cálculos de presupuesto son más consultados para optimizar la velocidad y precisión del sitio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTempAnalytics(!tempAnalytics)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    tempAnalytics ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  role="switch"
                  aria-checked={tempAnalytics}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      tempAnalytics ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                Rechazar Opcionales
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500 transition-all"
                >
                  Guardar Preferencias
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-md transition-all"
                >
                  Aceptar Todas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

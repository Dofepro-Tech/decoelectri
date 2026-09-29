import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Target,
  Compass,
  Award,
  X,
  Phone,
  Mail,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Instagram,
  Cookie,
  Settings2
} from 'lucide-react';
import { SiteSettings } from '../types';

export type LegalTab = 'nosotros' | 'terminos' | 'privacidad' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
  siteSettings: SiteSettings;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'nosotros',
  siteSettings,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const phone1 = siteSettings.phoneNumber || '809-303-1730';
  const phone2 = siteSettings.secondaryPhone || '849-264-8965';
  const whatsapp = siteSettings.whatsappNumber || '809-303-1738';
  const email = siteSettings.contactEmail || 'dofeprotech@gmail.com';
  const instagram = siteSettings.instagramUrl || 'https://www.instagram.com/decoelectri/';

  const cleanWaNumber = whatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanWaNumber.startsWith('1') ? cleanWaNumber : '1' + cleanWaNumber}?text=Hola%20Decoelectric!%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios.`;

  return (
    <div
      id="legal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="legal-modal-container"
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Tabs */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/60">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Deco<span className="text-sky-600 dark:text-sky-400">electric</span> Corporativo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Santo Domingo Este, República Dominicana
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('nosotros')}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'nosotros'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Misión & Valores</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terminos')}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'terminos'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Términos y Condiciones</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacidad')}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'privacidad'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Política de Privacidad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cookies')}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'cookies'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cookie className="w-3.5 h-3.5" />
              <span>Política de Cookies</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* ===================== TAB 1: MISIÓN, VISIÓN Y VALORES ===================== */}
          {activeTab === 'nosotros' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Misión */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50/40 dark:from-sky-950/30 dark:to-blue-950/20 border border-sky-100 dark:border-sky-900/40">
                <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold mb-2">
                  <Target className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h3 className="text-base font-extrabold uppercase tracking-wide">Nuestra Misión</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {siteSettings.mission}
                </p>
              </div>

              {/* Visión */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/40">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold mb-2">
                  <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-base font-extrabold uppercase tracking-wide">Nuestra Visión</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {siteSettings.vision}
                </p>
              </div>

              {/* Valores */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Award className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h3 className="text-base font-extrabold uppercase tracking-wide">
                    Nuestros Valores Fundamentales
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {(siteSettings.values || []).map((val, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 dark:text-slate-200 leading-snug">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: TÉRMINOS Y CONDICIONES ===================== */}
          {activeTab === 'terminos' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                Última actualización: {new Date().toLocaleDateString('es-DO', { month: 'long', year: 'numeric' })}. Regulado bajo la legislación de comercio y garantías de la República Dominicana.
              </div>
              <div className="whitespace-pre-line text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200">
                {siteSettings.termsAndConditions}
              </div>
            </div>
          )}

          {/* ===================== TAB 3: POLÍTICA DE PRIVACIDAD ===================== */}
          {activeTab === 'privacidad' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                En Decoelectric respetamos tu privacidad. Tus datos personales y de ubicación en Santo Domingo Este solo se utilizan para coordinar tus servicios técnicos.
              </div>
              <div className="whitespace-pre-line text-xs sm:text-sm font-sans leading-relaxed text-slate-800 dark:text-slate-200">
                {siteSettings.privacyPolicy}
              </div>
            </div>
          )}

          {/* ===================== TAB 4: POLÍTICA DE COOKIES ===================== */}
          {activeTab === 'cookies' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                    <Cookie className="w-4 h-4 text-amber-600" />
                    <span>Transparencia en el Uso de Cookies</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                    Decoelectric utiliza cookies técnicas y funcionales para asegurar la mejor experiencia en presupuestos eléctricos y revestimientos de PVC en República Dominicana.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent('decoelectric-open-cookie-settings'));
                    }, 200);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Configurar</span>
                </button>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
                    1. ¿Qué son las Cookies?
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300">
                    Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador o móvil) cuando visitas nuestro sitio web. Ayudan a que el sitio recuerde tus acciones y preferencias durante un período de tiempo.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    2. Tipos de Cookies que utilizamos
                  </h4>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                      <span className="font-semibold text-sky-600 dark:text-sky-400">Cookies Técnicas / Esenciales:</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                        Necesarias para la navegación, autenticación con Firebase, modo oscuro/claro y persistencia de cotizaciones temporales calculadas. No almacenan información sensible identificable.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Cookies del Asistente IA DecoBot & Voz:</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                        Almacenan de forma segura el contexto de consulta con DecoBot, preferencias de voz y síntesis de audio para que no tengas que repetir tus especificaciones técnicas al navegar.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">Cookies Analíticas:</span>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                        Nos permiten recopilar estadísticas de visitas y servicios más solicitados en Santo Domingo Este para mejorar nuestros tiempos de respuesta y catálogo.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
                    3. Gestión y Revocación del Consentimiento
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 mb-2">
                    Puedes modificar o revocar tu consentimiento en cualquier momento haciendo clic en el enlace de <strong>Preferencias de Cookies</strong> situado en el pie de página o utilizando el botón superior. Además, puedes configurar tu navegador web para rechazar o eliminar cookies según lo prefieras.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with direct contact info */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
            <a
              href={`tel:${phone1.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 hover:text-sky-600"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{phone1}</span>
            </a>
            <span>•</span>
            <a
              href={`tel:${phone2.replace(/\D/g, '')}`}
              className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 hover:text-sky-600"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>{phone2}</span>
            </a>
            <span>•</span>
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-1 hover:text-sky-600"
            >
              <Mail className="w-3.5 h-3.5 text-sky-500" />
              <span>{email}</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: {whatsapp}</span>
            </a>

            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-rose-500 transition-colors"
                title="Instagram de la Empresa"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

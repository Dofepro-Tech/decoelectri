import React from 'react';
import {
  WifiOff,
  Phone,
  PhoneCall,
  Clock,
  MapPin,
  Mail,
  Zap,
  Hammer,
  Wrench,
  CheckCircle2,
  RefreshCw,
  X,
  ShieldCheck
} from 'lucide-react';
import { SiteSettings } from '../types';

interface OfflineCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: SiteSettings;
}

export const OfflineCompanyModal: React.FC<OfflineCompanyModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
}) => {
  if (!isOpen) return null;

  const phonePrimary = siteSettings?.whatsappNumber || '809-303-1738';
  const phoneOffice = siteSettings?.phoneNumber || '809-303-1730';
  const phoneEmergency = siteSettings?.secondaryPhone || '849-264-8965';
  const email = siteSettings?.contactEmail || 'dofeprotech@gmail.com';
  const address = 'Santo Domingo Este, República Dominicana';

  const cleanNumber = (num: string) => num.replace(/\D/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#003366] to-[#002244] p-6 text-white text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>Modo Sin Conexión a Internet</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-2">
            <img
              src="/LogoPrincipal.png"
              alt="Decoelectric"
              className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover bg-slate-900 shadow-md"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="text-left">
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Decoelectric
                <span className="text-amber-400 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/30">
                  Offline
                </span>
              </h2>
              <p className="text-xs text-sky-200 font-medium">
                Electricidad Residencial & Paneles PVC
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-200 mt-2 max-w-sm mx-auto leading-relaxed">
            Tu dispositivo está sin conexión a internet. Los datos de la empresa están disponibles para que puedas contactarnos telefónicamente.
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Numbers list */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-500" />
              Llamadas Directas (Funcionan sin Internet)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${cleanNumber(phonePrimary)}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    WhatsApp & Presupuestos
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {phonePrimary}
                  </p>
                </div>
              </a>

              <a
                href={`tel:${cleanNumber(phoneOffice)}`}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-sky-800 dark:text-sky-300">
                    Oficina Técnica
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {phoneOffice}
                  </p>
                </div>
              </a>

              <a
                href={`tel:${cleanNumber(phoneEmergency)}`}
                className="sm:col-span-2 flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-rose-800 dark:text-rose-300">
                      Emergencias Eléctricas 24/7 (SDE)
                    </p>
                    <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-bold">
                      24 Horas
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {phoneEmergency}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Location and schedule */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ubicación & Cobertura
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {address} (Alma Rosa, Ens. Ozama, Lucerna, San Isidro, Invivienda, El Pensador, Los Mina).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Horario de Atención
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Lunes a Sábado: 8:00 AM – 6:00 PM <br />
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Emergencias de cortes y cortocircuitos: Disponibles 24/7
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <Mail className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Correo Electrónico
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Quick services recap */}
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Servicios Garantizados
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Electricidad Residencial</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                <Hammer className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Paneles PVC Techos/Paredes</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Plomería</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Remodelación & Luces LED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar Conexión
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#003366] hover:bg-[#002244] transition-colors shadow-sm"
          >
            Continuar Explorando la App
          </button>
        </div>
      </div>
    </div>
  );
};

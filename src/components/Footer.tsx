import React, { useState } from 'react';
import { Zap, MapPin, Phone, Instagram, MessageCircle, Mail, ArrowUp, Shield, QrCode, Smartphone, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SiteSettings } from '../types';
import { InstagramQRModal } from './InstagramQRModal';

interface FooterProps {
  siteSettings?: SiteSettings;
  onOpenLegal?: (tab: 'nosotros' | 'terminos' | 'privacidad' | 'cookies') => void;
  onOpenAIChat?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ siteSettings, onOpenLegal, onOpenAIChat }) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const phone1 = siteSettings?.phoneNumber || '809-303-1730';
  const phone2 = siteSettings?.secondaryPhone || '849-264-8965';
  const whatsapp = siteSettings?.whatsappNumber || '809-303-1738';
  const email = siteSettings?.contactEmail || 'dofeprotech@gmail.com';
  const instagramUrl = siteSettings?.instagramUrl
    ? (siteSettings.instagramUrl.startsWith('http')
      ? siteSettings.instagramUrl
      : `https://instagram.com/${siteSettings.instagramUrl.replace('@', '')}`)
    : 'https://www.instagram.com/decoelectri/';

  const cleanWa = whatsapp.replace(/\D/g, '');
  const waFull = cleanWa.startsWith('1') ? cleanWa : (cleanWa.length === 10 ? `1${cleanWa}` : cleanWa);

  return (
    <footer className="bg-slate-900 text-slate-300 dark:bg-[#060a12] border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full p-0.5 bg-slate-800 border border-sky-500/40 flex items-center justify-center overflow-hidden shadow-md ring-2 ring-sky-500/20">
                <img
                  src="/LogoPrincipal.png"
                  alt="Decoelectric Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Deco<span className="text-sky-400">electric</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Transformamos y damos energía a tus espacios. Especialistas en electricidad residencial segura, remodelaciones de lujo con paneles PVC decorativos y plomería en Santo Domingo Este.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de la empresa"
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-gradient-to-tr hover:from-amber-500 hover:via-rose-500 hover:to-purple-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                title="Síguenos en Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>

              <a
                href={`https://wa.me/${waFull}?text=Hola%20Decoelectric!%20Deseo%20informaci%C3%B3n.`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp de Decoelectric"
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                title={`WhatsApp: ${whatsapp}`}
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label="Correo de Decoelectric"
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm"
                  title={`Correo: ${email}`}
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Services */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Nuestros Servicios
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#servicios" className="hover:text-sky-400 transition-colors">
                  Electricidad Residencial Certificada
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-sky-400 transition-colors">
                  Instalación de Paneles PVC Mármol / Madera
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-sky-400 transition-colors">
                  Techos y Muros 3D en PVC
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-sky-400 transition-colors">
                  Modernización de Tableros y Breakers
                </a>
              </li>
              <li>
                <a href="#servicios" className="hover:text-sky-400 transition-colors">
                  Plomería
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Service Zone: Santo Domingo Este Y Más */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Zona de Cobertura</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Atención técnica y proyectos en:
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-950/80 text-sky-300 border border-sky-700/60 shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Santo Domingo Este Y Más</span>
              </span>
            </div>
          </div>

          {/* Col 4: Quick Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Atención Rápida
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <a
                href={`tel:${phone1.replace(/\D/g, '')}`}
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{phone1}</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Principal</span>
              </a>

              <a
                href={`tel:${phone2.replace(/\D/g, '')}`}
                className="flex items-center gap-2 hover:text-sky-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="font-semibold">{phone2}</span>
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">Línea 2</span>
              </a>

              <a
                href={`https://wa.me/${waFull}?text=Hola%20Decoelectric!`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">WhatsApp: {whatsapp}</span>
              </a>

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 hover:text-sky-400 transition-colors truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </a>
              )}

              <div className="pt-1">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80">
                  ⚡ Emergencias 24/7 en SDO Este
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Volver arriba</span>
            </button>
          </div>
        </div>

        {/* Instagram QR Direct Scan Card */}
        <div
          id="footer-instagram-qr-card"
          className="mt-12 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-800/90 via-slate-800/60 to-slate-900/90 border border-slate-700/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div
              className="p-3 bg-white rounded-2xl shadow-lg shrink-0 border border-white/20 group relative cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowQRModal(true)}
              title="Haz clic para agrandar el código QR"
            >
              <QRCodeSVG
                value={instagramUrl}
                size={100}
                level="H"
                bgColor="#ffffff"
                fgColor="#0f172a"
                marginSize={1}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-950/40 rounded-2xl transition-opacity">
                <span className="text-[10px] font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded-md">
                  Agrandar
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold text-pink-300 bg-pink-950/70 border border-pink-700/50">
                <Instagram className="w-3.5 h-3.5 text-pink-400" />
                <span>Instagram: @decoelectri</span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                ¡Escanea para seguirnos en Instagram!
              </h4>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Apunta la cámara de tu teléfono móvil a este código QR para ver fotos de nuestros proyectos de electricidad, paneles PVC y solicitar presupuestos directos por mensaje directo (DM).
              </p>
              <div className="flex items-center gap-2 pt-0.5 text-[11px] text-slate-400 justify-center sm:justify-start">
                <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                <span>Sin apps adicionales, solo abre la cámara de tu móvil</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              id="footer-open-qr-modal"
              type="button"
              onClick={() => setShowQRModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-700/80 hover:bg-slate-700 border border-slate-600 transition-colors"
            >
              <QrCode className="w-4 h-4 text-slate-300" />
              <span>Ver QR Grande</span>
            </button>

            <a
              id="footer-open-instagram-link"
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-md hover:shadow-rose-600/20 transition-all active:scale-95"
            >
              <Instagram className="w-4 h-4" />
              <span>Abrir @decoelectri</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} <strong className="text-slate-200">Decoelectric S.R.L.</strong> Todos los derechos reservados. Santo Domingo Este, Rep. Dominicana.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {onOpenLegal && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenLegal('nosotros')}
                  className="hover:text-white transition-colors"
                >
                  Misión, Visión & Valores
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terminos')}
                  className="hover:text-white transition-colors"
                >
                  Términos y Condiciones
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacidad')}
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidad
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => onOpenLegal('cookies')}
                  className="hover:text-white transition-colors"
                >
                  Política de Cookies
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('decoelectric-open-cookie-settings'));
                  }}
                  className="hover:text-amber-400 transition-colors font-medium"
                >
                  Preferencias de Cookies
                </button>
              </>
            )}

            {onOpenAIChat && (
              <>
                <span>•</span>
                <button
                  type="button"
                  onClick={onOpenAIChat}
                  className="hover:text-sky-400 text-sky-300 font-semibold transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>DecoBot AI</span>
                </button>
              </>
            )}

            <span>•</span>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-colors flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5 text-pink-400" />
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Instagram QR Code Modal */}
      <InstagramQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        instagramUrl={instagramUrl}
      />
    </footer>
  );
};


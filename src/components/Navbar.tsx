import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Zap,
  Sparkles,
  Moon,
  Sun,
  Menu,
  X,
  User,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  Instagram,
  Phone,
  QrCode,
  Settings,
  ChevronDown,
  Bot,
  Bell,
  WifiOff,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../types';
import { InstagramQRModal } from './InstagramQRModal';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onOpenQuote: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  siteSettings?: SiteSettings;
  onOpenLegal?: (tab: 'nosotros' | 'terminos' | 'privacidad' | 'cookies') => void;
  onOpenAIChat?: () => void;
  onOpenNotifications?: () => void;
  onOpenOfflineInfo?: () => void;
  onOpenFavoritesNotes?: () => void;
  currentThemeId?: string;
  selectTheme?: (id: any) => void;
  availableThemes?: any[];
}

export const Navbar: React.FC<NavbarProps> = ({
  isDark,
  toggleTheme,
  onOpenQuote,
  onOpenAuth,
  onOpenAdmin,
  siteSettings,
  onOpenLegal,
  onOpenAIChat,
  onOpenNotifications,
  onOpenOfflineInfo,
  onOpenFavoritesNotes,
  currentThemeId,
  selectTheme,
  availableThemes = [],
}) => {
  const { user, profile, isAdmin, isCliente, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstagramQR, setShowInstagramQR] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isThemesExpanded, setIsThemesExpanded] = useState(false);
  const [activeThemeCategory, setActiveThemeCategory] = useState<'light' | 'dark'>(isDark ? 'dark' : 'light');

  // Sync activeThemeCategory when theme changes
  useEffect(() => {
    setActiveThemeCategory(isDark ? 'dark' : 'light');
  }, [isDark]);

  const settingsDropdownRef = useRef<HTMLDivElement>(null);
  const settingsBtnDesktopRef = useRef<HTMLButtonElement>(null);
  const settingsBtnMobileRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cierra el menú de configuración al hacer clic en cualquier otra parte de la pantalla
  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      // Si el clic fue dentro del panel de configuración, no cerramos
      if (settingsDropdownRef.current && settingsDropdownRef.current.contains(target)) {
        return;
      }
      // Si el clic fue en alguno de los botones de apertura, permitimos que el toggle funcione
      if (
        (settingsBtnDesktopRef.current && settingsBtnDesktopRef.current.contains(target)) ||
        (settingsBtnMobileRef.current && settingsBtnMobileRef.current.contains(target))
      ) {
        return;
      }
      // Clic en cualquier otra parte de la pantalla: cerrar el menú
      setIsSettingsOpen(false);
    };

    document.addEventListener('pointerdown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSettingsOpen]);

  const navLinks = [
    { name: 'Servicios', href: '#servicios' },
    { name: 'Nuestro Trabajo', href: '#galeria' },
    { name: 'Calculadora', href: '#cotizador' },
    { name: 'Por Qué Elegirnos', href: '#por-que-elegirnos' },
    { name: 'Testimonios', href: '#testimonios' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappRaw = (siteSettings?.whatsappNumber || '809-303-1738').replace(/\D/g, '');
  const whatsappWithCode = whatsappRaw.startsWith('1') ? whatsappRaw : (whatsappRaw.length === 10 ? `1${whatsappRaw}` : whatsappRaw);
  const WHATSAPP_URL = `https://wa.me/${whatsappWithCode}?text=Hola%20Decoelectric%2C%20quisiera%20solicitar%20una%20cotizaci%C3%B3n%20para%20un%20proyecto.`;

  const instagramHref = siteSettings?.instagramUrl
    ? (siteSettings.instagramUrl.startsWith('http')
      ? siteSettings.instagramUrl
      : `https://instagram.com/${siteSettings.instagramUrl.replace('@', '')}`)
    : 'https://www.instagram.com/decoelectri/';

  return (
    <header
      id="navbar-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0a0e17]/95 backdrop-blur-md shadow-md dark:shadow-black/40 py-2.5 border-b border-slate-200 dark:border-slate-800/80'
          : 'bg-white/80 dark:bg-[#0a0e17]/80 backdrop-blur-sm py-3.5 border-b border-slate-100 dark:border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          id="brand-logo"
          href="#"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-sky-500/20 via-blue-500/10 to-indigo-500/20 border border-sky-400/50 dark:border-sky-500/40 flex items-center justify-center shadow-md shadow-sky-500/15 group-hover:scale-105 transition-transform duration-200 overflow-hidden ring-2 ring-sky-500/20">
            <img
              src="/LogoPrincipal.png"
              alt="Decoelectric Logo"
              className="w-full h-full object-contain rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Deco<span className="text-sky-600 dark:text-sky-400">electric</span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-300 hidden sm:inline" />
            </div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-slate-400 -mt-1">
              Electricidad • Plomería • Paneles PVC
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a
              key={link.name}
              id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className="px-3 py-2 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Actions (Instagram + Settings Dropdown) */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Instagram Official Icon & Quick QR Code Button */}
          <div className="flex items-center gap-1">
            <a
              id="nav-instagram-btn"
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram Oficial: @decoelectri"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-pink-600 dark:text-pink-400 bg-slate-50 dark:bg-slate-900/80 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:border-pink-300 dark:hover:border-pink-800 transition-all focus:outline-none flex items-center justify-center"
              aria-label="Instagram de la empresa (@decoelectri)"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <button
              id="nav-instagram-qr-btn"
              type="button"
              onClick={() => setShowInstagramQR(true)}
              title="Escanear Código QR de Instagram"
              aria-label="Escanear Código QR de Instagram"
              className="hidden lg:flex p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-pink-600 dark:hover:text-pink-400 bg-slate-50 dark:bg-slate-900/80 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:border-pink-300 dark:hover:border-pink-800 transition-all focus:outline-none items-center justify-center"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Instalar App PWA */}
          <PWAInstallButton variant="compact" />

          {/* Notificaciones Push (FCM) */}
          {onOpenNotifications && (
            <button
              id="nav-push-notifications-btn"
              type="button"
              onClick={onOpenNotifications}
              title="Notificaciones Push (FCM): Promociones y Presupuestos"
              aria-label="Activar o gestionar Notificaciones Push"
              className="relative w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-50 dark:bg-slate-900/80 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors focus:outline-none flex items-center justify-center"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            </button>
          )}

          {/* Menú de Configuraciones (Solo Icono) */}
          <div className="relative">
            <button
              ref={settingsBtnDesktopRef}
              id="nav-settings-btn"
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              aria-expanded={isSettingsOpen}
              aria-label="Configuración y Cuenta"
              title="Configuración y Cuenta"
              className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all focus:outline-none ${
                isAdmin
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm shadow-amber-500/20'
                  : isSettingsOpen
                  ? 'bg-sky-100 dark:bg-sky-950/90 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
                  : 'bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Settings className={`w-4 h-4 ${isAdmin ? 'text-slate-950' : 'text-slate-600 dark:text-slate-300'}`} />
              {isAdmin && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white dark:border-slate-900" />
              )}
              {user && !isAdmin && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile controls: Settings + Theme toggle + Hamburger */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button
            ref={settingsBtnMobileRef}
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isAdmin
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : isSettingsOpen
                ? 'bg-sky-100 dark:bg-sky-950/90 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200'
            }`}
            title="Configuración y Cuenta"
            aria-label="Abrir configuración y cuenta"
            aria-expanded={isSettingsOpen}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-dropdown"
          className="sm:hidden px-4 pt-3 pb-6 bg-white dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800 shadow-xl"
        >
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Abrir Panel de Administrador</span>
                </button>
              )}

              {/* Botón rápido de DecoBot IA en Mobile */}
              {onOpenAIChat && (
                <button
                  id="mobile-menu-decobot-btn"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAIChat();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sm transition-all"
                >
                  <Bot className="w-4 h-4 text-amber-300" />
                  <span>Consultar Asistente DecoBot IA</span>
                </button>
              )}

              {/* Información Offline y Teléfonos de Emergencia */}
              {onOpenOfflineInfo && (
                <button
                  id="mobile-menu-offline-btn"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenOfflineInfo();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 hover:bg-amber-100 transition-colors"
                >
                  <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Información de la Empresa (Modo Offline)</span>
                </button>
              )}

              {/* Botón rápido de Notificaciones Push en Mobile */}
              {onOpenNotifications && (
                <button
                  id="mobile-menu-notifications-btn"
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition-colors"
                >
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>Notificaciones Push (FCM)</span>
                </button>
              )}

              {/* Botón rápido de Instalar PWA en Mobile */}
              <div className="pt-1">
                <PWAInstallButton variant="full" className="w-full" />
              </div>

              {/* Botón rápido de Configuraciones en Mobile */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200"
              >
                <Settings className="w-4 h-4" />
                <span>Configuraciones & Cuenta</span>
              </button>

              {/* Atención Rápida Mobile Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${(siteSettings?.phoneNumber || '809-303-1730').replace(/\D/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{siteSettings?.phoneNumber || '809-303-1730'}</span>
                </a>
                <a
                  href={`tel:${(siteSettings?.secondaryPhone || '849-264-8965').replace(/\D/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-600" />
                  <span>{siteSettings?.secondaryPhone || '849-264-8965'}</span>
                </a>
              </div>

              {/* Instagram & Legal Links */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <a
                    href={instagramHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-bold text-pink-600 dark:text-pink-400 py-1"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>@decoelectri</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowInstagramQR(true);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-300 border border-pink-200 dark:border-pink-800/60 font-semibold"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Ver QR</span>
                  </button>
                </div>

                {onOpenLegal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLegal('nosotros');
                    }}
                    className="text-slate-600 dark:text-slate-400 hover:text-sky-500 font-semibold"
                  >
                    Misión & Visión
                  </button>
                )}
              </div>

              {user || profile ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 text-xs font-bold text-rose-500"
                >
                  Cerrar Sesión ({isAdmin ? 'Administrador' : 'Cliente'})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-center py-2 text-xs font-bold text-sky-600 dark:text-sky-400"
                >
                  Iniciar Sesión (Cliente / Admin)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instagram QR Scanner Modal */}
      <InstagramQRModal
        isOpen={showInstagramQR}
        onClose={() => setShowInstagramQR(false)}
        instagramUrl={instagramHref}
      />

      {/* Portal del Menú Desplegable de Configuración (Cierra al hacer clic en cualquier parte de la pantalla) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isSettingsOpen && (
              <div className="fixed inset-0 z-[99990] pointer-events-auto">
                {/* Backdrop para cerrar al hacer clic en cualquier lugar de la pantalla */}
                <motion.div
                  id="nav-settings-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-[2px] cursor-pointer"
                  onClick={() => setIsSettingsOpen(false)}
                  onPointerDown={() => setIsSettingsOpen(false)}
                  aria-hidden="true"
                />

                {/* Dropdown flotante de Configuración */}
                <motion.div
                  ref={settingsDropdownRef}
                  id="nav-settings-dropdown"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Panel de Configuración"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="fixed top-16 right-3 sm:right-6 md:right-8 lg:right-12 z-[99995] w-[calc(100vw-1.5rem)] max-w-[360px] sm:max-w-sm rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 overflow-y-auto max-h-[calc(100vh-5rem)] text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Encabezado */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Panel de Configuración</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Ajustes generales y cuenta</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      aria-label="Cerrar configuraciones"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sección 1: Clientes / Admin & Cuenta */}
                  <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                    {isAdmin ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Administrador Activo</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Conectado</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          Control total de cotizaciones, catálogo de servicios, galería y ajustes del sitio.
                        </p>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingsOpen(false);
                              onOpenAdmin();
                            }}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm transition-all"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Panel Admin</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingsOpen(false);
                              logout();
                            }}
                            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/50 transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    ) : user || profile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                            <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Cliente: {profile?.displayName || user?.email?.split('@')[0] || 'Usuario'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Activo</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user?.email || profile?.displayName || 'Cuenta activa'}
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <a
                            href="#cotizador"
                            onClick={(e) => {
                              setIsSettingsOpen(false);
                              handleLinkClick(e, '#cotizador');
                            }}
                            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            Mis Cotizaciones & Calculadora
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingsOpen(false);
                              logout();
                            }}
                            className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                          >
                            <LogOut className="w-3 h-3" />
                            <span>Cerrar</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Acceso Clientes / Admin</span>
                          <span className="text-[10px] text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">Seguro</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Inicia sesión o regístrate para consultar tus cotizaciones, guardar proyectos o acceder al panel administrativo.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onOpenAuth();
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sm transition-all"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Iniciar Sesión / Registrarse</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sección Personal: Favoritos y Notas */}
                  {onOpenFavoritesNotes && (
                    <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-500 dark:text-rose-400 flex items-center justify-center">
                          <Heart className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">Favoritos y Notas</span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                            Tus ideas y diseños guardados
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenFavoritesNotes();
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                      >
                        Abrir
                      </button>
                    </div>
                  )}

                  {/* Sección 2: Selector de Apariencia Plegable con 20 Temas (10 Claros, 10 Oscuros) */}
                  <div className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                    {/* Botón de Cabecera (Plegable Trigger) */}
                    <button
                      type="button"
                      onClick={() => setIsThemesExpanded(!isThemesExpanded)}
                      className="w-full flex items-center justify-between p-3 cursor-pointer text-left focus:outline-none hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
                      aria-expanded={isThemesExpanded}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded bg-sky-500/10 text-sky-500 flex items-center justify-center">
                          <Sun className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">Paleta de Temas Premium</span>
                          <span className="block text-[9px] text-slate-500 dark:text-slate-400">10 Claros y 10 Oscuros • Personalizar</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono font-semibold hidden sm:inline">20 Temas</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isThemesExpanded ? 'rotate-180' : 'rotate-0'}`} />
                      </div>
                    </button>

                    {/* Contenido Plegable */}
                    <AnimatePresence initial={false}>
                      {isThemesExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="border-t border-slate-200/60 dark:border-slate-800/60 p-3 pt-2.5 space-y-2.5 overflow-hidden"
                        >
                          {/* Segmented Switcher Control para Claros / Oscuros */}
                          <div className="flex p-0.5 bg-slate-200/60 dark:bg-slate-950/60 rounded-lg">
                            <button
                              type="button"
                              onClick={() => setActiveThemeCategory('light')}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer text-center ${
                                activeThemeCategory === 'light'
                                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              Temas Claros (10)
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveThemeCategory('dark')}
                              className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer text-center ${
                                activeThemeCategory === 'dark'
                                  ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              Temas Oscuros (10)
                            </button>
                          </div>

                          <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-normal">
                            Selecciona una de las combinaciones de color diseñadas a mano:
                          </p>

                          {/* Grid of 10 themes in selected mode */}
                          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                            {availableThemes
                              .filter((t) => t.mode === activeThemeCategory)
                              .map((t) => {
                                const isActive = currentThemeId === t.id;
                                return (
                                  <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => selectTheme?.(t.id)}
                                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[10px] font-medium transition-all cursor-pointer ${
                                      isActive
                                        ? 'bg-white dark:bg-slate-800 border-sky-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-sky-500/20'
                                        : 'bg-white/40 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
                                    }`}
                                  >
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                      style={{ backgroundColor: t.primaryColor }}
                                    />
                                    <span className="truncate">{t.name}</span>
                                  </button>
                                );
                              })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sección 3: Redes Sociales & QR */}
                  <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Redes Oficiales</span>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={instagramHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50 hover:bg-pink-100 dark:hover:bg-pink-900/40 border border-pink-200 dark:border-pink-900/50 transition-colors"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>@decoelectri</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          setShowInstagramQR(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ver Código QR</span>
                      </button>
                    </div>
                  </div>

                  {/* Sección 4: Líneas Telefónicas & Cobertura */}
                  <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Zona de Cobertura:</span>
                      <span className="text-sky-600 dark:text-sky-400 font-bold">Santo Domingo Este Y Más</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Línea Directa:</span>
                      <a href={`tel:${(siteSettings?.phoneNumber || '809-303-1730').replace(/\D/g, '')}`} className="font-semibold hover:text-sky-600">
                        {siteSettings?.phoneNumber || '809-303-1730'}
                      </a>
                    </div>
                  </div>

                  {/* Sección Notificaciones Push (FCM) */}
                  {onOpenNotifications && (
                    <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">Notificaciones Push</span>
                          <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                            Promociones y presupuestos
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenNotifications();
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                      >
                        Configurar
                      </button>
                    </div>
                  )}

                  {/* Sección Modo Offline & PWA */}
                  <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                          <WifiOff className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">Modo Offline Activo</span>
                          <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Service Worker funcionando</span>
                        </div>
                      </div>
                      {onOpenOfflineInfo && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsSettingsOpen(false);
                            onOpenOfflineInfo();
                          }}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition-colors"
                        >
                          Ver Empresa
                        </button>
                      )}
                    </div>
                    <PWAInstallButton variant="dropdown" />
                  </div>

                  {/* Sección 5: Preferencias de Cookies & Asistente IA */}
                  <div className="mb-3 grid grid-cols-2 gap-2">
                    {onOpenAIChat && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSettingsOpen(false);
                          onOpenAIChat();
                        }}
                        className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800/80 hover:bg-sky-100 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>DecoBot IA</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        window.dispatchEvent(new CustomEvent('decoelectric-open-cookie-settings'));
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                      <span>Cookies</span>
                    </button>
                  </div>

                  {/* Sección 6: Legal & Garantías */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenLegal?.('terminos');
                      }}
                      className="hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
                    >
                      Garantías & Términos
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenLegal?.('nosotros');
                      }}
                      className="hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
                    >
                      Nosotros
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenLegal?.('privacidad');
                      }}
                      className="hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
                    >
                      Privacidad
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenLegal?.('cookies');
                      }}
                      className="hover:text-sky-600 dark:hover:text-sky-400 hover:underline"
                    >
                      Cookies
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { GallerySection } from './components/GallerySection';
import { BudgetCalculator } from './components/BudgetCalculator';
import { ContactSection } from './components/ContactSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { TestimonialsSection } from './components/TestimonialsSection';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { LegalModal, LegalTab } from './components/LegalModal';
import { CookieBanner } from './components/CookieBanner';
import { AIChatModal } from './components/AIChatModal';
import { AIFloatingButton } from './components/AIFloatingButton';
import { SplashScreen } from './components/SplashScreen';
import { NotificationModal } from './components/NotificationModal';
import { OfflineBanner } from './components/OfflineBanner';
import { OfflineCompanyModal } from './components/OfflineCompanyModal';
import { FavoritesNotesModal } from './components/FavoritesNotesModal';
import { ForegroundNotificationToast, ForegroundNotificationPayload } from './components/ForegroundNotificationToast';
import { listenToForegroundMessages } from './services/fcmService';
import {
  subscribeToServices,
  subscribeToSiteSettings,
  subscribeToGallery,
  DEFAULT_SITE_SETTINGS
} from './services/firestoreService';
import { SERVICES_DATA, GALLERY_PROJECTS } from './data/mockData';
import { ServiceCategory, ServiceItem, GalleryProject, SiteSettings } from './types';
import { motion } from 'motion/react';
import { BudgetEstimatesChart } from './components/BudgetEstimatesChart';
import {
  Calculator,
  BookmarkCheck,
  Trash2,
  ShieldCheck,
  SlidersHorizontal,
  PlusCircle,
  Sparkles
} from 'lucide-react';

export default function App() {
  const { theme, isDark, toggleTheme, currentThemeId, selectTheme, availableThemes } = useTheme();
  const { user, profile, isAdmin, isCliente, quickAdminLogin } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('pvc');
  const [currentBudgetDOP, setCurrentBudgetDOP] = useState<number>(0);
  const [currentBudgetSummary, setCurrentBudgetSummary] = useState<string>('');
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Modals for Auth, Admin, and Legal/About Us
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalTab>('nosotros');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showFavoritesNotes, setShowFavoritesNotes] = useState(false);
  const [foregroundNotification, setForegroundNotification] = useState<ForegroundNotificationPayload | null>(null);

  // Escuchar notificaciones push de Firebase cuando la app está abierta en primer plano
  useEffect(() => {
    const unsubFCM = listenToForegroundMessages((payload) => {
      setForegroundNotification(payload);
    });
    return () => unsubFCM();
  }, []);

  const handleOpenLegal = (tab: LegalTab = 'nosotros') => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  // Real-time Firestore state
  const [services, setServices] = useState<ServiceItem[]>(SERVICES_DATA);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [galleryProjects, setGalleryProjects] = useState<GalleryProject[]>(GALLERY_PROJECTS);

  const [savedEstimates, setSavedEstimates] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('decoelectric-saved-estimates') || '[]');
    } catch {
      return [];
    }
  });

  // Subscribe to real-time collections from Firestore
  useEffect(() => {
    const unsubServices = subscribeToServices((data) => {
      if (data && data.length > 0) {
        setServices(data);
      }
    });

    const unsubSettings = subscribeToSiteSettings((data) => {
      if (data) {
        setSiteSettings(data);
      }
    });

    const unsubGallery = subscribeToGallery((data) => {
      if (data && data.length > 0) {
        setGalleryProjects(data);
      }
    });

    return () => {
      unsubServices();
      unsubSettings();
      unsubGallery();
    };
  }, []);

  const scrollToCalculator = (category?: ServiceCategory) => {
    if (category) {
      setSelectedCategory(category);
    }
    const element = document.getElementById('cotizador');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToGallery = () => {
    const element = document.getElementById('galeria');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBudgetCalculated = (total: number, summary: string) => {
    setCurrentBudgetDOP(total);
    setCurrentBudgetSummary(summary);
  };

  const handleOpenSavedEstimates = () => {
    try {
      const items = JSON.parse(localStorage.getItem('decoelectric-saved-estimates') || '[]');
      setSavedEstimates(items);
    } catch {
      setSavedEstimates([]);
    }
    setShowSavedModal(true);
  };

  const handleDeleteEstimate = (id: string) => {
    const updated = savedEstimates.filter((item) => item.id !== id);
    setSavedEstimates(updated);
    localStorage.setItem('decoelectric-saved-estimates', JSON.stringify(updated));
    window.dispatchEvent(new Event('decoelectric-estimates-updated'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-main)] text-[var(--color-text-main)] transition-colors duration-300">
      {/* Splash Screen animado inicial con LogoPrincipal */}
      <SplashScreen />

      {/* Alerta flotante de notificaciones en primer plano */}
      <ForegroundNotificationToast
        notification={foregroundNotification}
        onClose={() => setForegroundNotification(null)}
        onClick={() => setShowNotificationModal(true)}
      />

      {/* Banner de Modo Sin Conexión a Internet */}
      <OfflineBanner onOpenCompanyInfo={() => setShowOfflineModal(true)} />

      {/* Sticky Responsive Navbar with Role Badges & Controls */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenQuote={() => scrollToCalculator()}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAdmin={() => setShowAdminPanel(true)}
        siteSettings={siteSettings}
        onOpenLegal={handleOpenLegal}
        onOpenAIChat={() => setShowAIChat(true)}
        onOpenNotifications={() => setShowNotificationModal(true)}
        onOpenOfflineInfo={() => setShowOfflineModal(true)}
        onOpenFavoritesNotes={() => setShowFavoritesNotes(true)}
        currentThemeId={currentThemeId}
        selectTheme={selectTheme}
        availableThemes={availableThemes}
      />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero
          onOpenCalculator={() => scrollToCalculator()}
          onExploreWork={scrollToGallery}
        />

        {/* 2. Services Section (Electricidad Residencial, Paneles PVC, Plomería) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <ServicesSection
            services={services}
            onSelectServiceForQuote={(cat) => scrollToCalculator(cat)}
            onEditService={() => setShowAdminPanel(true)}
          />
        </motion.div>

        {/* 3. Nuestro Trabajo (Galería Antes y Después interactivo) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <GallerySection
            projects={galleryProjects}
            onOpenAdmin={() => setShowAdminPanel(true)}
          />
        </motion.div>

        {/* 4. Selector de Presupuestos & Formulario de Contacto Interactivo */}
        <motion.div
          id="cotizador"
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.06 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="py-16 md:py-24 bg-white dark:bg-[#0a0e17] border-y border-slate-200 dark:border-slate-800/80"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 mb-3 border border-sky-200 dark:border-sky-800">
                <Calculator className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Cotizador Inteligente</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Calcula y Solicita tu Presupuesto
              </h2>
              <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300">
                Obtén un estimado instantáneo según las medidas de tu espacio o puntos eléctricos y envíalo directamente a nuestro equipo técnico por WhatsApp.
              </p>

              {/* View saved estimates trigger */}
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleOpenSavedEstimates}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 transition-colors"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>Ver Mis Presupuestos Guardados ({savedEstimates.length})</span>
                </button>
              </div>
            </div>

            {/* Interactive Calculator & Visual Recharts History */}
            <div className="mb-14 space-y-6">
              <BudgetCalculator
                initialCategory={selectedCategory}
                onBudgetCalculated={handleBudgetCalculated}
                onConsultAI={() => setShowAIChat(true)}
              />
              <BudgetEstimatesChart />
            </div>

            {/* Integrated Contact Form with Real-Time Validation & Firestore Sync */}
            <ContactSection
              currentBudgetDOP={currentBudgetDOP}
              currentBudgetSummary={currentBudgetSummary}
              selectedCategory={selectedCategory}
              siteSettings={siteSettings}
            />
          </div>
        </motion.div>

        {/* 5. Por Qué Elegirnos (Cotizaciones transparentes, trabajo limpio, garantía de calidad) */}
        <WhyChooseUs />

        {/* 6. Testimonios y Opiniones Reales de Clientes */}
        <TestimonialsSection onOpenQuote={() => scrollToCalculator()} />
      </main>

      {/* Footer */}
      <Footer
        siteSettings={siteSettings}
        onOpenLegal={handleOpenLegal}
        onOpenAIChat={() => setShowAIChat(true)}
      />

      {/* Floating DecoBot AI Assistant Button */}
      <AIFloatingButton onClick={() => setShowAIChat(true)} />

      {/* Floating WhatsApp Quick Action Button */}
      <FloatingWhatsApp whatsappNumber={siteSettings?.whatsappNumber} />

      {/* Floating Admin Toolbar (Visible only when logged in as Admin) */}
      {isAdmin && (
        <div
          id="admin-floating-bar"
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2 p-1.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-amber-500/40 backdrop-blur-md animate-fadeIn"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Modo Admin Activo</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdminPanel(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Panel de Control</span>
          </button>
        </div>
      )}

      {/* Authentication Modal (For Clients & Admin) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onOpenAdminPanel={() => setShowAdminPanel(true)}
      />

      {/* Comprehensive Administrator Panel Modal */}
      <AdminPanel
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
        galleryProjects={galleryProjects}
        services={services}
        siteSettings={siteSettings}
      />

      {/* Saved Estimates Local Storage Modal */}
      {showSavedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowSavedModal(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-sky-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Presupuestos Guardados en tu Dispositivo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {savedEstimates.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                <p>No tienes presupuestos guardados aún.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Usa el botón "Guardar Presupuesto Localmente" en la calculadora para almacenar tus cálculos.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {savedEstimates.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white uppercase">
                          {item.service}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                        {item.details}
                      </p>
                      <span className="font-extrabold text-sky-600 dark:text-sky-400 mt-1 block">
                        RD$ {item.totalEstimatedDOP?.toLocaleString('es-DO')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const cleanWa = (siteSettings?.whatsappNumber || '809-303-1738').replace(/\D/g, '');
                        const waFull = cleanWa.startsWith('1') ? cleanWa : (cleanWa.length === 10 ? `1${cleanWa}` : cleanWa);
                        return (
                          <a
                            href={`https://wa.me/${waFull}?text=Hola%20Decoelectric%2C%20quisiera%20consultar%20este%20presupuesto%20guardado%3A%20${encodeURIComponent(
                              item.details + ' - Estimado: RD$ ' + item.totalEstimatedDOP
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] hover:bg-emerald-500 transition-colors"
                          >
                            Cotizar
                          </a>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => handleDeleteEstimate(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corporate & Legal Modal (Términos, Privacidad, Misión, Visión, Valores, Cookies) */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalModalTab}
        siteSettings={siteSettings}
      />

      {/* DecoBot IA Assistant Modal */}
      <AIChatModal
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        siteSettings={siteSettings}
      />

      {/* Modal de Notificaciones Push (FCM) */}
      <NotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        userId={user?.uid || profile?.uid}
      />

      {/* Modal de Información Básica de la Empresa Fuera de Línea */}
      <OfflineCompanyModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        siteSettings={siteSettings}
      />

      {/* Espacio Personal: Modal de Favoritos y Notas */}
      <FavoritesNotesModal
        isOpen={showFavoritesNotes}
        onClose={() => setShowFavoritesNotes(false)}
        onViewProject={(projectId) => {
          // Scroll dynamically to Gallery section
          const element = document.getElementById('galeria');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Cookie Consent & Preferences Banner */}
      <CookieBanner onOpenPolicy={() => handleOpenLegal('cookies')} />
    </div>
  );
}

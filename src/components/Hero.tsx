import React from 'react';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Calculator,
  MapPin,
  CheckCircle2,
  Clock,
  ThumbsUp,
  Layers,
  ArrowRight
} from 'lucide-react';

interface HeroProps {
  onOpenCalculator: () => void;
  onExploreWork: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenCalculator, onExploreWork }) => {
  const WHATSAPP_HERO_URL = 'https://wa.me/18295550199?text=Hola%20Decoelectric!%20Deseo%20cotizar%20un%20servicio%20de%20electricidad%20o%20paneles%20PVC.';

  return (
    <section
      id="inicio"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/40 dark:from-[#0a0e17] dark:via-[#0d1424] dark:to-[#0a0e17]"
    >
      {/* Subtle background ambient light grid */}
      <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-sky-500/20 dark:bg-sky-500/15 blur-[120px] rounded-full" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600/10 dark:bg-blue-600/20 blur-[90px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headings, Value proposition, CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-semibold tracking-wide mb-6 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-600 dark:bg-sky-400"></span>
              </span>
              <span>Servicios en Santo Domingo Este Y Más</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Transformamos y damos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 dark:from-sky-400 dark:via-blue-400 dark:to-cyan-300">
                energía a tus espacios
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              Especialistas en <strong className="font-semibold text-slate-900 dark:text-white">electricidad residencial segura</strong> y el embellecimiento de paredes y techos con <strong className="font-semibold text-slate-900 dark:text-white">paneles PVC decorativos de lujo</strong>. También realizamos trabajos expertos de plomería y remodelación.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              {/* Main CTA: Cotizar por WhatsApp */}
              <a
                id="hero-cta-whatsapp"
                href={WHATSAPP_HERO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-[0.98] transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
                <span>Cotizar por WhatsApp</span>
              </a>

              {/* Secondary CTA: Calculadora online */}
              <button
                id="hero-cta-calculadora"
                type="button"
                onClick={onOpenCalculator}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <Calculator className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Calcular Presupuesto Online</span>
              </button>
            </div>

            {/* Key trust bullets under CTAs */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cotizaciones Claras
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Trabajo 100% Limpio
                </span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <div className="p-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Garantía de Calidad
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase Card with before/after highlight */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer Glow container */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-sky-500 to-blue-600 rounded-3xl blur opacity-25 dark:opacity-40 group-hover:opacity-100 transition duration-1000"></div>

              <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden">
                {/* Header of hero preview card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-600 dark:text-sky-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Transformación Reciente
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-sky-500" /> Alma Rosa I, SDE
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                    Instalado en 1 Día
                  </span>
                </div>

                {/* Hero Image Showcase */}
                <div className="mt-4 relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
                    alt="Pared decorada con paneles de PVC tipo mármol e iluminación LED indirecta realizada por Decoelectric"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-sky-300">
                      PVC Mármol + LED Indirecta
                    </span>
                    <p className="text-white text-sm font-bold">
                      Renovación de sala sin escombros ni polvo
                    </p>
                  </div>
                </div>

                {/* Quick stats bento beneath image */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      +350
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Obras Listas
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-base sm:text-lg font-black text-sky-600 dark:text-sky-400">
                      100%
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Sin Humedad
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="block text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                      24/7
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      Emergencias
                    </span>
                  </div>
                </div>

                {/* Interactive link */}
                <button
                  type="button"
                  onClick={onExploreWork}
                  className="mt-4 w-full py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl transition-all"
                >
                  <span>Ver fotos del Antes y Después</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

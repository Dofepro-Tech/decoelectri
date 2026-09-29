import React from 'react';
import { DollarSign, Sparkles, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { WHY_CHOOSE_US_POINTS } from '../data/mockData';

export const WhyChooseUs: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'DollarSign':
        return <DollarSign className="w-6 h-6 text-emerald-500" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-sky-500" />;
      case 'Award':
        return <Award className="w-6 h-6 text-amber-500" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-6 h-6 text-blue-500" />;
      default:
        return <CheckCircle2 className="w-6 h-6 text-sky-500" />;
    }
  };

  return (
    <section id="por-que-elegirnos" className="py-16 md:py-24 bg-white dark:bg-[#0a0e17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 mb-3 border border-sky-200 dark:border-sky-800">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Nuestra Filosofía de Servicio</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ¿Por qué los hogares eligen a Decoelectric?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Sabemos que abrir las puertas de tu casa requiere confianza, puntualidad y un estándar impecable de trabajo.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US_POINTS.map((point, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 p-2.5 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {getIcon(point.icon)}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {point.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {point.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Compromiso garantizado</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

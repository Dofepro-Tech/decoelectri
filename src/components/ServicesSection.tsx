import React from 'react';
import { Zap, Layers, Wrench, Check, ArrowRight, Sparkles, Edit, ShieldCheck } from 'lucide-react';
import { ServiceCategory, ServiceItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface ServicesSectionProps {
  services: ServiceItem[];
  onSelectServiceForQuote: (category: ServiceCategory) => void;
  onEditService?: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectServiceForQuote,
  onEditService,
}) => {
  const { isAdmin } = useAuth();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-500 dark:text-amber-400" />;
      case 'Layers':
        return <Layers className="w-6 h-6 text-sky-500 dark:text-sky-400" />;
      case 'Wrench':
        return <Wrench className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-sky-500" />;
    }
  };

  return (
    <section
      id="servicios"
      className="py-16 md:py-24 bg-slate-100/60 dark:bg-[#0d1424]/60 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 mb-3 border border-sky-200 dark:border-sky-800">
            <Zap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Nuestros Servicios Estrella</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Soluciones completas para renovar tu hogar
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Unimos la precisión técnica de la ingeniería eléctrica con la estética de vanguardia en revestimientos de PVC y plomería certificada.
          </p>
        </div>

        {/* Featured Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => {
            const isPvc = service.category === 'pvc';
            const isElec = service.category === 'electricidad';

            return (
              <div
                key={service.id}
                id={`card-servicio-${service.category}`}
                className={`relative rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                  isPvc
                    ? 'border-sky-300 dark:border-sky-700 shadow-md shadow-sky-500/10'
                    : isElec
                    ? 'border-amber-300/80 dark:border-amber-800/60 shadow-md shadow-amber-500/5'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Popular badge if applicable */}
                {service.popularBadge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${
                        isPvc
                          ? 'bg-sky-600 text-white'
                          : 'bg-amber-500 text-slate-950'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {service.popularBadge}
                    </span>
                  </div>
                )}

                {/* Card Top Banner Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={service.bannerImage}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Floating Icon Over Image */}
                  <div className="absolute bottom-4 left-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 p-2.5 shadow-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                      {getIcon(service.iconName)}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                        {service.subtitle}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {service.title}
                    </h3>

                    <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features checklist */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                        Incluye en el servicio:
                      </h4>
                      <ul className="space-y-2.5">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                            <div className="mt-0.5 p-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Card Bottom: Starting price and action CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Tarifa de referencia
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {service.startingPrice}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectServiceForQuote(service.category)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 active:scale-95 transition-all shadow-sm shadow-sky-600/20"
                      >
                        <span>Cotizar Ahora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Quick Admin Edit Button */}
                    {isAdmin && onEditService && (
                      <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Rol Admin
                        </span>
                        <button
                          type="button"
                          onClick={() => onEditService(service)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 py-1 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar Servicio</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

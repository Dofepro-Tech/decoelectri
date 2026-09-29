import React, { useState, useRef, useCallback } from 'react';
import { Sliders, Sparkles, AlertTriangle } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  title: string;
  subtitle: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'ANTES (Pared con humedad / desorden)',
  afterLabel = 'DESPUÉS (PVC Mármol + Luz LED)',
  title,
  subtitle,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    let percentage = (x / width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Comparador Interactivo de Instalación
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Quick buttons to set to Before (0%), 50%, or After (100%) */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setSliderPosition(10)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              sliderPosition < 30
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Ver Antes
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(50)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              sliderPosition >= 30 && sliderPosition <= 70
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            50 / 50
          </button>
          <button
            type="button"
            onClick={() => setSliderPosition(90)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              sliderPosition > 70
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Ver Después
          </button>
        </div>
      </div>

      {/* Interactive slider image stage */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
        className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden select-none cursor-ew-resize bg-slate-800"
      >
        {/* After Image (Background full) */}
        <img
          src={afterImage}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Before Image (Clipped by percentage) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none filter saturate-75 brightness-90 max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />
        </div>

        {/* Labels overlay */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-950/70 text-rose-300 backdrop-blur-sm border border-rose-500/30">
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-3 right-3 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-950/70 text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
            {afterLabel}
          </span>
        </div>

        {/* Divider line & handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center border-2 border-sky-500">
            <Sliders className="w-4 h-4 rotate-90 text-sky-600" />
          </div>
        </div>

        {/* Helper instruction toast */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm">
            ↔ Arrastra la barra o pulsa los botones para comparar
          </span>
        </div>
      </div>
    </div>
  );
};

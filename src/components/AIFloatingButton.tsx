import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface AIFloatingButtonProps {
  onClick: () => void;
}

export const AIFloatingButton: React.FC<AIFloatingButtonProps> = ({ onClick }) => {
  return (
    <div
      id="floating-ai-bot-container"
      className="fixed bottom-[72px] right-4 sm:bottom-[80px] sm:right-5 z-40 flex items-center gap-2 group pointer-events-auto"
    >
      {/* Tooltip decorativo en hover */}
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[11px] font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none backdrop-blur-sm">
        <Sparkles className="w-3 h-3 text-amber-400" />
        <span>Asesor IA DecoBot</span>
      </div>

      {/* Botón flotante (compacto y refinado) */}
      <button
        id="floating-ai-bot-btn"
        type="button"
        onClick={onClick}
        className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-sky-600/30 hover:shadow-sky-600/50 hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-sky-500/30 p-1"
        aria-label="Abrir Asistente IA DecoBot"
        title="Asistente DecoBot IA"
      >
        <img
          src="/LogoPrincipal.png"
          alt="DecoBot IA"
          className="w-full h-full object-contain rounded-full drop-shadow group-hover:rotate-6 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />

        {/* Corona de destello */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900 items-center justify-center">
            <Sparkles className="w-2 h-2 text-slate-900" />
          </span>
        </span>
      </button>
    </div>
  );
};

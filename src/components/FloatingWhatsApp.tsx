import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingWhatsAppProps {
  whatsappNumber?: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ whatsappNumber = '809-303-1738' }) => {
  const [showTooltip, setShowTooltip] = useState(true);
  const [clickCount, setClickCount] = useState<number>(0);

  // Load initial count from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('whatsapp_click_count');
      if (saved) {
        setClickCount(parseInt(saved, 10) || 0);
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
  }, []);

  const cleanWa = whatsappNumber.replace(/\D/g, '');
  const waFull = cleanWa.startsWith('1') ? cleanWa : (cleanWa.length === 10 ? `1${cleanWa}` : cleanWa);
  const WHATSAPP_URL = `https://wa.me/${waFull}?text=Hola%20Decoelectric!%20Deseo%20informaci%C3%B3n%20para%20una%20cotizaci%C3%B3n%20r%C3%A1pida.`;

  const playHapticFeedback = () => {
    // 1. Play synthesized pop/tap sound using client-side Web Audio API (satisfies audio feedback offline and instantly)
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Satisfying, high-quality high-to-low rapid pitch slide for a tactile "bubble" tap
        osc.frequency.setValueAtTime(550, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(190, ctx.currentTime + 0.05);
        
        // Rapid volume decay to zero
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (e) {
      console.warn('Tactile sound feedback not supported or blocked by browser gesture policy:', e);
    }

    // 2. Play browser physical vibration pulse if supported (haptic feedback on Android/mobile)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(18); // 18ms soft haptic vibration
    }
  };

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    try {
      localStorage.setItem('whatsapp_click_count', String(newCount));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    playHapticFeedback();
  };

  return (
    <div
      id="floating-whatsapp-container"
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end pointer-events-auto"
    >
      {/* Tooltip bubble (solo visible en pantallas sm+ para no obstruir elementos en móviles) */}
      {showTooltip && (
        <div className="hidden sm:flex relative mb-2 max-w-[200px] bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs animate-bounce duration-1000 items-start gap-2">
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300"
            aria-label="Cerrar mensaje"
          >
            <X className="w-3 h-3" />
          </button>
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">
              ¿Tienes una consulta?
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block">
              Cotiza al instante con un técnico por WhatsApp.
            </span>
          </div>
        </div>
      )}

      {/* Floating round action button (compact & refined with framer-motion & haptic audio) */}
      <motion.a
        id="floating-whatsapp-btn"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Abrir chat de WhatsApp de Decoelectric"
        title="WhatsApp Directo Decoelectric"
        onClick={handleClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-500/40 cursor-pointer"
      >
        <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-25 group-hover:opacity-50 animate-ping pointer-events-none" />
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-emerald-500 relative z-10 transition-transform duration-300 group-hover:scale-105" />
        
        {/* Visual click counter badge in a small corner */}
        <span className="absolute -top-1 -right-1 bg-rose-500 dark:bg-rose-600 text-[9px] sm:text-[10px] font-extrabold text-white h-4.5 sm:h-5 min-w-[18px] sm:min-w-[20px] px-1 sm:px-1.5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-md z-20 tabular-nums">
          {clickCount}
        </span>
      </motion.a>
    </div>
  );
};

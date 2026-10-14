import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
  forceShow?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 1500,
  forceShow = false
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(10);
  const [statusText, setStatusText] = useState('Iniciando sistema...');

  useEffect(() => {
    if (!forceShow) {
      const shown = sessionStorage.getItem('decoelectric_splash_shown');
      if (shown) {
        setIsVisible(false);
        onFinish?.();
        return;
      }
    }

    const criticalAssets = [
      '/LogoPrincipal.png',
      '/favicon.png',
      '/apple-touch-icon.png',
      '/splash-mobile.jpg',
      '/manifest.json'
    ];

    let loadedCount = 0;
    const totalAssets = criticalAssets.length;

    const getStatusMessage = (prog: number) => {
      if (prog < 30) return 'Conectando con servidores de Decoelectric...';
      if (prog < 55) return 'Cargando interfaces y estilos residenciales...';
      if (prog < 80) return 'Configurando base de datos local y offline...';
      if (prog < 95) return 'Verificando seguridad de sesión (SSL)...';
      return '¡Listo para comenzar!';
    };

    const handleAssetLoaded = () => {
      loadedCount++;
      const targetProgress = Math.round((loadedCount / totalAssets) * 80);
      setProgress((prev) => {
        const nextProg = Math.max(prev, targetProgress);
        setStatusText(getStatusMessage(nextProg));
        return nextProg;
      });
    };

    criticalAssets.forEach((assetPath) => {
      if (assetPath.endsWith('.png') || assetPath.endsWith('.jpg')) {
        const img = new Image();
        img.src = assetPath;
        img.onload = handleAssetLoaded;
        img.onerror = handleAssetLoaded;
      } else {
        fetch(assetPath)
          .then(handleAssetLoaded)
          .catch(handleAssetLoaded);
      }
    });

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const isAllLoaded = loadedCount === totalAssets;
        const step = isAllLoaded ? 6 : 2;
        const nextProg = Math.min(prev + step, 100);
        setStatusText(getStatusMessage(nextProg));
        return nextProg;
      });
    }, 120);

    return () => {
      clearInterval(interval);
    };
  }, [forceShow, onFinish]);

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('decoelectric_splash_shown', 'true');
        const finishTimeout = setTimeout(() => {
          onFinish?.();
        }, 500);
        return () => clearTimeout(finishTimeout);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, onFinish]);

  const handleDismiss = () => {
    setProgress(100);
    setIsVisible(false);
    sessionStorage.setItem('decoelectric_splash_shown', 'true');
    setTimeout(() => {
      onFinish?.();
    }, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="app-splash-screen"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.97,
            filter: 'blur(10px)',
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } 
          }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none bg-gradient-to-b from-[#070b12] via-[#0b1322] to-[#04070d] text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/35 via-slate-950/70 to-black pointer-events-none" />

          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.25, 0.15] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" 
          />

          <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-sm">
            <motion.div
              style={{ scale: 0.92 + (progress / 100) * 0.08 }}
              className="relative mb-6"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  ease: 'linear',
                  duration: Math.max(0.6, 3.8 - (progress / 100) * 3.2),
                }}
                style={{ opacity: 0.35 + (progress / 100) * 0.55 }}
                className="absolute -inset-3.5 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-emerald-500 blur-xl"
              />

              <motion.div
                animate={{ scale: [0.97, 1.04, 0.97] }}
                transition={{
                  repeat: Infinity,
                  duration: Math.max(0.35, 1.8 - (progress / 100) * 1.45),
                  ease: 'easeInOut',
                }}
                className="absolute -inset-1.5 rounded-full bg-amber-400/25 blur-md"
              />

              <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-b from-white/30 via-slate-500/20 to-transparent shadow-2xl overflow-hidden flex items-center justify-center bg-[#070c18]">
                <img
                  src="/LogoPrincipal.png"
                  alt="Decoelectric Emblema"
                  className="w-full h-full object-contain rounded-full shadow-inner"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            <div className="space-y-1.5">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>Deco</span>
                <span className="text-sky-400">electric</span>
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
              </h1>

              <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400/90 pt-1">
                <span>Electricidad</span>
                <span className="text-slate-600 font-normal">•</span>
                <span>Plomería</span>
                <span className="text-slate-600 font-normal">•</span>
                <span>Paneles PVC</span>
              </div>

              <p className="text-xs text-slate-400 font-medium">
                Santo Domingo Este • Soluciones de Calidad Garantizada
              </p>
            </div>

            <div className="w-64 mt-8 space-y-2.5">
              <div className="h-2 w-full bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-800/80">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.15 }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono tracking-wide px-1">
                <motion.span 
                  key={statusText}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="truncate max-w-[80%]"
                >
                  {statusText}
                </motion.span>
                <span className="font-bold text-sky-400">{progress}%</span>
              </div>
            </div>

            <p className="text-[9px] text-slate-500 mt-6 tracking-wider uppercase font-semibold">
              Toca la pantalla para omitir introducción
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

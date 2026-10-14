import { useState, useEffect, useCallback } from 'react';

export type ThemeId =
  | 'classic-blue'
  | 'classic-dark'
  | 'eco-emerald'
  | 'forest-dark'
  | 'amber-luxury'
  | 'copper-dark'
  | 'caribbean-breeze'
  | 'nordic-platinum'
  | 'cyber-volt'
  | 'sunset-gold'
  | 'rose-garden'
  | 'royal-crimson'
  | 'violet-lavender'
  | 'solar-orange'
  | 'aqua-breeze'
  | 'crimson-nocturne'
  | 'neon-purple'
  | 'deep-abyss'
  | 'magma-pulse'
  | 'obsidian-white';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  mode: 'light' | 'dark';
  className: string;
  primaryColor: string;
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  // 10 temas claros (mode: 'light')
  { id: 'classic-blue', name: 'Azul Eléctrico Clásico', mode: 'light', className: 'theme-classic-blue', primaryColor: '#0284c7' },
  { id: 'eco-emerald', name: 'Esmeralda Eco', mode: 'light', className: 'theme-eco-emerald', primaryColor: '#10b981' },
  { id: 'amber-luxury', name: 'Cobre de Lujo', mode: 'light', className: 'theme-amber-luxury', primaryColor: '#d97706' },
  { id: 'caribbean-breeze', name: 'Brisa Marina', mode: 'light', className: 'theme-caribbean-breeze', primaryColor: '#0d9488' },
  { id: 'nordic-platinum', name: 'Platino Nórdico', mode: 'light', className: 'theme-nordic-platinum', primaryColor: '#4b5563' },
  { id: 'rose-garden', name: 'Jardín de Rosas', mode: 'light', className: 'theme-rose-garden', primaryColor: '#db2777' },
  { id: 'royal-crimson', name: 'Carmesí Real', mode: 'light', className: 'theme-royal-crimson', primaryColor: '#e11d48' },
  { id: 'violet-lavender', name: 'Lavanda Silvestre', mode: 'light', className: 'theme-violet-lavender', primaryColor: '#8b5cf6' },
  { id: 'solar-orange', name: 'Naranja Solar', mode: 'light', className: 'theme-solar-orange', primaryColor: '#f97316' },
  { id: 'aqua-breeze', name: 'Brisa Celeste', mode: 'light', className: 'theme-aqua-breeze', primaryColor: '#06b6d4' },

  // 10 temas oscuros (mode: 'dark')
  { id: 'classic-dark', name: 'Azul Eléctrico Oscuro', mode: 'dark', className: 'theme-classic-dark', primaryColor: '#38bdf8' },
  { id: 'forest-dark', name: 'Esmeralda Nocturno', mode: 'dark', className: 'theme-forest-dark', primaryColor: '#10b981' },
  { id: 'copper-dark', name: 'Cobre Nocturno', mode: 'dark', className: 'theme-copper-dark', primaryColor: '#f59e0b' },
  { id: 'cyber-volt', name: 'Voltaje Atómico', mode: 'dark', className: 'theme-cyber-volt', primaryColor: '#a3e635' },
  { id: 'sunset-gold', name: 'Ocaso Dorado', mode: 'dark', className: 'theme-sunset-gold', primaryColor: '#f59e0b' },
  { id: 'crimson-nocturne', name: 'Carmesí Nocturno', mode: 'dark', className: 'theme-crimson-nocturne', primaryColor: '#f43f5e' },
  { id: 'neon-purple', name: 'Amatista Neón', mode: 'dark', className: 'theme-neon-purple', primaryColor: '#a78bfa' },
  { id: 'deep-abyss', name: 'Abismo Marino', mode: 'dark', className: 'theme-deep-abyss', primaryColor: '#06b6d4' },
  { id: 'magma-pulse', name: 'Pulso Ígneo', mode: 'dark', className: 'theme-magma-pulse', primaryColor: '#f97316' },
  { id: 'obsidian-white', name: 'Monocromo Industrial', mode: 'dark', className: 'theme-obsidian-white', primaryColor: '#9ca3af' }
];

export function useTheme() {
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('decoelectric-multitheme-id') as ThemeId | null;
      const validIds = AVAILABLE_THEMES.map((t) => t.id);
      if (savedThemeId && validIds.includes(savedThemeId)) {
        return savedThemeId;
      }
      // System dark mode preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'classic-dark';
      }
    }
    return 'classic-blue';
  });

  const applyTheme = useCallback((themeId: ThemeId, enableTransition = false) => {
    const root = document.documentElement;
    const themeDef = AVAILABLE_THEMES.find((t) => t.id === themeId) || AVAILABLE_THEMES[0];

    if (enableTransition) {
      root.classList.add('theme-transitioning');
      setTimeout(() => {
        root.classList.remove('theme-transitioning');
      }, 350);
    }

    // 1. Remove all theme classes
    AVAILABLE_THEMES.forEach((t) => {
      root.classList.remove(t.className);
    });

    // 2. Add current theme class
    root.classList.add(themeDef.className);

    // 3. Handle global dark mode class for tailwind `dark:` compatibility
    if (themeDef.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('decoelectric-multitheme-id', themeId);
  }, []);

  useEffect(() => {
    applyTheme(currentThemeId, false);
  }, [currentThemeId, applyTheme]);

  const toggleTheme = useCallback(() => {
    setCurrentThemeId((prev) => {
      // Simple alternating logic to keep old layout happy
      const currentIndex = AVAILABLE_THEMES.findIndex((t) => t.id === prev);
      const nextIndex = (currentIndex + 1) % AVAILABLE_THEMES.length;
      const nextTheme = AVAILABLE_THEMES[nextIndex].id;
      applyTheme(nextTheme, true);
      return nextTheme;
    });
  }, [applyTheme]);

  const selectTheme = useCallback((themeId: ThemeId) => {
    setCurrentThemeId(themeId);
    applyTheme(themeId, true);
  }, [applyTheme]);

  const currentThemeDef = AVAILABLE_THEMES.find((t) => t.id === currentThemeId) || AVAILABLE_THEMES[0];

  return {
    theme: currentThemeDef.mode, // Return 'light' or 'dark' to prevent breaking old code relying on basic mode
    currentThemeId,
    currentThemeDef,
    isDark: currentThemeDef.mode === 'dark',
    toggleTheme,
    selectTheme,
    availableThemes: AVAILABLE_THEMES
  };
}

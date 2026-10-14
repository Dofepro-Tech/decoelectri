/**
 * Utilidades para la gestión de Cookies y Consentimiento en Decoelectric
 */

export interface CookiePreferences {
  essential: boolean; // Requeridas para funcionamiento técnico, sesión y seguridad (siempre activas)
  aiAssistant: boolean; // Historial de conversación con DecoBot AI, preferencias de voz
  analytics: boolean; // Métricas de uso anónimas para optimización del cotizador
  hasAnswered: boolean; // Indica si el usuario ya tomó una decisión de consentimiento
  timestamp?: string;
}

const COOKIE_PREFS_KEY = 'decoelectric_cookie_preferences';
const COOKIE_CONSENT_KEY = 'decoelectric_cookie_consent';

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getDefaultPreferences(): CookiePreferences {
  return {
    essential: true,
    aiAssistant: true,
    analytics: true,
    hasAnswered: false,
  };
}

export function getStoredPreferences(): CookiePreferences {
  if (typeof window === 'undefined') return getDefaultPreferences();

  try {
    const cookieVal = getCookie(COOKIE_PREFS_KEY);
    if (cookieVal) {
      const parsed = JSON.parse(cookieVal);
      return {
        essential: true,
        aiAssistant: Boolean(parsed.aiAssistant),
        analytics: Boolean(parsed.analytics),
        hasAnswered: true,
        timestamp: parsed.timestamp,
      };
    }

    const localVal = localStorage.getItem(COOKIE_PREFS_KEY);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      return {
        essential: true,
        aiAssistant: Boolean(parsed.aiAssistant),
        analytics: Boolean(parsed.analytics),
        hasAnswered: true,
        timestamp: parsed.timestamp,
      };
    }
  } catch (err) {
    console.warn('Error al leer preferencias de cookies:', err);
  }

  return getDefaultPreferences();
}

export async function savePreferences(prefs: Partial<CookiePreferences>): Promise<void> {
  const fullPrefs: CookiePreferences = {
    essential: true,
    aiAssistant: prefs.aiAssistant !== undefined ? prefs.aiAssistant : true,
    analytics: prefs.analytics !== undefined ? prefs.analytics : true,
    hasAnswered: true,
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(fullPrefs);

  // 1. Guardar en cookies del navegador
  setCookie(COOKIE_PREFS_KEY, serialized, 365);
  setCookie(COOKIE_CONSENT_KEY, 'accepted', 365);

  // 2. Guardar en localStorage como respaldo persistente
  try {
    localStorage.setItem(COOKIE_PREFS_KEY, serialized);
  } catch {}

  // 3. Sincronizar con el endpoint /api/cookies/preferences del backend
  try {
    await fetch('/api/cookies/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: true, preferences: fullPrefs }),
    });
  } catch (err) {
    // Si falla la red, el cliente ya tiene las cookies locales guardadas
  }

  // Notificar a componentes escuchando
  window.dispatchEvent(new CustomEvent('decoelectric-cookies-changed', { detail: fullPrefs }));
}

export async function rejectOptionalCookies(): Promise<void> {
  const fullPrefs: CookiePreferences = {
    essential: true,
    aiAssistant: false,
    analytics: false,
    hasAnswered: true,
    timestamp: new Date().toISOString(),
  };

  const serialized = JSON.stringify(fullPrefs);

  setCookie(COOKIE_PREFS_KEY, serialized, 365);
  setCookie(COOKIE_CONSENT_KEY, 'essential_only', 365);

  try {
    localStorage.setItem(COOKIE_PREFS_KEY, serialized);
  } catch {}

  try {
    await fetch('/api/cookies/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: false, preferences: fullPrefs }),
    });
  } catch {}

  window.dispatchEvent(new CustomEvent('decoelectric-cookies-changed', { detail: fullPrefs }));
}

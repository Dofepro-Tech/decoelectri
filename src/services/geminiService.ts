/**
 * Servicio cliente para interactuar con los endpoints de Gemini AI en el servidor
 */

import { getStoredPreferences } from '../utils/cookieUtils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string; placeAnswerSources?: { reviewSnippets?: Array<{ reviewText: string }> } };
  }>;
  webSearchQueries?: string[];
  audioPlaying?: boolean;
  
  // Atributos extendidos para manejo rico de errores
  isError?: boolean;
  errorType?: 'auth' | 'quota' | 'network' | 'server' | 'unknown';
  errorDetails?: string;
  retryPromptText?: string;
}

export class GeminiError extends Error {
  status?: number;
  type: 'auth' | 'quota' | 'network' | 'server' | 'unknown';
  isRetryable: boolean;

  constructor(
    message: string,
    options: {
      status?: number;
      type?: 'auth' | 'quota' | 'network' | 'server' | 'unknown';
      isRetryable?: boolean;
    } = {}
  ) {
    super(message);
    this.name = 'GeminiError';
    this.status = options.status;
    this.type = options.type || 'unknown';
    this.isRetryable = options.isRetryable ?? false;
  }
}

export interface ChatOptions {
  searchGrounding?: boolean;
  mapsGrounding?: boolean;
  fastMode?: boolean;
  userLocation?: { latitude: number; longitude: number };
}

const STORAGE_CHAT_KEY = 'decoelectric_chat_history_v1';

/**
 * Realiza fetch con reintentos exponenciales para manejar errores de red o temporales del servidor
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Response> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }

      // Reintentar en códigos de error temporal del servidor o de tasa límite
      const isTransientStatus = response.status === 429 || response.status >= 500;
      
      if (isTransientStatus) {
        attempt++;
        if (attempt >= maxRetries) {
          return response; // Agotado los reintentos, retornar respuesta para procesar el error definitivo
        }
        
        const backoffDelay = delayMs * Math.pow(2, attempt - 1);
        console.warn(`[DecoBot AI] Error ${response.status} detectado. Reintentando en ${backoffDelay}ms (Intento ${attempt}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        continue;
      }

      return response; // Para errores 4xx (excepto 429), retornar directamente ya que no son reintentables
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error; // Lanzar el error de red real al llegar al límite
      }
      
      const backoffDelay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`[DecoBot AI] Error de red o conexión. Reintentando en ${backoffDelay}ms (Intento ${attempt}/${maxRetries})...`, error);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
  throw new Error('Se superó el número máximo de reintentos de conexión.');
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  options: ChatOptions = {}
): Promise<{
  text: string;
  groundingChunks?: any[];
  webSearchQueries?: string[];
  modelUsed?: string;
}> {
  // Convertir historial a formato esperado por el backend (sin incluir mensajes de error)
  const formattedHistory = history
    .filter((item) => !item.isError)
    .map((item) => ({
      role: item.role,
      text: item.text,
    }));

  let res: Response;
  try {
    res = await fetchWithRetry('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history: formattedHistory,
        toolsConfig: {
          searchGrounding: options.searchGrounding,
          mapsGrounding: options.mapsGrounding,
          fastMode: options.fastMode,
        },
        userLocation: options.userLocation,
      }),
    }, 3, 1000); // 3 intentos, comenzando con 1s de retraso
  } catch (netErr: any) {
    throw new GeminiError(
      `No pudimos conectar con el servidor de DecoBot. Revisa tu conexión de internet: ${netErr?.message || 'Error de red'}`,
      { type: 'network', isRetryable: true }
    );
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const rawMessage = errData?.error || `Error del servidor (${res.status})`;
    const lowerMessage = rawMessage.toLowerCase();
    
    let errorType: 'auth' | 'quota' | 'network' | 'server' | 'unknown' = 'unknown';
    let isRetryable = false;

    if (res.status === 401 || lowerMessage.includes('api_key') || lowerMessage.includes('unauthorized') || lowerMessage.includes('credential') || lowerMessage.includes('key not valid')) {
      errorType = 'auth';
      isRetryable = false; // No se puede solucionar reintentando si la clave está mal configurada
    } else if (res.status === 429 || lowerMessage.includes('quota') || lowerMessage.includes('rate limit') || lowerMessage.includes('exhausted')) {
      errorType = 'quota';
      isRetryable = true; // El reintento posterior podría funcionar si se enfría la cuota
    } else if (res.status >= 500) {
      errorType = 'server';
      isRetryable = true; // Los fallos internos o de API de terceros pueden ser transitorios
    }

    throw new GeminiError(rawMessage, {
      status: res.status,
      type: errorType,
      isRetryable,
    });
  }

  return await res.json();
}

/**
 * Sintetizar voz a partir de texto utilizando Gemini TTS con fallback al sintetizador del navegador
 */
export async function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): Promise<() => void> {
  // Función para detener la reproducción actual
  let cancelFn: () => void = () => {};

  try {
    // Intentar endpoint de Gemini TTS
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName: 'Kore' }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audio) {
        const audioSrc = `data:${data.mimeType || 'audio/mp3'};base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        cancelFn = () => {
          audio.pause();
          audio.currentTime = 0;
        };

        audio.onplay = () => onStart?.();
        audio.onended = () => onEnd?.();
        audio.onerror = () => {
          // Si el elemento de audio falla, usar fallback del navegador
          fallbackBrowserSpeech(text, onStart, onEnd);
        };

        await audio.play();
        return cancelFn;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS no disponible, utilizando síntesis nativa del navegador:', err);
  }

  // Fallback a SpeechSynthesis del navegador
  return fallbackBrowserSpeech(text, onStart, onEnd);
}

function fallbackBrowserSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#_`]/g, '').slice(0, 350);
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'es-DO'; // Español Dominicano o genérico
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    onEnd?.();
  };
}

/**
 * Persistencia del historial reciente de la conversación en localStorage
 * Permite al usuario retomar sus consultas técnicas y decorativas al cerrar y abrir el chat.
 */
export function loadStoredChat(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error al leer historial de chat de localStorage:', err);
  }
  return [];
}

export function saveStoredChat(messages: ChatMessage[]): void {
  if (typeof window === 'undefined' || !Array.isArray(messages)) return;
  try {
    // Guardar los últimos 30 mensajes para permitir retomar consultas ricas
    const trimmed = messages.slice(-30);
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.warn('Error al guardar historial de chat en localStorage:', err);
  }
}

export function clearStoredChat(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_CHAT_KEY);
  } catch {}
}

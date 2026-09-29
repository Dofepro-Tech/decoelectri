import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Search,
  MapPin,
  Trash2,
  ExternalLink,
  MessageCircle,
  Loader2,
  Zap,
  Info,
  CheckCircle2,
  Bot,
  AlertTriangle,
  ZapOff,
  RefreshCw
} from 'lucide-react';
import {
  ChatMessage,
  sendChatMessage,
  speakText,
  loadStoredChat,
  saveStoredChat,
  clearStoredChat
} from '../services/geminiService';
import { SiteSettings } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettings;
  onApplyEstimate?: (m2: number) => void;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  siteSettings,
  onApplyEstimate
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = loadStoredChat();
    if (stored.length > 0) return stored;
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: '¡Hola! Soy **DecoBot**, tu asesor técnico y decorativo de **Decoelectric** en Santo Domingo Este. ¿En qué puedo ayudarte hoy?\n\nPuedes preguntarme sobre revestimientos en paneles de PVC, balanceo eléctrico, cálculo de breakers, iluminación LED o cotizaciones.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchGrounding, setSearchGrounding] = useState(false);
  const [mapsGrounding, setMapsGrounding] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Estados de voz y audio
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechStop, setActiveSpeechStop] = useState<(() => void) | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll al final al recibir mensajes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  // Recargar historial reciente de localStorage cada vez que el usuario abre el modal
  useEffect(() => {
    if (isOpen) {
      const stored = loadStoredChat();
      if (stored && stored.length > 0) {
        setMessages(stored);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      // Detener audio o reconocimiento si se cierra el modal
      activeSpeechStop?.();
      setActiveSpeechStop(null);
      setPlayingMessageId(null);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    }
  }, [isOpen]);

  // Guardar mensajes automáticamente en localStorage cada vez que cambian
  useEffect(() => {
    if (messages.length > 0) {
      saveStoredChat(messages);
    }
  }, [messages]);

  // Manejo de reconocimiento de voz (SpeechRecognition)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'es-DO';

      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInput(transcript);
      };

      rec.onerror = (e: any) => {
        console.warn('Error en reconocimiento de voz:', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta entrada de voz directa. Puedes escribir tu mensaje en el campo de texto.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Fallo al iniciar reconocimiento:', err);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    // Detener cualquier audio previo
    if (activeSpeechStop) {
      activeSpeechStop();
      setActiveSpeechStop(null);
      setPlayingMessageId(null);
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Intentar obtener geolocalización aproximada si Maps Grounding está activo
      let userLocation: { latitude: number; longitude: number } | undefined = undefined;
      if (mapsGrounding && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          userLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } catch {
          // Si no se puede obtener, el backend usará el contexto de Santo Domingo Este
        }
      }

      const response = await sendChatMessage(text, updatedMessages, {
        searchGrounding,
        mapsGrounding,
        fastMode,
        userLocation,
      });

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        groundingChunks: response.groundingChunks,
        webSearchQueries: response.webSearchQueries,
      };

      setMessages((prev) => [...prev, botMessage]);

      // Si autoSpeak está activado, sintetizar la respuesta
      if (autoSpeak) {
        handlePlayAudio(botMessage.id, botMessage.text);
      }
    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text: err?.message || 'Lo siento, ocurrió una interrupción al conectar con el servidor. Revisa tu conexión.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        errorType: err?.type || 'unknown',
        errorDetails: err?.status ? `Código de estado HTTP: ${err.status}` : undefined,
        retryPromptText: text, // Guardar el texto original para poder reintentar
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryMessage = (textToRetry: string) => {
    // Eliminar el último mensaje de error si existe en el final de la lista
    setMessages((prev) => {
      const filtered = [...prev];
      if (filtered.length > 0 && filtered[filtered.length - 1].isError) {
        filtered.pop();
      }
      return filtered;
    });
    // Volver a enviar
    handleSendMessage(textToRetry);
  };

  const handlePlayAudio = async (msgId: string, text: string) => {
    if (playingMessageId === msgId) {
      activeSpeechStop?.();
      setActiveSpeechStop(null);
      setPlayingMessageId(null);
      return;
    }

    if (activeSpeechStop) {
      activeSpeechStop();
    }

    setPlayingMessageId(msgId);
    const stopFn = await speakText(
      text,
      () => setPlayingMessageId(msgId),
      () => setPlayingMessageId(null)
    );
    setActiveSpeechStop(() => stopFn);
  };

  const handleClearHistory = () => {
    setShowClearConfirm(true);
  };

  const confirmResetConversation = () => {
    clearStoredChat();
    setMessages([
      {
        id: 'welcome-reset',
        role: 'model',
        text: '¡Conversación reiniciada! Tu historial anterior ha sido limpiado de localStorage. ¿En qué podemos asesorarte hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setShowClearConfirm(false);
  };

  if (!isOpen) return null;

  const quickPrompts = [
    '¿Cuánto cuesta forrar 30 m² con paneles de PVC?',
    '¿Qué breaker necesito para aire de 12,000 BTU?',
    '¿Qué cobertura tienen en Santo Domingo Este?',
    '¿Cómo instalar luces LED indirectas en sala?',
  ];

  const whatsappNumber = (siteSettings?.whatsappNumber || '809-303-1738').replace(/\D/g, '');
  const cleanWa = whatsappNumber.startsWith('1') ? whatsappNumber : (whatsappNumber.length === 10 ? `1${whatsappNumber}` : whatsappNumber);

  return (
    <div
      id="ai-chat-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="ai-chat-modal-container"
        className="relative w-full max-w-2xl h-[92vh] max-h-[720px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-850/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full p-0.5 bg-slate-900 border border-sky-400/50 flex items-center justify-center text-white shadow-md shadow-sky-500/20 overflow-hidden ring-2 ring-sky-500/25">
                <img
                  src="/LogoPrincipal.png"
                  alt="DecoBot Logo"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  DecoBot <span className="text-sky-600 dark:text-sky-400">AI</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Asesor Técnico y Decorativo Decoelectric
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Auto-Voz toggle */}
            <button
              type="button"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                autoSpeak
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'
              }`}
              title={autoSpeak ? 'Lectura de voz activada' : 'Activar lectura de voz automática'}
            >
              {autoSpeak ? <Volume2 className="w-4 h-4 text-amber-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reiniciar chat */}
            <button
              type="button"
              onClick={handleClearHistory}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              title="Borrar historial guardado"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Cerrar modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar asistente"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-barra informativa de almacenamiento local de historial */}
        <div className="px-4 py-1.5 bg-emerald-50/70 dark:bg-emerald-950/20 border-b border-emerald-100/80 dark:border-emerald-900/30 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Historial guardado localmente (localStorage)</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {messages.filter(m => m.role === 'user').length} consultas recordadas
          </span>
        </div>

        {/* Banner de confirmación para borrar historial */}
        {showClearConfirm && (
          <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200 shrink-0 animate-fadeIn">
            <span>¿Deseas reiniciar la conversación y borrar el historial guardado?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={confirmResetConversation}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-500 shadow-sm"
              >
                Sí, reiniciar
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] hover:bg-slate-300 font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Toolbar de Capacidades de IA (Google Search, Google Maps, Modo Rápido) */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="text-slate-400 font-semibold shrink-0">Herramientas IA:</span>

          {/* Search Grounding toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !searchGrounding;
              setSearchGrounding(next);
              if (next) setMapsGrounding(false); // Google Search y Maps no se pueden combinar
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              searchGrounding
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3 h-3" />
            <span>Google Search</span>
          </button>

          {/* Maps Grounding toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !mapsGrounding;
              setMapsGrounding(next);
              if (next) setSearchGrounding(false); // Google Search y Maps no se pueden combinar
            }}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              mapsGrounding
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>Google Maps</span>
          </button>

          {/* Fast Mode (Flash Lite) */}
          <button
            type="button"
            onClick={() => setFastMode(!fastMode)}
            className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              fastMode
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>Flash Lite</span>
          </button>
        </div>

        {/* Thread de Mensajes */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isPlaying = playingMessageId === msg.id;

            if (msg.isError) {
              const type = msg.errorType || 'unknown';
              let title = 'Interrupción del Servicio';
              let description = 'Ocurrió un inconveniente al conectar con el asistente virtual DecoBot.';
              let advice = 'Por favor, intenta de nuevo o comunícate directamente por WhatsApp.';
              
              if (type === 'auth') {
                title = 'Error de Configuración (API Key)';
                description = 'La clave de API de Gemini no está configurada o es inválida en el servidor de producción.';
                advice = 'Verifica que GEMINI_API_KEY esté configurada en las variables de entorno de producción.';
              } else if (type === 'quota') {
                title = 'Límite de Consultas Excedido';
                description = 'Se han realizado demasiadas consultas a la IA en poco tiempo.';
                advice = 'La cuota se restablecerá pronto. Puedes esperar unos momentos y reintentar, o contactarnos directamente.';
              } else if (type === 'network') {
                title = 'Fallo de Conexión de Red';
                description = 'No pudimos establecer comunicación con el servidor. Revisa tu conexión de internet.';
                advice = 'Asegúrate de estar conectado a internet y presiona el botón Reintentar consulta.';
              } else if (type === 'server') {
                title = 'Error de Servidor (500)';
                description = 'El servidor experimentó un problema temporal o sobrecarga al procesar tu respuesta.';
                advice = 'Esto suele ser un inconveniente transitorio. Puedes reintentar tu consulta.';
              }

              return (
                <div
                  key={msg.id}
                  className="flex gap-3 justify-start animate-fadeIn"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900/50 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-slate-800 dark:text-rose-100 rounded-tl-none">
                    <div className="flex items-center gap-1.5 mb-1 text-rose-750 dark:text-rose-300 font-bold text-xs sm:text-sm">
                      <ZapOff className="w-3.5 h-3.5 text-rose-650" />
                      <span>{title}</span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold mb-1 text-slate-800 dark:text-slate-150">
                      {description}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 italic leading-normal">
                      {advice}
                    </div>
                    {msg.errorDetails && (
                      <div className="mb-3 px-2 py-1 bg-rose-100/30 dark:bg-rose-950/30 rounded text-[10px] font-mono text-rose-700 dark:text-rose-400 select-all overflow-x-auto">
                        {msg.errorDetails}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {msg.retryPromptText && (
                        <button
                          type="button"
                          onClick={() => handleRetryMessage(msg.retryPromptText!)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Reintentar consulta</span>
                        </button>
                      )}
                      <a
                        href={`https://wa.me/${cleanWa}?text=Hola%20Decoelectric%2C%20estaba%20conversando%20con%20DecoBot%20y%20ocurri%C3%B3%20un%20inconveniente%20tipo%20${type}.%20Quiero%20consultar%20sobre%3A%20${encodeURIComponent(msg.retryPromptText || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Técnico</span>
                      </a>
                    </div>
                    <div className="mt-2 text-[9px] text-slate-400">
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-sky-400/40 p-0.5 flex items-center justify-center shrink-0 shadow-sm mt-0.5 overflow-hidden ring-1 ring-sky-500/30">
                    <img
                      src="/LogoPrincipal.png"
                      alt="DecoBot"
                      className="w-full h-full object-contain rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-sky-500/10'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {/* Citas de Grounding (Google Search / Google Maps) */}
                  {!isUser && msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>Fuentes verificadas:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingChunks.map((chunk, idx) => {
                          if (chunk.web?.uri) {
                            return (
                              <a
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                              >
                                <Search className="w-2.5 h-2.5" />
                                <span className="max-w-[160px] truncate">{chunk.web.title || 'Sitio Web'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            );
                          }
                          if (chunk.maps?.uri) {
                            return (
                              <a
                                key={idx}
                                href={chunk.maps.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                              >
                                <MapPin className="w-2.5 h-2.5" />
                                <span className="max-w-[160px] truncate">{chunk.maps.title || 'Ubicación Google Maps'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Acciones del mensaje del bot (Audio, WhatsApp) */}
                  <div
                    className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${
                      isUser ? 'text-sky-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handlePlayAudio(msg.id, msg.text)}
                          className={`p-1 rounded-md transition-colors flex items-center gap-1 ${
                            isPlaying
                              ? 'text-amber-500 font-bold'
                              : 'hover:text-sky-600 dark:hover:text-sky-400'
                          }`}
                          title={isPlaying ? 'Detener voz' : 'Escuchar respuesta'}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{isPlaying ? 'Detener' : 'Escuchar'}</span>
                        </button>

                        <a
                          href={`https://wa.me/${cleanWa}?text=Hola%20Decoelectric%2C%20estaba%20conversando%20con%20DecoBot%20sobre%3A%20${encodeURIComponent(
                            msg.text.slice(0, 180) + '...'
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:text-emerald-500 transition-colors flex items-center gap-0.5"
                          title="Consultar esto por WhatsApp con un técnico humano"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loader al procesar respuesta */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-sky-400/40 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm ring-1 ring-sky-500/30">
                <img
                  src="/LogoPrincipal.png"
                  alt="DecoBot"
                  className="w-full h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>
                  {searchGrounding
                    ? 'Buscando en Google y analizando datos...'
                    : mapsGrounding
                    ? 'Consultando lugares en Google Maps...'
                    : 'DecoBot está formulando la solución técnica...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias Rápidas */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">Sugerencias:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-sky-500 hover:text-sky-600 shrink-0 transition-all whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar con Soporte de Voz */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          {isListening && (
            <div className="mb-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-300 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Escuchando tu voz... Habla ahora.</span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold"
              >
                Terminar
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Botón de micrófono */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:border-sky-500'
              }`}
              title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Input de texto */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isListening
                  ? 'Escuchando tu consulta...'
                  : 'Escribe tu pregunta o solicita un cálculo...'
              }
              className="flex-1 py-2.5 sm:py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all"
            />

            {/* Botón Enviar */}
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-sky-500/20"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

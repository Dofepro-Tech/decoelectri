import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Tag,
  FileText,
  Sliders,
  Send,
  Loader2
} from 'lucide-react';
import {
  subscribeToPushNotifications,
  getNotificationPermissionStatus,
  getStoredNotificationTopics,
  updateNotificationTopics,
  triggerTestPushNotification,
  getStoredFCMToken,
  isPushNotificationSupported
} from '../services/fcmService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  userId
}) => {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [topics, setTopics] = useState<string[]>(['promociones', 'presupuestos']);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      isPushNotificationSupported().then(setIsSupported);
      const perm = getNotificationPermissionStatus();
      setPermission(perm);
      setTopics(getStoredNotificationTopics());
      setHasToken(Boolean(getStoredFCMToken()));
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleTopic = async (topicName: string) => {
    const updated = topics.includes(topicName)
      ? topics.filter((t) => t !== topicName)
      : [...topics, topicName];

    setTopics(updated);
    await updateNotificationTopics(updated);
    setFeedback({
      type: 'info',
      message: 'Preferencias de temas actualizadas correctamente.'
    });
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setFeedback(null);

    const result = await subscribeToPushNotifications({
      userId,
      topics
    });

    setLoading(false);
    const updatedPerm = getNotificationPermissionStatus();
    setPermission(updatedPerm);

    if (result.success) {
      setHasToken(true);
      setFeedback({
        type: 'success',
        message: '¡Excelente! Notificaciones push de Firebase activadas en este dispositivo.'
      });
      // Enviar una prueba inmediata
      await triggerTestPushNotification(
        '🔔 Decoelectric Push Activado',
        'Recibirás alertas oportunas sobre promociones en paneles PVC y el estado de tus presupuestos.'
      );
    } else {
      setFeedback({
        type: 'error',
        message: result.error || 'No se pudo completar la suscripción. Revisa los permisos de tu navegador.'
      });
    }
  };

  const handleSendTest = async () => {
    setLoading(true);
    const sent = await triggerTestPushNotification(
      '🏷️ Oferta Especial Decoelectric',
      '¡15% de descuento en paneles de PVC para techos este mes en Santo Domingo Este!'
    );
    setLoading(false);

    if (sent) {
      setFeedback({
        type: 'success',
        message: 'Notificación de prueba enviada a tu pantalla.'
      });
    } else {
      setFeedback({
        type: 'info',
        message: 'Sonido de notificación emitido. Si no viste el globo nativo, asegúrate de haber concedido el permiso en la barra de tu navegador.'
      });
    }
  };

  return (
    <div
      id="notification-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="notification-modal-container"
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-blue-50/50 to-emerald-50/30 dark:from-slate-850 dark:via-slate-800/80 dark:to-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <BellRing className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Notificaciones Push
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
                  Firebase FCM
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manténte al día con promociones y cambios en tus cotizaciones
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Alertas / Feedback */}
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : feedback.type === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-sky-500" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Estado de permisos */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  permission === 'granted'
                    ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : permission === 'denied'
                    ? 'bg-rose-500'
                    : 'bg-amber-400'
                }`}
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Estado del navegador:{' '}
                  <span className="capitalize">
                    {permission === 'granted'
                      ? 'Concedido y Activo'
                      : permission === 'denied'
                      ? 'Bloqueado por el usuario'
                      : 'Pendiente de activación'}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {permission === 'granted'
                    ? 'Este dispositivo está listo para recibir alertas en segundo plano.'
                    : permission === 'denied'
                    ? 'Haz clic en el candado de la barra de navegación para permitir notificaciones.'
                    : 'Haz clic abajo para autorizar la recepción de alertas.'}
                </p>
              </div>
            </div>

            {hasToken && (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Registrado
              </span>
            )}
          </div>

          {/* Selector de Temas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ¿Qué información deseas recibir?
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tema 1: Promociones */}
              <button
                type="button"
                onClick={() => handleToggleTopic('promociones')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  topics.includes('promociones')
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-60'
                }`}
              >
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Nuevas Promociones</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    Descuentos en láminas PVC y combos eléctricos residenciales.
                  </p>
                </div>
              </button>

              {/* Tema 2: Presupuestos */}
              <button
                type="button"
                onClick={() => handleToggleTopic('presupuestos')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  topics.includes('presupuestos')
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 opacity-60'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold">Cambios en Presupuestos</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                    Respuestas y avisos cuando tu cotización sea actualizada.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {permission !== 'granted' ? (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4 text-amber-300" />
                )}
                <span>Activar Notificaciones Push Ahora</span>
              </button>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={loading}
                  className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Probar Notificación en Pantalla</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Re-sincronizar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Pie con nota de privacidad */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Decoelectric nunca envía spam. Solo contenido relevante.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-600 dark:text-slate-300 hover:underline"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

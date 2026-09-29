/**
 * Servicio de Notificaciones Push con Firebase Cloud Messaging (FCM)
 * Permite a los clientes recibir alertas de promociones, descuentos y cambios en sus presupuestos.
 */

import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';
import app, { db } from '../firebase/config';
import firebaseConfig from '../../firebase-applet-config.json';

const LOCAL_STORAGE_FCM_TOKEN = 'decoelectric_fcm_token';
const LOCAL_STORAGE_FCM_TOPICS = 'decoelectric_fcm_topics';
const LOCAL_STORAGE_FCM_PERMISSION = 'decoelectric_fcm_permission_prompted';

export interface PushSubscriptionData {
  token: string;
  userId?: string;
  topics: string[]; // e.g. ['promociones', 'presupuestos']
  deviceInfo: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Verifica si el navegador soporta notificaciones push y Service Workers
 */
export async function isPushNotificationSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return false;
  }
  try {
    return await isSupported();
  } catch (err) {
    console.warn('FCM no soportado en este entorno:', err);
    return false;
  }
}

/**
 * Obtiene el estado actual del permiso de notificaciones
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Registra el Service Worker de FCM y obtiene el token de registro
 */
export async function subscribeToPushNotifications(options?: {
  userId?: string;
  topics?: string[];
}): Promise<{ success: boolean; token?: string; error?: string; permissionDenied?: boolean }> {
  try {
    const supported = await isPushNotificationSupported();
    if (!supported) {
      return { success: false, error: 'Las notificaciones push no están soportadas en este navegador o iframe.' };
    }

    // Solicitar permiso al usuario
    const permission = await Notification.requestPermission();
    localStorage.setItem(LOCAL_STORAGE_FCM_PERMISSION, 'true');

    if (permission !== 'granted') {
      return { success: false, error: 'Permiso de notificaciones no concedido.', permissionDenied: true };
    }

    // Registrar o reutilizar el service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    await navigator.serviceWorker.ready;

    const messaging = getMessaging(app);

    // Obtener token FCM para este dispositivo
    const token = await getToken(messaging, {
      serviceWorkerRegistration: registration,
      vapidKey: (firebaseConfig as any).vapidKey || undefined
    });

    if (!token) {
      return { success: false, error: 'No se pudo generar el token de notificación de Firebase.' };
    }

    // Guardar token y preferencias en localStorage
    const chosenTopics = options?.topics || ['promociones', 'presupuestos'];
    localStorage.setItem(LOCAL_STORAGE_FCM_TOKEN, token);
    localStorage.setItem(LOCAL_STORAGE_FCM_TOPICS, JSON.stringify(chosenTopics));

    // Guardar en Firestore para que el administrador pueda enviar alertas segmentadas
    try {
      // Usamos un hash o los primeros 32 caracteres del token como ID de documento para no exponer tokens largos en rutas
      const tokenDocId = 'sub_' + btoa(token.slice(0, 32)).replace(/[/+=]/g, '_');
      const subRef = doc(db, 'notificationSubscriptions', tokenDocId);

      await setDoc(
        subRef,
        {
          id: tokenDocId,
          token,
          userId: options?.userId || 'invitado',
          topics: chosenTopics,
          deviceInfo: `${navigator.platform} - ${navigator.userAgent.slice(0, 80)}`,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (dbErr) {
      console.warn('No se pudo guardar el token en Firestore, pero el dispositivo está suscrito localmente:', dbErr);
    }

    return { success: true, token };
  } catch (err: any) {
    console.error('Error al suscribir a notificaciones push:', err);
    return { success: false, error: err.message || 'Error inesperado al activar notificaciones.' };
  }
}

/**
 * Obtiene el token FCM guardado en este dispositivo si existe
 */
export function getStoredFCMToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LOCAL_STORAGE_FCM_TOKEN);
}

/**
 * Obtiene los temas suscritos guardados en el dispositivo
 */
export function getStoredNotificationTopics(): string[] {
  if (typeof window === 'undefined') return ['promociones', 'presupuestos'];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FCM_TOPICS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ['promociones', 'presupuestos'];
}

/**
 * Actualiza los temas (promociones o presupuestos) en Firestore y local
 */
export async function updateNotificationTopics(topics: string[]): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  localStorage.setItem(LOCAL_STORAGE_FCM_TOPICS, JSON.stringify(topics));

  const token = getStoredFCMToken();
  if (token) {
    try {
      const tokenDocId = 'sub_' + btoa(token.slice(0, 32)).replace(/[/+=]/g, '_');
      const subRef = doc(db, 'notificationSubscriptions', tokenDocId);
      await updateDoc(subRef, {
        topics,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.warn('Error al actualizar temas en Firestore:', err);
    }
  }
  return true;
}

/**
 * Escucha notificaciones en primer plano (Foreground) cuando la aplicación está abierta
 */
export function listenToForegroundMessages(onPayloadReceived: (payload: {
  title: string;
  body: string;
  icon?: string;
  data?: any;
}) => void): () => void {
  let unsubscribe: (() => void) | null = null;

  isPushNotificationSupported().then((supported) => {
    if (!supported) return;

    try {
      const messaging = getMessaging(app);
      unsubscribe = onMessage(messaging, (payload) => {
        console.log('[FCM] Mensaje recibido en primer plano:', payload);
        const title = payload.notification?.title || payload.data?.title || 'Decoelectric Alerta';
        const body = payload.notification?.body || payload.data?.body || 'Tienes una nueva actualización.';
        const icon = payload.notification?.icon || '/LogoPrincipal.png';

        // Reproducir sonido sutil de notificación
        playNotificationBeep();

        onPayloadReceived({
          title,
          body,
          icon,
          data: payload.data
        });
      });
    } catch (err) {
      console.warn('Error al configurar listener en primer plano FCM:', err);
    }
  });

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}

/**
 * Emite un tono suave de notificación utilizando Web Audio API
 */
export function playNotificationBeep(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {}
}

/**
 * Dispara una notificación de prueba local para verificar que los permisos y diseño funcionan en el equipo
 */
export async function triggerTestPushNotification(title?: string, body?: string): Promise<boolean> {
  const finalTitle = title || '🎉 ¡Notificaciones Decoelectric Activadas!';
  const finalBody =
    body || 'Recibirás avisos instantáneos de nuevas ofertas en techos de PVC y actualizaciones de tus presupuestos.';

  playNotificationBeep();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification(finalTitle, {
          body: finalBody,
          icon: '/LogoPrincipal.png',
          badge: '/icon.png',
          tag: 'decoelectric-test',
          data: { url: '/' }
        });
        return true;
      } else {
        new Notification(finalTitle, {
          body: finalBody,
          icon: '/LogoPrincipal.png'
        });
        return true;
      }
    } catch (err) {
      console.warn('Fallo al disparar notificación nativa:', err);
    }
  }

  return false;
}

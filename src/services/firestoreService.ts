import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { GalleryProject, ServiceItem, SiteSettings, QuoteRequest, UserProfile, Testimonial, Favorite, Note } from '../types';
import { GALLERY_PROJECTS, SERVICES_DATA } from '../data/mockData';

// ----------------------------------------------------
// FIRESTORE ERROR HANDLING (Firebase Skill Spec)
// ----------------------------------------------------
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
  return errInfo;
}

const ADMIN_EMAILS = ['dofeprotech@gmail.com', 'elsonidistaadnj@gmail.com', 'elsonidistadnj@gmail.com'];

export const isCurrentUserAdmin = (): boolean => {
  return !!auth.currentUser?.email && ADMIN_EMAILS.includes(auth.currentUser.email.toLowerCase());
};

// ----------------------------------------------------
// LOCAL PERSISTENCE STORAGE FOR FALLBACK & OFFLINE
// ----------------------------------------------------
const LOCAL_QUOTES_KEY = 'decoelectric-local-quotes';
const LOCAL_USERS_KEY = 'decoelectric-local-users';

export const INITIAL_DEMO_QUOTES: QuoteRequest[] = [
  {
    id: 'REQ-910482',
    fullName: 'Carlos Mendoza',
    phone: '829-555-1284',
    sector: 'Alma Rosa I',
    serviceNeeded: 'pvc',
    budgetDOP: 32000,
    urgency: 'normal',
    additionalDetails: 'Instalación de paneles PVC blanco marfil en sala de estar con luces LED empotradas.',
    status: 'nueva',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'REQ-873912',
    fullName: 'Mariana Reyes',
    phone: '809-555-9032',
    sector: 'Ensanche Ozama',
    serviceNeeded: 'electricidad',
    budgetDOP: 18500,
    urgency: 'urgente',
    additionalDetails: 'Revisión y reemplazo de breakers en panel principal residencial por sobrecalentamiento.',
    status: 'en_contacto',
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
  },
  {
    id: 'REQ-752109',
    fullName: 'Ing. Roberto Peña',
    phone: '829-555-4471',
    sector: 'San Isidro',
    serviceNeeded: 'combo',
    budgetDOP: 65000,
    urgency: 'normal',
    additionalDetails: 'Renovación completa: Techo en PVC imitación roble y recableado de cocina.',
    status: 'completada',
    createdAt: new Date(Date.now() - 3600000 * 68).toISOString(),
  },
];

export const INITIAL_DEMO_USERS: UserProfile[] = [
  {
    uid: 'admin-dofeprotech',
    email: 'dofeprotech@gmail.com',
    displayName: 'Ing. Decoelectric (Super Admin)',
    role: 'admin',
    createdAt: '2025-01-10T10:00:00.000Z',
  },
  {
    uid: 'user-cmendoza',
    email: 'carlos.mendoza@gmail.com',
    displayName: 'Carlos Mendoza',
    role: 'cliente',
    createdAt: '2025-02-01T14:30:00.000Z',
  },
  {
    uid: 'user-mreyes',
    email: 'mariana.reyes@hotmail.com',
    displayName: 'Mariana Reyes',
    role: 'cliente',
    createdAt: '2025-02-14T09:15:00.000Z',
  },
];

const DEMO_GALLERY_CLEARED_KEY = 'decoelectric-cleared-demo-gallery';

export const isDemoGalleryCleared = (): boolean => {
  return localStorage.getItem(DEMO_GALLERY_CLEARED_KEY) === 'true';
};

export const clearAllGalleryProjects = async (projects: GalleryProject[]): Promise<void> => {
  localStorage.setItem(DEMO_GALLERY_CLEARED_KEY, 'true');
  for (const p of projects) {
    try {
      await deleteDoc(doc(db, 'gallery', p.id));
    } catch {}
  }
};

export const restoreDemoGalleryProjects = async (): Promise<void> => {
  localStorage.removeItem(DEMO_GALLERY_CLEARED_KEY);
  for (const proj of GALLERY_PROJECTS) {
    try {
      await setDoc(doc(db, 'gallery', proj.id), proj);
    } catch {}
  }
};

export const getLocalQuotes = (): QuoteRequest[] => {
  try {
    const raw = localStorage.getItem(LOCAL_QUOTES_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    // Start with empty array by default so user gets clean production data
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
};

export const clearAllLocalQuotes = () => {
  try {
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify([]));
  } catch (e) {
    console.warn('Error clearing local quotes:', e);
  }
};

export const saveLocalQuote = (quote: QuoteRequest) => {
  try {
    const current = getLocalQuotes();
    const updated = [quote, ...current.filter((q) => q.id !== quote.id)];
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error saving local quote:', e);
  }
};

export const updateLocalQuoteStatus = (id: string, status: 'nueva' | 'en_contacto' | 'completada') => {
  try {
    const current = getLocalQuotes();
    const updated = current.map((q) => (q.id === id ? { ...q, status } : q));
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error updating local quote status:', e);
  }
};

export const deleteLocalQuote = (id: string) => {
  try {
    const current = getLocalQuotes();
    const updated = current.filter((q) => q.id !== id);
    localStorage.setItem(LOCAL_QUOTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error deleting local quote:', e);
  }
};

export const getLocalUsers = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      return INITIAL_DEMO_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_USERS;
  }
};

export const updateLocalUserRole = (uid: string, role: 'admin' | 'cliente') => {
  try {
    const current = getLocalUsers();
    const updated = current.map((u) => (u.uid === uid ? { ...u, role } : u));
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Error updating local user role:', e);
  }
};

// DEFAULT SETTINGS
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phoneNumber: '809-303-1730',
  secondaryPhone: '849-264-8965',
  whatsappNumber: '809-303-1738',
  contactEmail: 'dofeprotech@gmail.com',
  instagramUrl: 'https://www.instagram.com/decoelectri/',
  adminQuickPassword: 'admin123',
  heroBadge: 'Líderes en Santo Domingo Este',
  heroTitle: 'Transformamos y damos energía a',
  heroHighlight: 'tus espacios.',
  heroSubtitle: 'Soluciones profesionales en electricidad residencial segura, acabados de lujo con paneles de PVC y plomería en Santo Domingo Este.',
  announcementText: '⚡ Atención rápida al 809-303-1730 y 849-264-8965. ¡Visitas técnicas y cotizaciones hoy!',
  showAnnouncement: true,
  emergencyNotice: 'Emergencias eléctricas 24/7 en Santo Domingo Este',
  coverageAreas: [
    'Santo Domingo Este Y Más'
  ],
  mission: 'Brindar soluciones integrales en electricidad residencial certificada, revestimientos de lujo con paneles de PVC y plomería en Santo Domingo Este, garantizando máxima seguridad técnica, acabados estéticos impecables y una atención transparente y puntual que dignifique y proteja cada hogar y negocio de nuestros clientes.',
  vision: 'Ser la empresa líder de referencia en Santo Domingo Este y Gran Santo Domingo en remodelaciones estéticas y seguridad eléctrica residencial, reconocida por nuestra excelencia en servicio, innovación constante en materiales decorativos y fidelidad en el cumplimiento de presupuestos y tiempos acordados.',
  values: [
    'Seguridad Técnica Certificada: Cero atajos en instalaciones eléctricas para resguardar la vida y patrimonio familiar.',
    'Puntualidad y Cumplimiento: Respeto absoluto al tiempo y a las fechas pactadas para el inicio y entrega de cada proyecto.',
    'Transparencia y Honestidad: Presupuestos claros sin costos ocultos antes de encender la primera herramienta.',
    'Limpieza y Orden Impecable: Dejamos cada espacio impecable y listo para disfrutar al finalizar la jornada.',
    'Calidad y Durabilidad: Utilizamos exclusivamente materiales de primer nivel resistentes a humedad y alto tránsito.'
  ],
  termsAndConditions: `TÉRMINOS Y CONDICIONES DE SERVICIO - DECOELECTRIC S.R.L.

1. Alcance de los Servicios: Decoelectric ofrece servicios de electricidad residencial segura, instalación de paneles y techos en PVC decorativo, plomería y remodelaciones en Santo Domingo Este y áreas circundantes.
2. Cotizaciones y Visitas Técnicas: Las cotizaciones emitidas a través de nuestro sitio web o WhatsApp constituyen estimados preliminares basados en las especificaciones suministradas por el cliente. Las evaluaciones presenciales confirman el alcance y costo definitivo antes de iniciar el trabajo.
3. Garantía de Mano de Obra: Todos nuestros trabajos eléctricos e instalaciones de PVC cuentan con garantía de instalación sobre defectos de mano de obra. Los materiales suministrados están amparados por las garantías directas de los fabricantes autorizados.
4. Obligaciones del Cliente: El cliente se compromete a facilitar el acceso seguro a las áreas de trabajo, tomas de energía y agua requeridas para la ejecución, así como notificar cualquier condición estructural preexistente.
5. Pagos y Anticipos: Los trabajos a medida o suministro de materiales pueden requerir un anticipo acordado previamente, saldando la totalidad a la entrega satisfactoria de la obra.
6. Cancelaciones y Reprogramaciones: Las citas de servicio pueden reprogramarse con al menos 24 horas de antelación sin penalidad alguna.`,
  privacyPolicy: `POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS - DECOELECTRIC S.R.L.

1. Responsable del Tratamiento: Decoelectric S.R.L., con sede de operaciones en Santo Domingo Este, República Dominicana, y correo oficial de contacto: dofeprotech@gmail.com.
2. Información Recopilada: Recopilamos datos estrictamente necesarios para la prestación del servicio: nombre completo, número telefónico / WhatsApp, sector o dirección de servicio y detalles del trabajo solicitado.
3. Finalidad del Tratamiento: Los datos suministrados se utilizan exclusivamente para:
- Confeccionar y enviar presupuestos personalizados vía WhatsApp o correo electrónico.
- Coordinar visitas técnicas y seguimiento post-servicio.
- Atención de consultas y gestión de garantías.
4. No Comercialización de Datos: En Decoelectric garantizamos que no vendemos, alquilamos ni compartimos tus datos personales con terceros con fines publicitarios o comerciales no autorizados.
5. Seguridad de la Información: Empleamos protocolos de cifrado y bases de datos seguras (Firebase / Google Cloud) para proteger la información contra accesos no autorizados.
6. Derechos del Usuario: Puedes solicitar en cualquier momento la consulta, actualización o eliminación definitiva de tus datos escribiéndonos a dofeprotech@gmail.com o a través de nuestros números de atención rápida: 809-303-1730 y 849-264-8965.`
};

// ----------------------------------------------------
// 1. GALLERY PROJECTS SERVICE
// ----------------------------------------------------
export const subscribeToGallery = (
  callback: (projects: GalleryProject[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, 'gallery');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        if (isDemoGalleryCleared()) {
          callback([]);
          return;
        }
        
        // Evitar intentar escribir en Firestore si el visitante no tiene privilegios de administrador
        if (!isCurrentUserAdmin()) {
          callback(GALLERY_PROJECTS);
          return;
        }

        // Seed default projects if collection is empty
        try {
          const batch = writeBatch(db);
          for (const proj of GALLERY_PROJECTS) {
            batch.set(doc(db, 'gallery', proj.id), proj);
          }
          await batch.commit();
          callback(GALLERY_PROJECTS);
          return;
        } catch (e) {
          console.warn('Could not auto-seed gallery, using local default:', e);
          callback(isDemoGalleryCleared() ? [] : GALLERY_PROJECTS);
          return;
        }
      }

      const projects: GalleryProject[] = [];
      snapshot.forEach((d) => {
        projects.push({ id: d.id, ...d.data() } as GalleryProject);
      });
      callback(projects);
    },
    (err) => {
      console.warn('Firestore gallery subscription error, falling back to local:', err);
      callback(GALLERY_PROJECTS);
      if (onError) onError(err);
    }
  );
};

export const createGalleryProject = async (project: Omit<GalleryProject, 'id'>): Promise<string> => {
  const id = 'proj-' + Date.now();
  await setDoc(doc(db, 'gallery', id), {
    ...project,
    id,
    createdAt: new Date().toISOString(),
  });
  return id;
};

export const updateGalleryProject = async (id: string, updates: Partial<GalleryProject>): Promise<void> => {
  const docRef = doc(db, 'gallery', id);
  await updateDoc(docRef, updates);
};

export const deleteGalleryProject = async (id: string): Promise<void> => {
  const docRef = doc(db, 'gallery', id);
  await deleteDoc(docRef);
};

// ----------------------------------------------------
// 2. SERVICES SERVICE
// ----------------------------------------------------
export const subscribeToServices = (
  callback: (services: ServiceItem[]) => void,
  onError?: (error: any) => void
) => {
  const colRef = collection(db, 'services');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Evitar intentar escribir en Firestore si el visitante no tiene privilegios de administrador
        if (!isCurrentUserAdmin()) {
          callback(SERVICES_DATA);
          return;
        }

        // Auto-seed default services
        try {
          const batch = writeBatch(db);
          for (const serv of SERVICES_DATA) {
            batch.set(doc(db, 'services', serv.id), serv);
          }
          await batch.commit();
          callback(SERVICES_DATA);
          return;
        } catch (e) {
          console.warn('Could not auto-seed services, using local default:', e);
          callback(SERVICES_DATA);
          return;
        }
      }

      const services: ServiceItem[] = [];
      snapshot.forEach((d) => {
        const item = { id: d.id, ...d.data() } as ServiceItem;
        if (item.category === 'plomeria') {
          if (item.title === 'Plomería y Mantenimiento' || item.title === 'Plomería Integral' || item.title?.toLowerCase().includes('integral')) {
            item.title = 'Plomería';
          }
          if (item.description && item.description.includes('y mantenimiento integral')) {
            item.description = item.description.replace(' y mantenimiento integral', '');
          }
          if (item.subtitle && item.subtitle.toLowerCase().includes('integral')) {
            item.subtitle = item.subtitle.replace(/integral/gi, 'residencial');
          }
        }
        services.push(item);
      });
      callback(services);
    },
    (err) => {
      console.warn('Firestore services error, falling back to local:', err);
      callback(SERVICES_DATA);
      if (onError) onError(err);
    }
  );
};

export const updateService = async (id: string, updates: Partial<ServiceItem>): Promise<void> => {
  const docRef = doc(db, 'services', id);
  await updateDoc(docRef, updates);
};

export const createService = async (service: ServiceItem): Promise<void> => {
  await setDoc(doc(db, 'services', service.id), service);
};

export const deleteService = async (id: string): Promise<void> => {
  const docRef = doc(db, 'services', id);
  await deleteDoc(docRef);
};

// ----------------------------------------------------
// 3. SITE SETTINGS / EDITABLE AREAS & CONFIGURATIONS
// ----------------------------------------------------
const LOCAL_SETTINGS_KEY = 'decoelectric-site-settings';

export const getLocalSiteSettings = (): SiteSettings => {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_SITE_SETTINGS;
};

export const subscribeToSiteSettings = (
  callback: (settings: SiteSettings) => void
) => {
  // Return local settings immediately
  callback(getLocalSiteSettings());

  const docRef = doc(db, 'siteSettings', 'general');

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        try {
          await setDoc(docRef, DEFAULT_SITE_SETTINGS);
          localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(DEFAULT_SITE_SETTINGS));
          callback(DEFAULT_SITE_SETTINGS);
        } catch {
          callback(getLocalSiteSettings());
        }
        return;
      }
      const data = { ...DEFAULT_SITE_SETTINGS, ...snapshot.data() } as SiteSettings;
      try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(data));
        if (data.adminQuickPassword) {
          localStorage.setItem('decoelectric-admin-pass', data.adminQuickPassword);
        }
      } catch {}
      callback(data);
    },
    (err) => {
      console.warn('Site settings error, using local/default:', err);
      callback(getLocalSiteSettings());
    }
  );
};

export const updateSiteSettings = async (updates: Partial<SiteSettings>): Promise<void> => {
  const current = getLocalSiteSettings();
  const merged = { ...current, ...updates };

  try {
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(merged));
    if (updates.adminQuickPassword) {
      localStorage.setItem('decoelectric-admin-pass', updates.adminQuickPassword);
    }
  } catch {}

  const docRef = doc(db, 'siteSettings', 'general');
  try {
    await setDoc(docRef, updates, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'siteSettings/general');
  }
};

// ----------------------------------------------------
// 4. QUOTE REQUESTS (COTIZACIONES)
// ----------------------------------------------------
export const submitQuoteRequest = async (quote: QuoteRequest): Promise<string> => {
  const id = 'REQ-' + Date.now().toString().slice(-6);
  const newQuote: QuoteRequest = {
    ...quote,
    id,
    status: quote.status || 'nueva',
    createdAt: quote.createdAt || new Date().toISOString(),
  };

  // Always save locally first so it is immediately visible in AdminPanel
  saveLocalQuote(newQuote);

  try {
    await setDoc(doc(db, 'quoteRequests', id), newQuote);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `quoteRequests/${id}`);
  }
  return id;
};

export const subscribeToQuoteRequests = (
  callback: (requests: QuoteRequest[]) => void
) => {
  // Supply local cached quotes immediately
  const local = getLocalQuotes();
  callback(local);

  // If not authenticated in Firebase Auth, avoid querying Firestore to prevent permission errors
  if (!auth.currentUser) {
    return () => {};
  }

  const colRef = collection(db, 'quoteRequests');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const requests: QuoteRequest[] = [];
      snapshot.forEach((d) => {
        requests.push({ id: d.id, ...d.data() } as QuoteRequest);
      });
      // Sort newest first
      requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (requests.length > 0) {
        callback(requests);
      } else {
        callback(getLocalQuotes());
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'quoteRequests');
      callback(getLocalQuotes());
    }
  );
};

export const updateQuoteStatus = async (id: string, status: 'nueva' | 'en_contacto' | 'completada'): Promise<void> => {
  updateLocalQuoteStatus(id, status);
  if (auth.currentUser) {
    try {
      await updateDoc(doc(db, 'quoteRequests', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `quoteRequests/${id}`);
    }
  }
};

export const deleteQuoteRequest = async (id: string): Promise<void> => {
  deleteLocalQuote(id);
  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'quoteRequests', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `quoteRequests/${id}`);
    }
  }
};

// ----------------------------------------------------
// 5. USER PROFILES & ROLES
// ----------------------------------------------------
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
  const local = getLocalUsers().find((u) => u.uid === uid);
  return local || null;
};

export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  // Update local list
  const current = getLocalUsers();
  const exists = current.some((u) => u.uid === profile.uid);
  const updated = exists ? current.map((u) => (u.uid === profile.uid ? profile : u)) : [profile, ...current];
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
  } catch {}

  if (auth.currentUser) {
    try {
      await setDoc(doc(db, 'users', profile.uid), profile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${profile.uid}`);
    }
  }
};

export const subscribeToUsers = (callback: (users: UserProfile[]) => void) => {
  callback(getLocalUsers());

  // Only query Firestore if authenticated
  if (!auth.currentUser) {
    return () => {};
  }

  const colRef = collection(db, 'users');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach((d) => {
        users.push(d.data() as UserProfile);
      });
      if (users.length > 0) {
        callback(users);
      } else {
        callback(getLocalUsers());
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
      callback(getLocalUsers());
    }
  );
};

export const updateUserRole = async (uid: string, role: 'admin' | 'cliente'): Promise<void> => {
  updateLocalUserRole(uid, role);
  if (auth.currentUser) {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  }
};

// ----------------------------------------------------
// 6. REAL CLIENT TESTIMONIALS & REVIEWS
// (NO FICTITIOUS TESTIMONIALS: ONLY REAL CUSTOMER SUBMISSIONS)
// ----------------------------------------------------
const LOCAL_TESTIMONIALS_KEY = 'decoelectric-real-testimonials';

export const getLocalTestimonials = (): Testimonial[] => {
  try {
    const raw = localStorage.getItem(LOCAL_TESTIMONIALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveLocalTestimonials = (items: Testimonial[]) => {
  try {
    localStorage.setItem(LOCAL_TESTIMONIALS_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('decoelectric-testimonials-updated'));
  } catch {}
};

export const subscribeToTestimonials = (callback: (testimonials: Testimonial[]) => void) => {
  // Emit current local testimonials first
  callback(getLocalTestimonials());

  try {
    const colRef = collection(db, 'testimonials');
    const q = query(colRef, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const testimonials: Testimonial[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          testimonials.push({
            id: d.id,
            name: data.name || 'Cliente',
            sector: data.sector || '',
            serviceCategory: data.serviceCategory || '',
            rating: typeof data.rating === 'number' ? data.rating : 5,
            comment: data.comment || '',
            createdAt: data.createdAt || new Date().toISOString(),
            verified: data.verified ?? true,
            userId: data.userId,
          });
        });

        if (testimonials.length > 0) {
          saveLocalTestimonials(testimonials);
          callback(testimonials);
        } else {
          // If Firestore collection is empty, also honor local ones if any were saved
          callback(getLocalTestimonials());
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'testimonials');
        callback(getLocalTestimonials());
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'testimonials');
    callback(getLocalTestimonials());
    return () => {};
  }
};

export const addTestimonial = async (
  data: Omit<Testimonial, 'id' | 'createdAt'>
): Promise<Testimonial> => {
  const newId = `TEST-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newTestimonial: Testimonial = {
    ...data,
    id: newId,
    createdAt: new Date().toISOString(),
    verified: true,
  };

  // 1. Guardar localmente
  const current = getLocalTestimonials();
  const updated = [newTestimonial, ...current];
  saveLocalTestimonials(updated);

  // 2. Guardar en Firestore
  try {
    const docRef = doc(db, 'testimonials', newId);
    await setDoc(docRef, {
      ...newTestimonial,
      serverTime: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `testimonials/${newId}`);
  }

  return newTestimonial;
};

export const deleteTestimonial = async (id: string): Promise<void> => {
  // 1. Eliminar localmente
  const current = getLocalTestimonials();
  const updated = current.filter((item) => item.id !== id);
  saveLocalTestimonials(updated);

  // 2. Eliminar de Firestore
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
  }
};

// ----------------------------------------------------
// 7. FAVORITES & NOTES MANAGEMENT
// ----------------------------------------------------

const LOCAL_FAVORITES_KEY = 'decoelectric-local-favorites';
const LOCAL_NOTES_KEY = 'decoelectric-local-notes';

export const getLocalFavorites = (): Favorite[] => {
  try {
    const raw = localStorage.getItem(LOCAL_FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalFavorites = (items: Favorite[]) => {
  try {
    localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('decoelectric-favorites-updated'));
  } catch {}
};

export const subscribeToFavorites = (
  userId: string | undefined,
  callback: (favorites: Favorite[]) => void
) => {
  callback(getLocalFavorites());

  if (!userId || !auth.currentUser) {
    return () => {};
  }

  const colRef = collection(db, 'favorites');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const favorites: Favorite[] = [];
      snapshot.forEach((d) => {
        favorites.push({ id: d.id, ...d.data() } as Favorite);
      });
      saveLocalFavorites(favorites);
      callback(favorites);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `favorites?userId=${userId}`);
      callback(getLocalFavorites());
    }
  );
};

export const toggleFavorite = async (
  userId: string | undefined,
  targetId: string,
  targetType: 'project' | 'service',
  title: string,
  image?: string
): Promise<boolean> => {
  const currentLocal = getLocalFavorites();
  const existingIndex = currentLocal.findIndex(
    (f) => f.targetId === targetId && f.userId === (userId || 'offline')
  );

  let updated: Favorite[];
  let isAdded = false;

  const activeUserId = userId || 'offline';

  if (existingIndex > -1) {
    // Remove
    const favId = currentLocal[existingIndex].id;
    updated = currentLocal.filter((_, i) => i !== existingIndex);
    saveLocalFavorites(updated);

    if (userId && auth.currentUser) {
      try {
        await deleteDoc(doc(db, 'favorites', favId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `favorites/${favId}`);
      }
    }
    isAdded = false;
  } else {
    // Add
    const newId = `FAV-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newFav: Favorite = {
      id: newId,
      userId: activeUserId,
      targetId,
      targetType,
      title,
      image,
      createdAt: new Date().toISOString(),
    };
    updated = [newFav, ...currentLocal];
    saveLocalFavorites(updated);

    if (userId && auth.currentUser) {
      try {
        await setDoc(doc(db, 'favorites', newId), newFav);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `favorites/${newId}`);
      }
    }
    isAdded = true;
  }

  return isAdded;
};

export const getLocalNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(LOCAL_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalNotes = (items: Note[]) => {
  try {
    localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('decoelectric-notes-updated'));
  } catch {}
};

export const subscribeToNotes = (
  userId: string | undefined,
  callback: (notes: Note[]) => void
) => {
  callback(getLocalNotes());

  if (!userId || !auth.currentUser) {
    return () => {};
  }

  const colRef = collection(db, 'notes');
  const q = query(colRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const notes: Note[] = [];
      snapshot.forEach((d) => {
        notes.push({ id: d.id, ...d.data() } as Note);
      });
      // Sort newest first
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalNotes(notes);
      callback(notes);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, `notes?userId=${userId}`);
      callback(getLocalNotes());
    }
  );
};

export const saveNote = async (
  userId: string | undefined,
  content: string,
  targetId?: string,
  targetType: 'project' | 'service' | 'general' = 'general',
  title?: string,
  noteId?: string
): Promise<Note> => {
  const activeUserId = userId || 'offline';
  const isEditing = !!noteId;
  const currentLocal = getLocalNotes();

  let finalNote: Note;

  if (isEditing) {
    const existing = currentLocal.find((n) => n.id === noteId);
    finalNote = {
      id: noteId,
      userId: activeUserId,
      targetId: targetId || existing?.targetId,
      targetType: targetType || existing?.targetType || 'general',
      title: title ?? existing?.title,
      content,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = currentLocal.map((n) => (n.id === noteId ? finalNote : n));
    saveLocalNotes(updated);

    if (userId && auth.currentUser) {
      try {
        await updateDoc(doc(db, 'notes', noteId), {
          content,
          title: finalNote.title || '',
          updatedAt: finalNote.updatedAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notes/${noteId}`);
      }
    }
  } else {
    const newId = `NOTE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    finalNote = {
      id: newId,
      userId: activeUserId,
      targetId,
      targetType,
      title: title || 'Nota Personal',
      content,
      createdAt: new Date().toISOString(),
    };

    const updated = [finalNote, ...currentLocal];
    saveLocalNotes(updated);

    if (userId && auth.currentUser) {
      try {
        await setDoc(doc(db, 'notes', newId), finalNote);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `notes/${newId}`);
      }
    }
  }

  return finalNote;
};

export const deleteNote = async (
  userId: string | undefined,
  noteId: string
): Promise<void> => {
  const currentLocal = getLocalNotes();
  const updated = currentLocal.filter((n) => n.id !== noteId);
  saveLocalNotes(updated);

  if (userId && auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `notes/${noteId}`);
    }
  }
};


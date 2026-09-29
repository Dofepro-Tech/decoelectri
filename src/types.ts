export type ServiceCategory = 'electricidad' | 'pvc' | 'plomeria' | 'combo';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  title: string;
  subtitle: string;
  description: string;
  iconName: 'Zap' | 'Layers' | 'Wrench' | 'Sparkles';
  features: string[];
  startingPrice: string;
  popularBadge?: string;
  bannerImage: string;
}

export interface GalleryProject {
  id: string;
  title: string;
  category: ServiceCategory;
  location: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  highlight: string;
  completionTime: string;
}

export interface CalculatorState {
  service: ServiceCategory;
  // PVC options
  pvcArea: number; // m2
  pvcType: 'marmol' | 'madera' | 'textura3d' | 'blanco_minimalista';
  includeLedProfile: boolean;
  isCeiling: boolean;
  // Electricity options
  electricalPoints: number;
  breakerPanelUpgrade: boolean;
  includeLamps: boolean;
  urgencyLevel: 'standard' | 'prioritario';
  // Plumbing options
  plumbingType: 'bomba_tinaco' | 'griferia_sanitarios' | 'fuga_tuberia' | 'mantenimiento_preventivo';
  plumbingUnits: number;
}

export interface ContactFormData {
  fullName: string;
  phone: string;
  sector: string;
  serviceNeeded: ServiceCategory;
  preferredDate: string;
  additionalDetails: string;
  urgency: 'normal' | 'urgente' | 'emergencia';
}

export interface ValidationErrors {
  fullName?: string;
  phone?: string;
  sector?: string;
  additionalDetails?: string;
}

export interface SavedEstimate {
  id: string;
  timestamp: string;
  service: ServiceCategory;
  totalEstimatedDOP: number;
  details: string;
  clientName: string;
}

export type UserRole = 'admin' | 'cliente';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  phone?: string;
  photoURL?: string;
}

export interface QuoteRequest {
  id?: string;
  fullName: string;
  phone: string;
  sector: string;
  serviceNeeded: ServiceCategory;
  budgetDOP?: number;
  budgetSummary?: string;
  preferredDate?: string;
  additionalDetails?: string;
  urgency: 'normal' | 'urgente' | 'emergencia';
  status: 'nueva' | 'en_contacto' | 'completada';
  createdAt: string;
  userId?: string;
  clientEmail?: string;
}

export interface SiteSettings {
  phoneNumber: string; // Atención rápida 1 (ej: 809-303-1730)
  secondaryPhone: string; // Atención rápida 2 (ej: 849-264-8965)
  whatsappNumber: string; // WhatsApp oficial (ej: 809-303-1738)
  contactEmail: string; // Correo de contacto (ej: dofeprotech@gmail.com)
  instagramUrl: string; // Enlace a Instagram de la empresa
  adminQuickPassword?: string; // Clave de acceso rápido de administrador
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  announcementText: string;
  showAnnouncement: boolean;
  emergencyNotice: string;
  coverageAreas: string[];
  // Misión, Visión, Valores
  mission: string;
  vision: string;
  values: string[];
  // Términos y Privacidad
  termsAndConditions: string;
  privacyPolicy: string;
}

export interface Testimonial {
  id: string;
  name: string;
  sector?: string;
  serviceCategory?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  verified?: boolean;
  userId?: string;
}

export interface Favorite {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'project' | 'service';
  title: string;
  image?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  targetId?: string;
  targetType: 'project' | 'service' | 'general';
  title?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}


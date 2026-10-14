import { ServiceItem, GalleryProject } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'electricidad-residencial',
    category: 'electricidad',
    title: 'Electricidad Residencial',
    subtitle: 'Seguridad certificada y energía confiable',
    description: 'Instalaciones completas, modernización de tableros eléctricos, cableado seguro y soluciones contra cortocircuitos cumpliendo normas técnicas para proteger tu hogar.',
    iconName: 'Zap',
    features: [
      'Modernización y balanceo de tableros de breakers',
      'Instalación de iluminación LED empotrada y decorativa',
      'Corrección de fugas de corriente y cortocircuitos',
      'Tomas 110V/220V para aires acondicionados y estufas',
      'Diagnóstico preventivo con medidor digital de carga'
    ],
    startingPrice: 'Desde RD$ 2,500',
    popularBadge: 'Servicio Estrella',
    bannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'paneles-pvc-decorativos',
    category: 'pvc',
    title: 'Instalación de Paneles PVC',
    subtitle: 'Elegancia, modernidad y cero humedad',
    description: 'Transforma tus paredes y techos con paneles de PVC de alta gama. Acabados tipo mármol de lujo, listones de madera noble y texturas 3D sin obras sucias ni pintura.',
    iconName: 'Layers',
    features: [
      '100% resistentes al agua y la humedad tropical',
      'Acabados hiperrealistas: Mármol, Maderas cálidas y 3D',
      'Aislante acústico y térmico para mayor confort',
      'Instalación ultra rápida y sin escombros molestos',
      'Mantenimiento mínimo: fácil limpieza con paño húmedo'
    ],
    startingPrice: 'Desde RD$ 1,200 / m²',
    popularBadge: 'Más Solicitado',
    bannerImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'plomeria-mantenimiento',
    category: 'plomeria',
    title: 'Plomería',
    subtitle: 'Flujo perfecto y soluciones definitivas',
    description: 'Servicio técnico especializado en plomería residencial. Instalación de presurizadores, tinacos, cisternas, grifería moderna y detección de filtraciones.',
    iconName: 'Wrench',
    features: [
      'Instalación y automatización de presurizadores y tinacos',
      'Montaje de tinacos, flotadores y válvulas de retención',
      'Instalación de griferías premium, fregaderos e inodoros',
      'Detección y reparación de filtraciones ocultas',
      'Mantenimiento preventivo general para el hogar'
    ],
    startingPrice: 'Desde RD$ 1,800',
    bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
  }
];

// Proyectos de la Galería: Los proyectos ficticios han sido eliminados por completo.
// Ahora se cargan únicamente los proyectos reales que subas desde el panel de administración o desde la galería.
export const GALLERY_PROJECTS: GalleryProject[] = [];


export const SDO_ESTE_SECTORS = [
  'Santo Domingo Este Y Más',
  'Alma Rosa I & II',
  'Ensanche Ozama',
  'San Isidro / Autopista',
  'Lucerna',
  'Prado Oriental',
  'Corales del Sur',
  'Invivienda',
  'Otro sector'
];

export const WHY_CHOOSE_US_POINTS = [
  {
    icon: 'DollarSign',
    title: 'Cotizaciones 100% Transparentes',
    description: 'Sin sorpresas al final de la obra. Te entregamos un desglose claro de materiales y mano de obra antes de colocar el primer tornillo.'
  },
  {
    icon: 'Sparkles',
    title: 'Compromiso de Trabajo Limpio',
    description: 'Tratamos tu casa como si fuera la nuestra. Cubrimos tus pisos, protegemos los muebles y recogemos todo residuo al terminar.'
  },
  {
    icon: 'Award',
    title: 'Garantía por Escrito',
    description: 'Todas nuestras instalaciones eléctricas y de paneles PVC cuentan con garantía técnica de respaldo y soporte post-instalación.'
  },
  {
    icon: 'ShieldCheck',
    title: 'Técnicos Calificados y Confiables',
    description: 'Personal debidamente identificado, puntual y con amplia experiencia en proyectos residenciales en todo Santo Domingo Este.'
  }
];

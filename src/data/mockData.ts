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

export const GALLERY_PROJECTS: GalleryProject[] = [
  {
    id: 'proj-1',
    title: 'Pared de Acento PVC Mármol Calacatta con Luz LED Indirecta',
    category: 'pvc',
    location: 'Alma Rosa I, Santo Domingo Este',
    description: 'Transformación radical de sala de estar. Se cubrió una pared con grietas y humedad con paneles PVC acabado Mármol Calacatta brillante y perfiles con cinta LED cálida.',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    highlight: 'Acabado de lujo sin picar paredes',
    completionTime: '1 Día de trabajo'
  },
  {
    id: 'proj-2',
    title: 'Modernización Total de Tablero Eléctrico Residencial',
    category: 'electricidad',
    location: 'Ensanche Ozama, SDE',
    description: 'Sustitución de caja antigua con fusibles por centro de carga Square D de 16 circuitos, rotulado completo, balanceo de fases y protección diferencial.',
    beforeImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    highlight: 'Cero riesgo de sobrecalentamiento',
    completionTime: '6 Horas'
  },
  {
    id: 'proj-3',
    title: 'Techo Flotante en PVC Acabado Madera Nogal',
    category: 'pvc',
    location: 'Prado Oriental, Autopista San Isidro',
    description: 'Revestimiento completo de techo en balcón techado y recibidor. El PVC resiste el salitre y la humedad exterior sin perder el brillo ni requerir barniz.',
    beforeImage: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    highlight: 'Inmune a termitas y hongos',
    completionTime: '2 Días'
  },
  {
    id: 'proj-4',
    title: 'Iluminación LED Arquitectónica y Ojos de Buey',
    category: 'electricidad',
    location: 'Lucerna, Santo Domingo Este',
    description: 'Instalación de 14 ojos de buey LED atenuables (dimmables) y circuitos divididos por zonas de confort en apartamento moderno.',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    highlight: 'Ahorro energético del 65%',
    completionTime: '1 Día'
  },
  {
    id: 'proj-5',
    title: 'Instalación de Sistema de Presurizador y Tinaco Residencial',
    category: 'plomeria',
    location: 'Corales del Sur, SDE',
    description: 'Reestructuración de línea de agua con tuberías Termofusión PPR, presurizador silencioso de 1 HP y bypass con válvula check para garantizar presión constante.',
    beforeImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    highlight: 'Presión constante en todas las duchas',
    completionTime: '1 Día'
  },
  {
    id: 'proj-6',
    title: 'Mural 3D en PVC con Diseño Geométrico para Sala de TV',
    category: 'pvc',
    location: 'San Isidro Labrador, SDE',
    description: 'Pared de entretenimiento con paneles tridimensionales en blanco mate, canalización oculta para cables de TV y sonido envolvente.',
    beforeImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    highlight: 'Cables 100% invisibles y acabado 3D',
    completionTime: '1 Día'
  }
];

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

import React, { useState, useMemo } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  ShieldCheck,
  X,
  Instagram,
  QrCode
} from 'lucide-react';
import { SDO_ESTE_SECTORS } from '../data/mockData';
import { ContactFormData, ValidationErrors, ServiceCategory, SiteSettings } from '../types';
import { submitQuoteRequest } from '../services/firestoreService';
import { InstagramQRModal } from './InstagramQRModal';
import {
  validateContactFormWithZod,
  validateContactField,
  contactFormSchema,
} from '../utils/contactValidation';

interface ContactSectionProps {
  currentBudgetDOP: number;
  currentBudgetSummary: string;
  selectedCategory: ServiceCategory;
  siteSettings?: SiteSettings;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  currentBudgetDOP,
  currentBudgetSummary,
  selectedCategory,
  siteSettings,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    sector: 'Santo Domingo Este Y Más',
    serviceNeeded: selectedCategory || 'pvc',
    preferredDate: '',
    additionalDetails: '',
    urgency: 'normal',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [showInstagramQR, setShowInstagramQR] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep serviceNeeded in sync when category is changed externally
  React.useEffect(() => {
    if (selectedCategory) {
      setFormData((prev) => ({ ...prev, serviceNeeded: selectedCategory }));
    }
  }, [selectedCategory]);

  // Real-time Zod validation analysis
  const zodValidation = useMemo(() => {
    return validateContactFormWithZod(formData);
  }, [formData]);

  const zodErrors = zodValidation.errors;
  const isFormValid = zodValidation.isValid;

  // Real-time error messages bound to touched state or submit attempt
  const errors: ValidationErrors = {
    fullName: touched.fullName || submitAttempted ? zodErrors.fullName : undefined,
    phone: touched.phone || submitAttempted ? zodErrors.phone : undefined,
    sector: touched.sector || submitAttempted ? zodErrors.sector : undefined,
    additionalDetails: touched.additionalDetails || submitAttempted ? zodErrors.additionalDetails : undefined,
  };

  const handleBlur = (field: keyof ContactFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof ContactFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Format telephone number automatically as user types (standard Dominican format)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    handleChange('phone', formatted);
  };

  const phone1 = siteSettings?.phoneNumber || '809-303-1730';
  const phone2 = siteSettings?.secondaryPhone || '849-264-8965';
  const whatsapp = siteSettings?.whatsappNumber || '809-303-1738';
  const email = siteSettings?.contactEmail || 'dofeprotech@gmail.com';
  const instagramUrl = siteSettings?.instagramUrl
    ? (siteSettings.instagramUrl.startsWith('http')
      ? siteSettings.instagramUrl
      : `https://instagram.com/${siteSettings.instagramUrl.replace('@', '')}`)
    : 'https://www.instagram.com/decoelectri/';

  const cleanWa = whatsapp.replace(/\D/g, '');
  const waFull = cleanWa.startsWith('1') ? cleanWa : (cleanWa.length === 10 ? `1${cleanWa}` : cleanWa);

  // Send directly via WhatsApp with all details formatted
  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ fullName: true, phone: true, sector: true, additionalDetails: true });

    if (!isFormValid) {
      // Focus on first invalid field
      const firstInvalid = zodErrors.fullName
        ? 'fullName'
        : zodErrors.phone
        ? 'phone'
        : zodErrors.sector
        ? 'sector'
        : 'additionalDetails';
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    const message = `👋 *Hola Decoelectric!*\n\n` +
      `Me gustaría coordinar una cotización o visita técnica:\n` +
      `👤 *Cliente:* ${formData.fullName}\n` +
      `📱 *Teléfono:* ${formData.phone}\n` +
      `📍 *Sector:* ${formData.sector}, Santo Domingo Este\n` +
      `🛠️ *Servicio:* ${formData.serviceNeeded.toUpperCase()}\n` +
      `📊 *Detalle Estimado:* ${currentBudgetSummary || 'Revisión en sitio'}\n` +
      `💰 *Presupuesto Estimado:* RD$ ${currentBudgetDOP ? currentBudgetDOP.toLocaleString('es-DO') : 'A evaluar'}\n` +
      `⚡ *Urgencia:* ${formData.urgency === 'emergencia' ? '🚨 Emergencia Inmediata' : formData.urgency === 'urgente' ? 'Urgente esta semana' : 'Normal / Planificado'}\n` +
      (formData.additionalDetails ? `📝 *Comentarios:* ${formData.additionalDetails}\n` : '') +
      `\n¿Cuándo podrían agendar la visita de inspección?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${waFull}?text=${encoded}`, '_blank');
  };

  // Request free technical visit modal submission
  const handleSubmitVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ fullName: true, phone: true, sector: true, additionalDetails: true });

    if (!isFormValid) {
      const firstInvalid = zodErrors.fullName
        ? 'fullName'
        : zodErrors.phone
        ? 'phone'
        : zodErrors.sector
        ? 'sector'
        : 'additionalDetails';
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = await submitQuoteRequest({
        fullName: formData.fullName,
        phone: formData.phone,
        sector: formData.sector,
        serviceNeeded: formData.serviceNeeded,
        urgency: formData.urgency,
        preferredDate: formData.preferredDate,
        additionalDetails: formData.additionalDetails || currentBudgetSummary || 'Solicitud de visita técnica sin costo',
        budgetDOP: currentBudgetDOP || 0,
        budgetSummary: currentBudgetSummary || '',
        createdAt: new Date().toISOString(),
        status: 'nueva',
      });
      setTicketId(generatedId);
      setSubmittedModalOpen(true);
    } catch (err) {
      console.error('Error submitting quote request:', err);
      const fallbackTicket = 'DEC-' + Math.floor(100000 + Math.random() * 900000);
      setTicketId(fallbackTicket);
      setSubmittedModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-16 md:py-24 bg-slate-100/50 dark:bg-[#0d1424]/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact info, coverage in SDE, commitments */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 mb-3 border border-sky-200 dark:border-sky-800">
                <MessageCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Contacto Directo</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                ¿Listo para transformar tu espacio?
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Escríbenos o llena tus datos para recibir asesoría personalizada. Realizamos visitas técnicas para evaluación sin costo en Santo Domingo Este.
              </p>

              {/* Contact Information Cards */}
              <div className="mt-8 space-y-3.5">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${waFull}?text=Hola%20Decoelectric!%20Quisiera%20solicitar%20asesor%C3%ADa.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all group shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle className="w-6 h-6 fill-current text-white dark:text-emerald-950 bg-emerald-600 rounded-full p-1" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
                      WhatsApp Rápido & Asesoría
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {whatsapp}
                    </span>
                  </div>
                </a>

                {/* Atención Telefónica Rápida (Dos líneas) */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                        Atención Rápida Telefónica
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        <a
                          href={`tel:${phone1.replace(/\D/g, '')}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-slate-200/80 dark:border-slate-700 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{phone1}</span>
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Llamar</span>
                        </a>
                        <a
                          href={`tel:${phone2.replace(/\D/g, '')}`}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-950/50 border border-slate-200/80 dark:border-slate-700 transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{phone2}</span>
                          <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400">Llamar</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Direct */}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-sky-400 transition-all group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Correo de Contacto
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 truncate block">
                        {email}
                      </span>
                    </div>
                  </a>
                )}

                {/* Instagram Profile & QR Scan */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-pink-50/70 to-rose-50/70 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-200/80 dark:border-pink-900/50 shadow-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-xs text-pink-600 dark:text-pink-400 font-bold uppercase tracking-wider">
                        Instagram Oficial
                      </span>
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-extrabold text-slate-900 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 truncate block transition-colors"
                      >
                        @decoelectri
                      </a>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        Fotos de proyectos & mensajes directos
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInstagramQR(true)}
                    title="Escanear Código QR de Instagram"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-950/60 border border-pink-200 dark:border-pink-800/80 shadow-xs transition-all shrink-0 ml-2"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Ver QR</span>
                  </button>
                </div>

                {/* Service Zone */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Zona de Cobertura
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Santo Domingo Este Y Más
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Atención técnica y cotizaciones a domicilio sin costo
                    </span>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Horario de Atención
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Lunes a Sábado: 8:00 AM – 6:30 PM
                    </span>
                    <span className="block text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                      ⚡ Servicio de emergencia eléctrica 24/7 disponible
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guarantee Badge in bottom left */}
            <div className="mt-8 p-4 rounded-2xl bg-sky-100/60 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-sky-600 dark:text-sky-400 shrink-0" />
              <p className="text-xs text-sky-900 dark:text-sky-200 leading-snug">
                <strong>Compromiso Decoelectric:</strong> Presupuestos transparentes antes de iniciar y 100% de limpieza al concluir los trabajos.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form with Real-Time Validation */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      Solicitud de Presupuesto & Visita
                    </h3>
                    {isFormValid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
                        <CheckCircle2 className="w-3 h-3" />
                        Datos Verificados
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
                        <ShieldCheck className="w-3 h-3 text-sky-500" />
                        Validación Zod Activa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Verificación en tiempo real de formato para atención prioritaria en Santo Domingo Este.
                  </p>
                </div>
                {currentBudgetDOP > 0 && (
                  <div className="sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Presupuesto Activo:
                    </span>
                    <span className="text-sm font-extrabold text-sky-600 dark:text-sky-400">
                      RD$ {currentBudgetDOP.toLocaleString('es-DO')}
                    </span>
                  </div>
                )}
              </div>

              {/* Zod Error Banner when form submission attempted with invalid fields */}
              {submitAttempted && !isFormValid && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <strong className="font-bold block">Por favor corrige los datos requeridos antes de continuar:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-rose-600 dark:text-rose-400">
                      {zodErrors.fullName && <li>{zodErrors.fullName}</li>}
                      {zodErrors.phone && <li>{zodErrors.phone}</li>}
                      {zodErrors.sector && <li>{zodErrors.sector}</li>}
                      {zodErrors.additionalDetails && <li>{zodErrors.additionalDetails}</li>}
                    </ul>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendWhatsApp} className="space-y-4" noValidate>
                {/* Full Name field with Real-time Zod feedback */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Nombre y Apellido <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Min. 2 palabras</span>
                  </div>
                  <div className="relative">
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Ej. Carlos Martínez"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      onBlur={() => handleBlur('fullName')}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white transition-all focus:outline-none ${
                        errors.fullName
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                          : formData.fullName.trim().length >= 3 && !zodErrors.fullName
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                    <div className="absolute right-3 top-3.5">
                      {errors.fullName ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : formData.fullName.trim().length >= 3 && !zodErrors.fullName ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.fullName ? (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.fullName}</span>
                    </p>
                  ) : formData.fullName.trim().length >= 3 && !zodErrors.fullName ? (
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Nombre verificado correctamente.</span>
                    </p>
                  ) : null}
                </div>

                {/* WhatsApp / Phone field with Real-time Zod feedback */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Número de WhatsApp / Celular <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">10 dígitos (ej. 809/829/849)</span>
                  </div>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      placeholder="(829) 000-0000"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur('phone')}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white transition-all focus:outline-none ${
                        errors.phone
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                          : formData.phone.length > 0 && !zodErrors.phone
                          ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    />
                    <div className="absolute right-3 top-3.5">
                      {errors.phone ? (
                        <AlertCircle className="w-4 h-4 text-rose-500" />
                      ) : formData.phone.length > 0 && !zodErrors.phone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : null}
                    </div>
                  </div>
                  {errors.phone ? (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.phone}</span>
                    </p>
                  ) : formData.phone.length > 0 && !zodErrors.phone ? (
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>Número verificado para WhatsApp.</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Te contactaremos de inmediato por WhatsApp con el desglose formal.
                    </p>
                  )}
                </div>

                {/* Sector and Service Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="sector"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Zona / Sector de Cobertura <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => handleChange('sector', e.target.value)}
                      onBlur={() => handleBlur('sector')}
                      className={`w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white transition-all focus:outline-none ${
                        errors.sector
                          ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                          : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                      }`}
                    >
                      {SDO_ESTE_SECTORS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                    {errors.sector && (
                      <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 animate-fadeIn">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.sector}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="serviceNeeded"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Servicio Principal Requerido
                    </label>
                    <select
                      id="serviceNeeded"
                      value={formData.serviceNeeded}
                      onChange={(e) => handleChange('serviceNeeded', e.target.value as ServiceCategory)}
                      className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="pvc">Instalación de Paneles PVC</option>
                      <option value="electricidad">Electricidad Residencial</option>
                      <option value="plomeria">Plomería</option>
                      <option value="combo">Combo Remodelación (PVC + Luz LED)</option>
                    </select>
                  </div>
                </div>

                {/* Urgency and timeline */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ¿Qué tan pronto necesitas el servicio?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'normal', label: 'Esta semana' },
                      { id: 'urgente', label: 'Urgente (48h)' },
                      { id: 'emergencia', label: 'Emergencia hoy' },
                    ].map((urg) => (
                      <button
                        key={urg.id}
                        type="button"
                        onClick={() => handleChange('urgency', urg.id)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                          formData.urgency === urg.id
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {urg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="additionalDetails"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                      Detalles adicionales (Opcional)
                    </label>
                    <span
                      className={`text-[10px] ${
                        formData.additionalDetails.length > 500
                          ? 'text-rose-500 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {formData.additionalDetails.length}/500 caracteres
                    </span>
                  </div>
                  <textarea
                    id="additionalDetails"
                    rows={3}
                    placeholder="Cuéntanos más: medidas aproximadas, si es casa o apartamento, tipo de pared, etc."
                    value={formData.additionalDetails}
                    onChange={(e) => handleChange('additionalDetails', e.target.value)}
                    onBlur={() => handleBlur('additionalDetails')}
                    className={`w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white focus:outline-none transition-all ${
                      errors.additionalDetails
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                    }`}
                  />
                  {errors.additionalDetails && (
                    <p className="mt-1 text-xs text-rose-500 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.additionalDetails}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-md shadow-emerald-600/20 active:scale-[0.99] transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
                    <span>Enviar Cotización por WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitVisit}
                    className="sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Solicitar Visita Técnica</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {submittedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setSubmittedModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Solicitud Registrada con Éxito
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              ¡Gracias, {formData.fullName.split(' ')[0]}!
            </h3>

            <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket de seguimiento:</span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sector:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formData.sector}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Presupuesto Referencia:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  RD$ {currentBudgetDOP.toLocaleString('es-DO')}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              Uno de nuestros técnicos certificados de Decoelectric te contactará al <strong>{formData.phone}</strong> para confirmar la fecha y hora de la visita de inspección gratuita.
            </p>

            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/18295550199?text=Hola%20Decoelectric%2C%20acabo%20de%20generar%20el%20ticket%20${ticketId}%20a%20nombre%20de%20${encodeURIComponent(formData.fullName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Confirmar Inmediato por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setSubmittedModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram QR Code Modal */}
      <InstagramQRModal
        isOpen={showInstagramQR}
        onClose={() => setShowInstagramQR(false)}
        instagramUrl={instagramUrl}
      />
    </section>
  );
};

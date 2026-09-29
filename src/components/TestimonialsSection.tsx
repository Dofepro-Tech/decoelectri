import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquareQuote,
  Plus,
  CheckCircle2,
  MapPin,
  Calendar,
  Trash2,
  ShieldCheck,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Testimonial } from '../types';
import {
  subscribeToTestimonials,
  addTestimonial,
  deleteTestimonial
} from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

interface TestimonialsSectionProps {
  onOpenQuote?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onOpenQuote }) => {
  const { isAdmin, user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    serviceCategory: 'pvc',
    rating: 5,
    comment: '',
    agreedRealReview: true,
  });
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Subscribe to real-time testimonials
  useEffect(() => {
    const unsubscribe = subscribeToTestimonials((data) => {
      setTestimonials(data || []);
    });

    const handleUpdate = () => {
      const stored = localStorage.getItem('decoelectric-real-testimonials');
      if (stored) {
        try {
          setTestimonials(JSON.parse(stored));
        } catch {}
      }
    };
    window.addEventListener('decoelectric-testimonials-updated', handleUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('decoelectric-testimonials-updated', handleUpdate);
    };
  }, []);

  const handleOpenForm = () => {
    setFormData({
      name: user?.displayName || '',
      sector: '',
      serviceCategory: 'pvc',
      rating: 5,
      comment: '',
      agreedRealReview: true,
    });
    setErrorMessage('');
    setSubmitSuccess(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Por favor escribe tu nombre o el de tu negocio/familia.');
      return;
    }

    if (!formData.comment.trim() || formData.comment.trim().length < 10) {
      setErrorMessage('Por favor déjanos un comentario de al menos 10 caracteres con tu experiencia.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTestimonial({
        name: formData.name.trim(),
        sector: formData.sector.trim() || 'Santo Domingo Este',
        serviceCategory: formData.serviceCategory,
        rating: Number(formData.rating),
        comment: formData.comment.trim(),
        verified: true,
        userId: user?.uid,
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
      }, 1600);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Ocurrió un error al publicar tu opinión. Por favor intenta de nuevo.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este testimonio?')) {
      await deleteTestimonial(id);
    }
  };

  // Metrics calculation
  const totalReviews = testimonials.length;
  const averageRating =
    totalReviews > 0
      ? (testimonials.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  const filteredTestimonials = testimonials.filter((t) => {
    if (filterRating === 'all') return true;
    return t.rating === filterRating;
  });

  const getRatingFeedback = (val: number) => {
    switch (val) {
      case 5:
        return '¡Excelente servicio! (5★)';
      case 4:
        return 'Muy bueno y profesional (4★)';
      case 3:
        return 'Buen servicio (3★)';
      case 2:
        return 'Regular (2★)';
      case 1:
        return 'Necesita mejorar (1★)';
      default:
        return `${val} Estrellas`;
    }
  };

  const getServiceLabel = (code?: string) => {
    switch (code) {
      case 'pvc':
        return 'Paneles PVC / Techos';
      case 'electricidad':
        return 'Electricidad Residencial';
      case 'plomeria':
        return 'Plomería';
      case 'iluminacion':
        return 'Iluminación LED & Domótica';
      case 'mantenimiento':
        return 'Mantenimiento General';
      default:
        return 'Servicio Profesional';
    }
  };

  return (
    <section
      id="testimonios"
      className="py-16 md:py-24 bg-slate-50/70 dark:bg-[#080c14] border-t border-slate-200 dark:border-slate-800/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 mb-3 border border-amber-200 dark:border-amber-800">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Experiencias Reales</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Compromiso y transparencia total. Cada valoración aquí es redactada y enviada directamente por personas y familias de Santo Domingo Este que han recibido nuestros servicios.
            </p>
          </div>

          {/* Action to add review */}
          <div className="flex items-center gap-3">
            <button
              id="add-testimonial-btn"
              type="button"
              onClick={handleOpenForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Compartir Mi Opinión</span>
            </button>
          </div>
        </div>

        {/* Rating Metrics & Filters Bar (if testimonials exist) */}
        {totalReviews > 0 && (
          <div className="mb-10 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{averageRating}</span>
                <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  Basado en {totalReviews} {totalReviews === 1 ? 'opinión real' : 'opiniones reales'}
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400 mr-1 font-medium">Filtrar:</span>
              <button
                type="button"
                onClick={() => setFilterRating('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterRating === 'all'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todas ({totalReviews})
              </button>
              {[5, 4, 3].map((stars) => {
                const count = testimonials.filter((t) => t.rating === stars).length;
                if (count === 0 && filterRating !== stars) return null;
                return (
                  <button
                    key={stars}
                    type="button"
                    onClick={() => setFilterRating(stars)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      filterRating === stars
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-current" />
                    <span className="opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State when there are no fictitious reviews */}
        {totalReviews === 0 ? (
          <div
            id="testimonials-empty-state"
            className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center mx-auto mb-4 text-sky-600 dark:text-sky-400">
              <MessageSquareQuote className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Aún no hay opiniones publicadas
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
              Decoelectric promueve la transparencia total y <strong>no incluye testimonios ficticios</strong>. Si has contratado nuestros servicios de electricidad o paneles de PVC, ¡sé la primera persona en compartir tu experiencia!
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleOpenForm}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Escribir la primera opinión</span>
              </button>
              {onOpenQuote && (
                <button
                  type="button"
                  onClick={onOpenQuote}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold transition-colors"
                >
                  <span>Solicitar una Cotización</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTestimonials.map((item) => (
              <div
                key={item.id}
                id={`testimonial-card-${item.id}`}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top: Avatar, Name, Sector & Stars */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.verified && (
                            <span
                              title="Cliente con servicio verificado"
                              className="inline-flex items-center text-sky-600 dark:text-sky-400"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 fill-sky-100 dark:fill-sky-950" />
                            </span>
                          )}
                        </h4>
                        {item.sector && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.sector}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Eliminar testimonio (Admin)"
                        aria-label="Eliminar testimonio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Stars Rating */}
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= item.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-800'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1.5">
                      {item.rating}.0
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                    "{item.comment}"
                  </p>
                </div>

                {/* Footer: Service Tag & Date */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {getServiceLabel(item.serviceCategory)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.createdAt).toLocaleDateString('es-DO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal to Add Real Testimonial */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            id="testimonial-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsModalOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Deja tu Opinión Real
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-5">
                Tu opinión ayuda a otros vecinos y negocios de Santo Domingo Este a elegir servicios seguros y de calidad.
              </p>

              {submitSuccess ? (
                <div className="py-10 text-center space-y-3 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    ¡Gracias por tu testimonio!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                    Tu opinión ha sido registrada y publicada en la plataforma con total transparencia.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Interactive Star Rating */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Calificación General *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = star <= (hoverRating ?? formData.rating);
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({ ...formData, rating: star })}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform focus:outline-none"
                              aria-label={`Calificar con ${star} estrellas`}
                            >
                              <Star
                                className={`w-7 h-7 transition-colors ${
                                  isFilled
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-2">
                        {getRatingFeedback(hoverRating ?? formData.rating)}
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label
                      htmlFor="testimonial-name"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                    >
                      Tu Nombre o Negocio *
                    </label>
                    <input
                      id="testimonial-name"
                      type="text"
                      required
                      placeholder="Ej. Ing. Marcos Peña, o Res. Las Américas"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>

                  {/* Sector & Service Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="testimonial-sector"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                      >
                        Sector / Zona
                      </label>
                      <input
                        id="testimonial-sector"
                        type="text"
                        placeholder="Ej. Alma Rosa, Invivienda, San Isidro"
                        value={formData.sector}
                        onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="testimonial-service"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
                      >
                        Servicio Recibido
                      </label>
                      <select
                        id="testimonial-service"
                        value={formData.serviceCategory}
                        onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="pvc">Paneles PVC / Techos</option>
                        <option value="electricidad">Electricidad Residencial</option>
                        <option value="iluminacion">Iluminación LED & Domótica</option>
                        <option value="plomeria">Plomería</option>
                        <option value="mantenimiento">Mantenimiento General</option>
                        <option value="otro">Otro Servicio</option>
                      </select>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label
                        htmlFor="testimonial-comment"
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        Tu Opinión / Comentario *
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {formData.comment.length}/600
                      </span>
                    </div>
                    <textarea
                      id="testimonial-comment"
                      required
                      rows={3}
                      maxLength={600}
                      placeholder="Cuéntanos cómo fue el trabajo, la puntualidad y el resultado de la instalación..."
                      value={formData.comment}
                      onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={formData.agreedRealReview}
                      onChange={(e) => setFormData({ ...formData, agreedRealReview: e.target.checked })}
                      className="mt-0.5 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Confirmo que esta es una opinión real y sincera sobre un servicio o asesoría recibida de Decoelectric.
                    </span>
                  </label>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      id="submit-testimonial-btn"
                      type="submit"
                      disabled={isSubmitting || !formData.agreedRealReview}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-sky-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Publicando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Publicar Mi Opinión</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

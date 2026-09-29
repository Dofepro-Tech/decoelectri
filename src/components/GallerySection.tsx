import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Clock,
  Eye,
  Layers,
  Zap,
  Wrench,
  X,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  ShieldCheck,
  Heart,
  FileText,
  Save
} from 'lucide-react';
import { GalleryProject, ServiceCategory, Favorite, Note } from '../types';
import { GALLERY_PROJECTS } from '../data/mockData';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { useAuth } from '../context/AuthContext';
import {
  toggleFavorite,
  subscribeToFavorites,
  subscribeToNotes,
  saveNote,
  deleteNote
} from '../services/firestoreService';

interface GallerySectionProps {
  projects?: GalleryProject[];
  onOpenNewProject?: () => void;
  onEditProject?: (project: GalleryProject) => void;
  onDeleteProject?: (id: string, title: string) => void;
  onOpenAdmin?: () => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  projects = GALLERY_PROJECTS,
  onOpenNewProject,
  onEditProject,
  onDeleteProject,
  onOpenAdmin,
}) => {
  const { user } = useAuth();
  const { isAdmin } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  // Subscribe to user's favorites and notes
  useEffect(() => {
    const unsubFavs = subscribeToFavorites(user?.uid, (data) => {
      setFavorites(data);
    });
    const unsubNotes = subscribeToNotes(user?.uid, (data) => {
      setNotes(data);
    });
    return () => {
      unsubFavs();
      unsubNotes();
    };
  }, [user?.uid]);

  const isFavorite = (projectId: string) => favorites.some((f) => f.targetId === projectId);

  const [activeFilter, setActiveFilter] = useState<'all' | ServiceCategory>('all');
  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);
  // Track which cards are currently showing "after" vs "before"
  const [cardModes, setCardModes] = useState<Record<string, 'after' | 'before'>>({});

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === 'all') return true;
    return project.category === activeFilter;
  });

  const toggleCardMode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCardModes((prev) => ({
      ...prev,
      [id]: prev[id] === 'before' ? 'after' : 'before',
    }));
  };

  const getCategoryBadge = (category: ServiceCategory) => {
    switch (category) {
      case 'pvc':
        return { label: 'Paneles PVC', color: 'bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300' };
      case 'electricidad':
        return { label: 'Electricidad', color: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300' };
      case 'plomeria':
        return { label: 'Plomería', color: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300' };
      default:
        return { label: 'Remodelación', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' };
    }
  };

  return (
    <section id="galeria" className="py-16 md:py-24 bg-white dark:bg-[#0a0e17] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin floating management banner */}
        {isAdmin && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-amber-800 dark:text-amber-300">
                  Control de Administrador
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Tienes permisos para subir contenido, editar imágenes y eliminar proyectos de la galería.
                </p>
              </div>
            </div>

            {onOpenNewProject && (
              <button
                type="button"
                onClick={onOpenNewProject}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Subir Contenido a la Galería</span>
              </button>
            )}
          </div>
        )}

        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-950/60 mb-3 border border-sky-200 dark:border-sky-800">
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Galería de Proyectos Reales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Nuestro Trabajo: Antes y Después
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300">
            Descubre cómo convertimos espacios desgastados o con riesgo eléctrico en áreas modernas, seguras y de alto valor estético.
          </p>
        </div>

        {/* Featured Interactive Slider Banner */}
        <div className="mb-14">
          <BeforeAfterSlider
            title="Pared de Sala con Humedad vs. Revestimiento PVC Mármol Calacatta"
            subtitle="Proyecto ejecutado en Alma Rosa I, Santo Domingo Este. Cero escombros, trabajo en 24 horas con garantía."
            beforeImage="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
            afterImage="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todos los Trabajos ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pvc')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'pvc'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Paneles PVC</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('electricidad')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'electricidad'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Electricidad Residencial</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('plomeria')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeFilter === 'plomeria'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Plomería</span>
          </button>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const mode = cardModes[project.id] || 'after';
            const currentImage = mode === 'after' ? project.afterImage : project.beforeImage;
            const badge = getCategoryBadge(project.category);

            return (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Image Box */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={currentImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm ${badge.color}`}>
                        {badge.label}
                      </span>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await toggleFavorite(user?.uid, project.id, 'project', project.title, project.afterImage);
                        }}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md flex items-center justify-center ${
                          isFavorite(project.id)
                            ? 'bg-rose-500 text-white'
                            : 'bg-black/40 text-slate-200 hover:bg-black/60 hover:text-white'
                        }`}
                        title={isFavorite(project.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Toggle Before/After button */}
                    <button
                      type="button"
                      onClick={(e) => toggleCardMode(project.id, e)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase transition-all shadow-md ${
                        mode === 'after'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                          : 'bg-rose-600 text-white hover:bg-rose-500'
                      }`}
                      title="Haz clic para alternar entre el antes y el después"
                    >
                      {mode === 'after' ? 'Mostrando: Después' : 'Mostrando: Antes'}
                    </button>
                  </div>

                  {/* Bottom overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow-lg">
                      <Eye className="w-4 h-4 text-sky-600" />
                      Ver Detalles Completos
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-sky-500" />
                      <span>{project.location}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {project.title}
                    </h3>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Highlights and execution time */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    <span className="text-sky-600 dark:text-sky-400 font-semibold truncate max-w-[170px]">
                      ★ {project.highlight}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {project.completionTime}
                    </span>
                  </div>

                  {/* Admin Quick Action Bar */}
                  {isAdmin && (
                    <div
                      className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 -mx-5 -mb-5 px-5 py-2.5 flex items-center justify-between"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Administrador
                      </span>

                      <div className="flex items-center gap-1.5">
                        {onEditProject && (
                          <button
                            type="button"
                            onClick={() => onEditProject(project)}
                            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-sky-600 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                            title="Editar este proyecto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteProject && (
                          <button
                            type="button"
                            onClick={() => onDeleteProject(project.id, project.title)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
                            title="Eliminar este proyecto de la galería"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Project Detail */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedProject.location}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Tiempo: {selectedProject.completionTime}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 mb-2 pr-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedProject.title}
                </h3>
                <button
                  type="button"
                  onClick={async () => {
                    await toggleFavorite(user?.uid, selectedProject.id, 'project', selectedProject.title, selectedProject.afterImage);
                  }}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-center gap-1.5 text-xs font-bold shrink-0 ${
                    isFavorite(selectedProject.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                  }`}
                  title={isFavorite(selectedProject.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`w-4 h-4 ${isFavorite(selectedProject.id) ? 'fill-current' : ''}`} />
                  <span>{isFavorite(selectedProject.id) ? 'Favorito' : 'Guardar'}</span>
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                {selectedProject.description}
              </p>

              {/* Both images side by side in modal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="block text-xs font-bold text-rose-500 mb-1.5 uppercase">
                    Condición Antes de la Obra:
                  </span>
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-800">
                    <img
                      src={selectedProject.beforeImage}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-bold text-emerald-500 mb-1.5 uppercase">
                    Resultado Final Decoelectric:
                  </span>
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-slate-800">
                    <img
                      src={selectedProject.afterImage}
                      alt="Después"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-sky-50 dark:bg-sky-950/40 p-4 rounded-2xl border border-sky-200 dark:border-sky-800 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-900 dark:text-sky-200">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{selectedProject.highlight}</span>
                </div>
                <a
                  href={`https://wa.me/18295550199?text=Hola%20Decoelectric%2C%20vi%20el%20proyecto%20de%20%22${encodeURIComponent(
                    selectedProject.title
                  )}%22%20y%20quisiera%20cotizar%20algo%20similar.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-sm"
                >
                  Cotizar Proyecto Similar
                </a>
              </div>

              {/* Personal Notes Section */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-sky-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Mis Notas Personales sobre este Proyecto
                  </h4>
                </div>

                {/* Notes List */}
                {notes.filter((n) => n.targetId === selectedProject.id).length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-4">
                    No has agregado notas sobre este proyecto aún. Úsalo para recordar detalles, ideas de color o cotizaciones.
                  </p>
                ) : (
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-1">
                    {notes
                      .filter((n) => n.targetId === selectedProject.id)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-sky-600 dark:text-sky-400">
                              {note.title || 'Nota'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setNoteContent(note.content);
                                }}
                                className="text-slate-400 hover:text-sky-500 transition-colors px-1"
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await deleteNote(user?.uid, note.id);
                                  if (editingNoteId === note.id) {
                                    setEditingNoteId(null);
                                    setNoteContent('');
                                  }
                                }}
                                className="text-slate-400 hover:text-rose-500 transition-colors px-1"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans">
                            {note.content}
                          </p>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 block font-mono">
                            {new Date(note.createdAt).toLocaleDateString('es-DO')}
                          </span>
                        </div>
                      ))}
                  </div>
                )}

                {/* Write/Edit Note Area */}
                <div className="space-y-2.5">
                  <textarea
                    rows={2}
                    placeholder="Escribe una nota personal (ej: 'Me gustaría este revestimiento para el techo de la terraza...')"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all placeholder:text-slate-400"
                  />
                  <div className="flex justify-end gap-2">
                    {editingNoteId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(null);
                          setNoteContent('');
                        }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={!noteContent.trim()}
                      onClick={async () => {
                        if (!noteContent.trim()) return;
                        await saveNote(
                          user?.uid,
                          noteContent.trim(),
                          selectedProject.id,
                          'project',
                          editingNoteId ? undefined : 'Idea de Proyecto',
                          editingNoteId || undefined
                        );
                        setNoteContent('');
                        setEditingNoteId(null);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingNoteId ? 'Guardar Cambios' : 'Agregar Nota'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

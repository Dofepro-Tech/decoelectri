import React, { useState, useEffect } from 'react';
import {
  Heart,
  FileText,
  X,
  Trash2,
  Edit2,
  Plus,
  Save,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Favorite, Note } from '../types';
import {
  subscribeToFavorites,
  subscribeToNotes,
  saveNote,
  deleteNote,
  toggleFavorite
} from '../services/firestoreService';
import { motion, AnimatePresence } from 'motion/react';

interface FavoritesNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewProject?: (projectId: string) => void;
}

export const FavoritesNotesModal: React.FC<FavoritesNotesModalProps> = ({
  isOpen,
  onClose,
  onViewProject
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'favorites' | 'notes'>('favorites');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteTargetType, setNoteTargetType] = useState<'project' | 'service' | 'general'>('general');

  // Load favorites & notes in real-time
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, user?.uid]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    await saveNote(
      user?.uid,
      noteContent.trim(),
      undefined,
      noteTargetType,
      noteTitle.trim() || 'Nota Personal',
      editingNoteId || undefined
    );

    setNoteContent('');
    setNoteTitle('');
    setNoteTargetType('general');
    setEditingNoteId(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title || '');
    setNoteContent(note.content);
    setNoteTargetType(note.targetType);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTargetType('general');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0b1322] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Tu Espacio Personal</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Favoritos y Notas Guardadas
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Administra tus inspiraciones de diseño, ideas y anotaciones técnicas para tu próximo proyecto.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'favorites'
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
            <span>Mis Favoritos ({favorites.length})</span>
            {activeTab === 'favorites' && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === 'notes'
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Mis Notas ({notes.length})</span>
            {activeTab === 'notes' && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
              />
            )}
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 min-h-[300px]">
          {activeTab === 'favorites' ? (
            favorites.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-3">
                <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <Heart className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No tienes favoritos aún</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Explora nuestra galería de proyectos reales y toca el corazón para guardar tus revestimientos e instalaciones favoritas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex gap-3 group hover:shadow-md transition-all duration-300"
                  >
                    {fav.image && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={fav.image}
                          alt={fav.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {fav.targetType === 'project' ? 'Galería' : 'Servicio'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {fav.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                        {fav.targetType === 'project' && onViewProject ? (
                          <button
                            type="button"
                            onClick={() => {
                              onViewProject(fav.targetId);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline"
                          >
                            <span>Ver Detalles</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Decoelectric</span>
                        )}

                        <button
                          type="button"
                          onClick={async () => {
                            await toggleFavorite(user?.uid, fav.targetId, fav.targetType, fav.title);
                          }}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-600"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-6">
              {/* Note Creator Form */}
              <form
                onSubmit={handleSaveNote}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {editingNoteId ? 'Editar Nota' : 'Escribir una Nueva Nota'}
                  </span>
                  {!editingNoteId && (
                    <select
                      value={noteTargetType}
                      onChange={(e) => setNoteTargetType(e.target.value as any)}
                      className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="general">Nota General</option>
                      <option value="project">Idea de Proyecto</option>
                      <option value="service">Anotación de Servicio</option>
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Título (ej: Requisitos de cocina)"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <textarea
                    rows={3}
                    placeholder="Escribe aquí tu nota personal o requerimientos..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  {editingNoteId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!noteContent.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {editingNoteId ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{editingNoteId ? 'Guardar Nota' : 'Crear Nota'}</span>
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Historial de Notas ({notes.length})
                </span>

                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-8">
                    No has creado notas generales aún.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 text-xs flex flex-col justify-between hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                              {note.title}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase">
                              {note.targetType === 'general' ? 'General' : note.targetType === 'project' ? 'Proyecto' : 'Servicio'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditNote(note)}
                              className="text-slate-400 hover:text-sky-500 transition-colors p-1"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteNote(user?.uid, note.id);
                                if (editingNoteId === note.id) {
                                  handleCancelEdit();
                                }
                              }}
                              className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans text-xs">
                          {note.content}
                        </p>

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[9px] text-slate-400">
                          <span>Decoelectric Personal Space</span>
                          <span>{new Date(note.createdAt).toLocaleDateString('es-DO')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase">
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>Sincronizado en Tiempo Real</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 hover:dark:bg-slate-700 transition"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Image as ImageIcon,
  Layers,
  Settings,
  MessageSquare,
  Users,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  RefreshCw,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Key,
  Lock,
  Eye,
  EyeOff,
  Compass,
  Target,
  Award,
  FileText,
  Mail,
  Instagram,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { GalleryProject, ServiceItem, SiteSettings, QuoteRequest, UserProfile, ServiceCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  createGalleryProject,
  updateGalleryProject,
  deleteGalleryProject,
  clearAllGalleryProjects,
  restoreDemoGalleryProjects,
  isDemoGalleryCleared,
  updateService,
  createService,
  deleteService,
  updateSiteSettings,
  subscribeToQuoteRequests,
  updateQuoteStatus,
  deleteQuoteRequest,
  clearAllLocalQuotes,
  subscribeToUsers,
  updateUserRole,
} from '../services/firestoreService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  galleryProjects: GalleryProject[];
  services: ServiceItem[];
  siteSettings: SiteSettings;
  onRefreshData?: () => void;
}

type AdminTab = 'cotizaciones' | 'galeria' | 'servicios' | 'configuraciones' | 'areas' | 'usuarios';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  galleryProjects,
  services,
  siteSettings,
  onRefreshData,
}) => {
  const { user, loginWithGoogle, getAdminPassword, changeAdminPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('galeria');

  // Quotes & Users state from Firestore
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  // Feedback notifications
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Password Management state
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [currentAdminPass, setCurrentAdminPass] = useState('admin123');

  // Values item input state
  const [newValueInput, setNewValueInput] = useState('');

  // Gallery Editing state
  const [editingProject, setEditingProject] = useState<GalleryProject | null>(null);
  const [isNewProjectModal, setIsNewProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<Omit<GalleryProject, 'id'>>({
    title: '',
    category: 'pvc',
    location: 'Santo Domingo Este',
    description: '',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    highlight: 'Acabado garantizado',
    completionTime: '1 Día',
  });

  // Service Editing state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceItem>({
    id: '',
    category: 'pvc',
    title: '',
    subtitle: '',
    description: '',
    iconName: 'Layers',
    features: [''],
    startingPrice: 'Desde RD$ 1,200',
    bannerImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  });

  // Areas / Site Settings Form State
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    if (isOpen) {
      setCurrentAdminPass(getAdminPassword());
    }
  }, [isOpen, getAdminPassword]);

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to quote requests
    const unsubQuotes = subscribeToQuoteRequests((data) => setQuotes(data));
    // Subscribe to users
    const unsubUsers = subscribeToUsers((data) => setUsersList(data));

    return () => {
      unsubQuotes();
      unsubUsers();
    };
  }, [isOpen, user]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  const handleUpdateAdminPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminPasswordInput || adminPasswordInput.trim().length < 4) {
      showNotification('error', 'La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await changeAdminPassword(adminPasswordInput.trim());
      setCurrentAdminPass(adminPasswordInput.trim());
      setAdminPasswordInput('');
      showNotification('success', '¡Contraseña de Administrador actualizada exitosamente! Usa esta clave para tus futuros accesos.');
    } catch (err: any) {
      showNotification('error', 'Error al cambiar contraseña: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleClearDemoGallery = async () => {
    if (window.confirm('¿Seguro que deseas eliminar los trabajos de prueba? La galería quedará limpia para que agregues tus fotos reales de Santo Domingo Este.')) {
      setSaving(true);
      try {
        await clearAllGalleryProjects(galleryProjects);
        showNotification('success', 'Trabajos de prueba eliminados. ¡Ahora puedes subir fotos reales de tus proyectos!');
      } catch (err: any) {
        showNotification('error', 'Error al limpiar galería: ' + (err.message || err));
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRestoreDemoGallery = async () => {
    setSaving(true);
    try {
      await restoreDemoGalleryProjects();
      showNotification('success', 'Proyectos de ejemplo restaurados.');
    } catch (err: any) {
      showNotification('error', 'Error al restaurar ejemplos: ' + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  const handleClearDemoQuotes = () => {
    if (window.confirm('¿Seguro que deseas limpiar las solicitudes de prueba? Quedará lista para recibir solicitudes reales de clientes.')) {
      clearAllLocalQuotes();
      setQuotes([]);
      showNotification('success', 'Bandeja de solicitudes de prueba limpiada.');
    }
  };

  const handleAddValue = () => {
    if (!newValueInput.trim()) return;
    const currentValues = settingsForm.values || [];
    setSettingsForm({
      ...settingsForm,
      values: [...currentValues, newValueInput.trim()]
    });
    setNewValueInput('');
  };

  const handleRemoveValue = (index: number) => {
    const currentValues = settingsForm.values || [];
    setSettingsForm({
      ...settingsForm,
      values: currentValues.filter((_, i) => i !== index)
    });
  };

  if (!isOpen) return null;

  // -----------------------------------------------------------------
  // GALLERY HANDLERS
  // -----------------------------------------------------------------
  const handleOpenNewProject = () => {
    setProjectForm({
      title: '',
      category: 'pvc',
      location: 'Santo Domingo Este',
      description: '',
      beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      highlight: 'Acabado garantizado',
      completionTime: '1 Día',
    });
    setEditingProject(null);
    setIsNewProjectModal(true);
  };

  const handleEditProject = (proj: GalleryProject) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      category: proj.category,
      location: proj.location,
      description: proj.description,
      beforeImage: proj.beforeImage,
      afterImage: proj.afterImage,
      highlight: proj.highlight,
      completionTime: proj.completionTime,
    });
    setIsNewProjectModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProject) {
        await updateGalleryProject(editingProject.id, projectForm);
        showNotification('success', '¡Proyecto actualizado en la galería con éxito!');
      } else {
        await createGalleryProject(projectForm);
        showNotification('success', '¡Nuevo proyecto publicado en la galería!');
      }
      setIsNewProjectModal(false);
      setEditingProject(null);
    } catch (err: any) {
      console.error(err);
      showNotification('error', 'Error al guardar el proyecto: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (confirm(`¿Estás seguro de eliminar el proyecto "${title}" de la galería?`)) {
      try {
        await deleteGalleryProject(id);
        showNotification('success', 'Proyecto eliminado de la galería.');
      } catch (err: any) {
        showNotification('error', 'No se pudo eliminar: ' + err.message);
      }
    }
  };

  // -----------------------------------------------------------------
  // SERVICES HANDLERS
  // -----------------------------------------------------------------
  const handleEditService = (serv: ServiceItem) => {
    setEditingService(serv);
    setServiceForm({ ...serv, features: [...serv.features] });
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setSaving(true);
    try {
      await updateService(editingService.id, serviceForm);
      showNotification('success', '¡Servicio actualizado con éxito!');
      setEditingService(null);
    } catch (err: any) {
      showNotification('error', 'Error al actualizar servicio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFeatureToService = () => {
    setServiceForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleUpdateFeature = (idx: number, val: string) => {
    setServiceForm((prev) => {
      const updated = [...prev.features];
      updated[idx] = val;
      return { ...prev, features: updated };
    });
  };

  const handleRemoveFeature = (idx: number) => {
    setServiceForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  // -----------------------------------------------------------------
  // AREAS & SETTINGS HANDLERS
  // -----------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSiteSettings(settingsForm);
      showNotification('success', '¡Contenido y áreas de la web actualizadas correctamente!');
    } catch (err: any) {
      showNotification('error', 'Error al guardar configuración: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------
  // QUOTE REQUESTS HANDLERS
  // -----------------------------------------------------------------
  const handleUpdateStatus = async (id: string, status: 'nueva' | 'en_contacto' | 'completada') => {
    try {
      await updateQuoteStatus(id, status);
      showNotification('success', 'Estado de la solicitud actualizado.');
    } catch (err: any) {
      showNotification('error', 'Error al actualizar estado.');
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (confirm('¿Eliminar esta solicitud de cotización?')) {
      try {
        await deleteQuoteRequest(id);
        showNotification('success', 'Solicitud eliminada.');
      } catch (err: any) {
        showNotification('error', 'Error al eliminar solicitud.');
      }
    }
  };

  // -----------------------------------------------------------------
  // USERS & ROLES HANDLERS
  // -----------------------------------------------------------------
  const handleToggleRole = async (userItem: UserProfile) => {
    const nextRole = userItem.role === 'admin' ? 'cliente' : 'admin';
    if (confirm(`¿Cambiar el rol de "${userItem.displayName || userItem.email}" a "${nextRole.toUpperCase()}"?`)) {
      try {
        await updateUserRole(userItem.uid, nextRole);
        showNotification('success', `Rol actualizado a ${nextRole}.`);
      } catch (err: any) {
        showNotification('error', 'No se pudo actualizar el rol.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Panel de Administración Decoelectric
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Acceso Total
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Edita contenidos de cualquier área, sube o elimina proyectos de la galería y gestiona solicitudes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshData && (
              <button
                type="button"
                onClick={onRefreshData}
                title="Actualizar datos"
                className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Cerrar panel de administración"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              notice.type === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{notice.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 sm:gap-2 overflow-x-auto bg-slate-100/50 dark:bg-slate-900/50 py-2 shrink-0">
          {[
            { id: 'cotizaciones', label: 'Solicitudes', icon: MessageSquare, count: quotes.length },
            { id: 'galeria', label: 'Galería de Trabajos', icon: ImageIcon, count: galleryProjects.length },
            { id: 'servicios', label: 'Servicios & Tarifas', icon: Layers, count: services.length },
            { id: 'configuraciones', label: 'Configuraciones & Ajustes', icon: SlidersHorizontal },
            { id: 'areas', label: 'Portada & Cobertura', icon: Settings },
            { id: 'usuarios', label: 'Usuarios & Roles', icon: Users, count: usersList.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setEditingService(null);
                  setIsNewProjectModal(false);
                }}
                className={`py-2 px-3 sm:px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ======================================================== */}
          {/* TAB 1: GALERÍA DE TRABAJOS (Subir, Editar, Eliminar)     */}
          {/* ======================================================== */}
          {activeTab === 'galeria' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Proyectos Publicados en la Galería
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sube fotos del Antes y Después, actualiza descripciones o elimina proyectos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {galleryProjects.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearDemoGallery}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors"
                      title="Eliminar fotos de prueba para usar fotos reales de tus trabajos"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Limpiar Fotos de Prueba</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenNewProject}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Subir Nuevo Proyecto</span>
                  </button>
                </div>
              </div>

              {/* Projects Grid or Clean Slate */}
              {galleryProjects.length === 0 ? (
                <div className="text-center py-14 p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/50">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto mb-3">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Galería Limpia y Lista para Fotos Reales
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-5">
                    Has limpiado los trabajos de demostración. Sube las fotos del antes y después de tus instalaciones en techos de PVC, electricidad o plomería.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleOpenNewProject}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Subir Mi Primer Proyecto Real</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreDemoGallery}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar Ejemplos</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryProjects.map((project) => (
                    <div
                      key={project.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image preview */}
                        <div className="relative h-40 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <img
                            src={project.afterImage}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-black/70 text-white backdrop-blur-sm">
                            {project.category}
                          </span>
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-600 text-white">
                            {project.completionTime}
                          </span>
                        </div>

                      <div className="p-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {project.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          📍 {project.location}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-3 bg-white dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 truncate max-w-[130px]">
                        ✨ {project.highlight}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditProject(project)}
                          className="p-1.5 text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar proyecto"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project.id, project.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Eliminar proyecto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

          {/* ======================================================== */}
          {/* TAB 2: SERVICIOS Y TARIFAS (Editar, Precios, Características) */}
          {/* ======================================================== */}
          {activeTab === 'servicios' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Gestión de Servicios y Precios Base
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Modifica las tarifas de referencia, títulos, descripciones y puntos clave que ven los clientes.
                </p>
              </div>

              {/* Service list or editing form */}
              {editingService ? (
                <form onSubmit={handleSaveService} className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Editando Servicio: {editingService.title}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Título del Servicio
                      </label>
                      <input
                        type="text"
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tarifa de Referencia (Ej. Desde RD$ 1,200)
                      </label>
                      <input
                        type="text"
                        value={serviceForm.startingPrice}
                        onChange={(e) => setServiceForm({ ...serviceForm, startingPrice: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Subtítulo o Frase Resumen
                    </label>
                    <input
                      type="text"
                      value={serviceForm.subtitle}
                      onChange={(e) => setServiceForm({ ...serviceForm, subtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Descripción Detallada
                    </label>
                    <textarea
                      rows={3}
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Características incluidas en el servicio:
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFeatureToService}
                        className="text-xs font-bold text-sky-600 hover:text-sky-500"
                      >
                        + Agregar característica
                      </button>
                    </div>
                    <div className="space-y-2">
                      {serviceForm.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                            placeholder={`Característica ${idx + 1}`}
                            className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-700"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {services.map((serv) => (
                    <div
                      key={serv.id}
                      className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80">
                            {serv.category}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                            {serv.startingPrice}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {serv.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                          {serv.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1">
                          {serv.features.slice(0, 3).map((f, i) => (
                            <p key={i} className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              ✓ {f}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditService(serv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 hover:bg-sky-200 text-xs font-bold transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar Servicio</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: CONFIGURACIONES DEL SITIO & SEGURIDAD               */}
          {/* ======================================================== */}
          {activeTab === 'configuraciones' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-sky-500" />
                  <span>Configuraciones & Ajustes del Sitio</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gestiona la contraseña de administrador sin tocar código, números de atención rápida, correo, redes sociales, identidad corporativa y aspectos legales.
                </p>
              </div>

              {/* 1. SECCIÓN: CONTRASEÑA DE ADMINISTRADOR */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Contraseña de Administrador (Sin tocar código)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cambia tu contraseña para acceder al Panel de Control cuando lo desees.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Acceso Rápido Seguro
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contraseña Actual en el Sistema
                    </label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                      <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="flex-1 tracking-wider">
                        {showAdminPassword ? currentAdminPass : '••••••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                        title={showAdminPassword ? 'Ocultar' : 'Mostrar contraseña'}
                      >
                        {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nueva Contraseña Deseada
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={adminPasswordInput}
                        onChange={(e) => setAdminPasswordInput(e.target.value)}
                        placeholder="Ej: Deco2025*Segura"
                        className="flex-1 px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateAdminPassword()}
                        disabled={saving || !adminPasswordInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Guardar Clave</span>
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  💡 Al pulsar &quot;Guardar Clave&quot;, se actualizará de forma instantánea en tu navegador y en la base de datos para que puedas iniciar sesión como Administrador con tu nueva clave.
                </p>
              </div>

              {/* 2. SECCIÓN: CANALES DE ATENCIÓN RÁPIDA, CORREO Y REDES */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Atención Rápida, WhatsApp, Correo & Redes
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Atención Rápida 1 (Llamadas Directas)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phoneNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                      placeholder="809-303-1730"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Atención Rápida 2 (Línea Secundaria)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.secondaryPhone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secondaryPhone: e.target.value })}
                      placeholder="849-264-8965"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp Oficial de Cotizaciones
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      placeholder="809-303-1738"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Enlaza con el botón flotante y botones de contacto rápido de la web.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Correo Electrónico de la Empresa
                    </label>
                    <input
                      type="email"
                      value={settingsForm.contactEmail}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                      placeholder="dofeprotech@gmail.com"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <span>Instagram de la Empresa (Enlace o Usuario)</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/tu_usuario o @tu_usuario"
                      className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      Cuando crees tu Instagram corporativo, escribe aquí el enlace o usuario para conectarlo al ícono de Instagram en el menú y pie de página.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. SECCIÓN: MISIÓN, VISIÓN Y VALORES */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Target className="w-4 h-4 text-sky-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Identidad Corporativa (Misión, Visión y Valores)
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Misión de la Empresa
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.mission}
                    onChange={(e) => setSettingsForm({ ...settingsForm, mission: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Visión de la Empresa
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.vision}
                    onChange={(e) => setSettingsForm({ ...settingsForm, vision: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Valores Fundamentales
                  </label>
                  <div className="space-y-2 mb-3">
                    {(settingsForm.values || []).map((val, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => {
                            const updated = [...(settingsForm.values || [])];
                            updated[idx] = e.target.value;
                            setSettingsForm({ ...settingsForm, values: updated });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(idx)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Eliminar valor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newValueInput}
                      onChange={(e) => setNewValueInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddValue();
                        }
                      }}
                      placeholder="Escribe un nuevo valor corporativo (ej: Puntualidad Dominicana)..."
                      className="flex-1 px-3 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddValue}
                      className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Añadir Valor</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. SECCIÓN: TÉRMINOS Y CONDICIONES Y POLÍTICA DE PRIVACIDAD */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Marco Legal y Privacidad (República Dominicana)
                  </h4>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Términos y Condiciones de Servicio
                  </label>
                  <textarea
                    rows={6}
                    value={settingsForm.termsAndConditions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, termsAndConditions: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Política de Privacidad y Tratamiento de Datos
                  </label>
                  <textarea
                    rows={6}
                    value={settingsForm.privacyPolicy}
                    onChange={(e) => setSettingsForm({ ...settingsForm, privacyPolicy: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white leading-relaxed"
                  />
                </div>
              </div>

              {/* 5. SECCIÓN: LIMPIEZA DE DATOS FICTICIOS / PREPARACIÓN PRODUCCIÓN */}
              <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    ¿Es recomendable tener trabajos ficticios?
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Respuesta recomendada:</strong> No en producción. En República Dominicana los clientes prefieren ver fotos reales y genuinas de trabajos terminados en Santo Domingo Este (incluso fotos directas tomadas con tu celular de techos en PVC, lámparas LED o tuberías). Si deseas empezar con fotos reales, puedes limpiar las fotos de demostración con un solo clic:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClearDemoGallery}
                    className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Galería de Prueba</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearDemoQuotes}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpiar Solicitudes de Prueba</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRestoreDemoGallery}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restaurar Ejemplos</span>
                  </button>
                </div>
              </div>

              {/* BOTÓN GENERAL PARA GUARDAR CONFIGURACIONES */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando Ajustes...' : 'Guardar Todas las Configuraciones'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: TEXTOS Y ÁREAS DE LA WEB (Hero, Cintillo, Teléfonos) */}
          {/* ======================================================== */}
          {activeTab === 'areas' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personalización de Áreas y Textos Principales
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Edita la portada principal, el aviso de anuncio superior, los números de contacto y la zona de cobertura.
                </p>
              </div>

              {/* Contact Information in Header/Footer */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Teléfonos de Contacto & WhatsApp
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono Formateado
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phoneNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Número de WhatsApp (con código de país, ej. 18295550199)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono Secundario (Línea 2)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.secondaryPhone || '849-264-8965'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, secondaryPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Enlace de Perfil de Instagram (Icono & QR)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.instagramUrl || 'https://www.instagram.com/decoelectri/'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                      placeholder="https://www.instagram.com/decoelectri/"
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Banner */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Cintillo de Anuncio Superior
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={settingsForm.showAnnouncement}
                      onChange={(e) => setSettingsForm({ ...settingsForm, showAnnouncement: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600"
                    />
                    <span>Mostrar cintillo</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  placeholder="Texto del cintillo de novedades"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Hero Section Copy */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Portada Principal (Hero)
                </h4>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Insignia Superior
                  </label>
                  <input
                    type="text"
                    value={settingsForm.heroBadge}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroBadge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Título (Primera parte)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Texto Resaltado en Azul
                    </label>
                    <input
                      type="text"
                      value={settingsForm.heroHighlight}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroHighlight: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Párrafo Descriptivo
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroSubtitle}
                    onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Zona de Cobertura */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-500" />
                    <span>Zona de Cobertura del Servicio</span>
                  </h4>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Zona o Sectores Atendidos
                  </label>
                  <input
                    type="text"
                    value={settingsForm.coverageAreas?.[0] || 'Santo Domingo Este Y Más'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, coverageAreas: [e.target.value] })}
                    placeholder="Santo Domingo Este Y Más"
                    className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Este texto se muestra en el pie de página, en la sección de contacto y en los formularios de cotización.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Aplicar Cambios a la Web'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 4: SOLICITUDES DE COTIZACIÓN DE CLIENTES             */}
          {/* ======================================================== */}
          {activeTab === 'cotizaciones' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Solicitudes de Presupuesto ({quotes.length})</span>
                    {user ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ☁️ Nube Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        ⚡ Modo Local
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user
                      ? `Conectado como ${user.email}. Sincronizado en tiempo real con Firestore.`
                      : 'Peticiones guardadas en el navegador. Inicia sesión con Google para sincronizar en la nube.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {quotes.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearDemoQuotes}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                      title="Eliminar solicitudes de prueba para ver solo cotizaciones reales"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpiar Solicitudes de Prueba</span>
                    </button>
                  )}
                  {!user && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await loginWithGoogle();
                          showNotification('success', '¡Conectado exitosamente con Google!');
                        } catch (err: any) {
                          if (
                            err?.code !== 'auth/popup-closed-by-user' &&
                            err?.code !== 'auth/cancelled-popup-request'
                          ) {
                            showNotification('error', err?.message || 'Error al conectar con Google');
                          }
                        }
                      }}
                      className="self-start sm:self-center px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                    >
                      Conectar con Google
                    </button>
                  )}
                </div>
              </div>

              {quotes.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No hay solicitudes pendientes en este momento.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Cada vez que un cliente use el cotizador o el formulario, aparecerá aquí inmediatamente.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {quotes.map((q) => {
                    const cleanPhone = q.phone.replace(/\D/g, '');
                    const waMessage = `Hola ${q.fullName}, te contactamos de Decoelectric con respecto a tu solicitud de cotización para ${q.serviceNeeded} en ${q.sector}.`;
                    const waUrl = `https://wa.me/1${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

                    return (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {q.fullName}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              📞 {q.phone}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                              {q.serviceNeeded}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            📍 <strong>{q.sector}</strong> | Urgencia: {q.urgency}
                            {q.budgetDOP ? ` | Presupuesto: RD$ ${q.budgetDOP.toLocaleString('es-DO')}` : ''}
                          </p>

                          {q.additionalDetails && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              "{q.additionalDetails}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {/* Status toggle */}
                          <select
                            value={q.status || 'nueva'}
                            onChange={(e) => handleUpdateStatus(q.id!, e.target.value as any)}
                            className="text-xs py-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                          >
                            <option value="nueva">🟡 Nueva</option>
                            <option value="en_contacto">🔵 En Contacto</option>
                            <option value="completada">🟢 Completada</option>
                          </select>

                          {/* WhatsApp client direct button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuote(q.id!)}
                            className="p-1.5 text-slate-400 hover:text-rose-500"
                            title="Eliminar solicitud"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: USUARIOS Y ROLES (Admin vs Clientes)               */}
          {/* ======================================================== */}
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Usuarios Registrados y Roles ({usersList.length})</span>
                    {user ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        ☁️ Nube Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        ⚡ Modo Local
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user
                      ? `Conectado como ${user.email}. Administrando usuarios registrados en Firestore.`
                      : 'Usuarios cargados localmente. Inicia sesión con Google para sincronizar con Firestore.'}
                  </p>
                </div>

                {!user && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await loginWithGoogle();
                        showNotification('success', '¡Conectado exitosamente con Google!');
                      } catch (err: any) {
                        if (
                          err?.code !== 'auth/popup-closed-by-user' &&
                          err?.code !== 'auth/cancelled-popup-request'
                        ) {
                          showNotification('error', err?.message || 'Error al conectar con Google');
                        }
                      }
                    }}
                    className="self-start sm:self-center px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                  >
                    Conectar con Google
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {usersList.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-500">
                    Aún no hay perfiles registrados en Firestore.
                  </div>
                ) : (
                  usersList.map((usr) => (
                    <div
                      key={usr.uid}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {usr.displayName || 'Sin nombre'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              usr.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            }`}
                          >
                            {usr.role === 'admin' ? 'Administrador' : 'Cliente'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {usr.email}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRole(usr)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cambiar a {usr.role === 'admin' ? 'Cliente' : 'Administrador'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* MODAL: SUBIR O EDITAR PROYECTO DE LA GALERÍA              */}
        {/* ======================================================== */}
        {isNewProjectModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingProject ? 'Editar Proyecto de la Galería' : 'Subir Nuevo Proyecto a la Galería'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNewProjectModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pared de Acento PVC Mármol con Luz LED"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as ServiceCategory })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="pvc">Paneles PVC</option>
                      <option value="electricidad">Electricidad</option>
                      <option value="plomeria">Plomería</option>
                      <option value="combo">Combo Integral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Ubicación / Sector
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Alma Rosa I, SDE"
                      value={projectForm.location}
                      onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Imagen "Antes" (Opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={projectForm.beforeImage}
                    onChange={(e) => setProjectForm({ ...projectForm, beforeImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    URL Imagen "Después" / Acabado Final *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={projectForm.afterImage}
                    onChange={(e) => setProjectForm({ ...projectForm, afterImage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Punto Destacado (Badge)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Acabado de lujo sin picar"
                      value={projectForm.highlight}
                      onChange={(e) => setProjectForm({ ...projectForm, highlight: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Tiempo de Ejecución
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 1 Día de trabajo"
                      value={projectForm.completionTime}
                      onChange={(e) => setProjectForm({ ...projectForm, completionTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descripción del Trabajo
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe los materiales utilizados y el resultado logrado..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewProjectModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Publicando...' : 'Publicar Proyecto'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

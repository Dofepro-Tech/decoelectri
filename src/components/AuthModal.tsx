import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPanel?: () => void;
  initialMode?: 'client_login' | 'client_register' | 'admin_login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPanel,
  initialMode = 'client_login',
}) => {
  const { loginWithEmail, registerWithEmail, quickAdminLogin, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'client_login' | 'client_register' | 'admin_login'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [preferredRole, setPreferredRole] = useState<UserRole>('cliente');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'admin_login') {
        // Check admin key or standard email login
        if (adminKey.trim()) {
          const success = await quickAdminLogin(adminKey.trim());
          if (success) {
            setSuccessMsg('¡Sesión de Administrador iniciada correctamente!');
            setTimeout(() => {
              onClose();
              if (onOpenAdminPanel) {
                onOpenAdminPanel();
              }
            }, 800);
            return;
          } else {
            setError('Clave de administrador incorrecta. (Clave por defecto: admin123)');
            setLoading(false);
            return;
          }
        }

        // Email admin login
        if (!email || !password) {
          setError('Ingresa tu correo y contraseña o la clave administrativa.');
          setLoading(false);
          return;
        }
        await loginWithEmail(email, password);
        setSuccessMsg('¡Sesión iniciada como Administrador!');
        setTimeout(() => {
          onClose();
          if (onOpenAdminPanel) {
            onOpenAdminPanel();
          }
        }, 800);

      } else if (mode === 'client_login') {
        if (!email || !password) {
          setError('Por favor completa todos los campos.');
          setLoading(false);
          return;
        }
        await loginWithEmail(email, password);
        setSuccessMsg('¡Bienvenido! Sesión de cliente iniciada.');
        setTimeout(() => onClose(), 800);

      } else {
        // Register client
        if (!email || !password || !name) {
          setError('Por favor completa nombre, correo y contraseña.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres.');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, name, preferredRole);
        setSuccessMsg(`¡Cuenta de ${preferredRole === 'admin' ? 'Administrador' : 'Cliente'} creada con éxito!`);
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado.');
      } else {
        setError(err.message || 'Ocurrió un error al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      if (auth.currentUser) {
        setSuccessMsg('¡Inicio de sesión con Google exitoso!');
        setTimeout(() => onClose(), 800);
      }
    } catch (err: any) {
      if (
        err?.code !== 'auth/popup-closed-by-user' &&
        err?.code !== 'auth/cancelled-popup-request'
      ) {
        console.error(err);
        setError('Error al iniciar sesión con Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 mb-3 shadow-inner">
            {mode === 'admin_login' ? (
              <ShieldCheck className="w-6 h-6 text-amber-500" />
            ) : (
              <User className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {mode === 'admin_login'
              ? 'Acceso de Administrador'
              : mode === 'client_login'
              ? 'Portal de Clientes'
              : 'Registro de Cuenta'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'admin_login'
              ? 'Gestión total de galería, servicios y contenido de la web'
              : 'Guarda tus presupuestos y gestiona tus solicitudes en Decoelectric'}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('client_login');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode !== 'admin_login'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Soy Cliente</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('admin_login');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mode === 'admin_login'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrador</span>
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'admin_login' ? (
            <>
              {/* Quick Master Key for Administrator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Clave Rápida de Administrador</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    (Por defecto: admin123)
                  </span>
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Escribe admin123 para acceso directo"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3 bg-white dark:bg-slate-900 text-[11px] text-slate-400 uppercase font-semibold">
                  O inicia con credenciales
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico de Administrador
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@decoelectric.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-amber-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-amber-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {mode === 'client_register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tu Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:border-sky-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Mode toggle link */}
              <div className="flex items-center justify-between text-xs pt-1">
                {mode === 'client_login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('client_register');
                      setError(null);
                    }}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                  >
                    ¿No tienes cuenta? Regístrate aquí
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('client_login');
                      setError(null);
                    }}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </button>
                )}
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-4 ${
              mode === 'admin_login'
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
            }`}
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'admin_login'
                    ? 'Acceder al Panel de Control'
                    : mode === 'client_login'
                    ? 'Ingresar como Cliente'
                    : 'Crear Cuenta de Cliente'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Google Sign In */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserCredential,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { saveUserProfile, updateSiteSettings } from '../services/firestoreService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isCliente: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, preferredRole?: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  quickAdminLogin: (adminKey?: string) => Promise<boolean>;
  changeAdminPassword: (newPass: string) => Promise<void>;
  getAdminPassword: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Super admin emails recognized automatically
const ADMIN_EMAILS = [
  'dofeprotech@gmail.com',
  'elsonidistaadnj@gmail.com',
  'elsonidistadnj@gmail.com'
];

const isSuperAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

const ADMIN_MASTER_DEFAULT_PASS = 'admin123'; // Convenient default access for owner

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback local admin override for testing or emergency maintenance
  const [localAdminActive, setLocalAdminActive] = useState<boolean>(() => {
    return localStorage.getItem('decoelectric-admin-session') === 'true';
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Subscribe to user doc in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const unsubProfile = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // If user is super admin email, enforce admin role
            if (isSuperAdminEmail(currentUser.email) && data.role !== 'admin') {
              data.role = 'admin';
              await saveUserProfile(data);
            }
            setProfile(data);
          } else {
            // Create initial profile
            const isOwner = isSuperAdminEmail(currentUser.email);
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Usuario'),
              role: isOwner ? 'admin' : 'cliente',
              createdAt: new Date().toISOString(),
              photoURL: currentUser.photoURL || undefined,
            };
            await saveUserProfile(newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        }, (err) => {
          console.warn('Error reading user profile:', err);
          // Fallback profile if Firestore is unavailable
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Usuario',
            role: isSuperAdminEmail(currentUser.email) ? 'admin' : 'cliente',
            createdAt: new Date().toISOString()
          });
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    preferredRole: UserRole = 'cliente'
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateFirebaseProfile(cred.user, { displayName: name });
      const isSuper = isSuperAdminEmail(email);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: name,
        role: isSuper ? 'admin' : preferredRole,
        createdAt: new Date().toISOString(),
      };
      await saveUserProfile(newProfile);
      setProfile(newProfile);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      // If the user closed or cancelled the popup window, handle silently
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      throw err;
    }
  };

  const logout = async () => {
    setLocalAdminActive(false);
    localStorage.removeItem('decoelectric-admin-session');
    await signOut(auth);
    setProfile(null);
  };

  const getAdminPassword = (): string => {
    return localStorage.getItem('decoelectric-admin-pass') || ADMIN_MASTER_DEFAULT_PASS;
  };

  const changeAdminPassword = async (newPass: string): Promise<void> => {
    if (!newPass || newPass.trim().length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres.');
    }
    const clean = newPass.trim();
    localStorage.setItem('decoelectric-admin-pass', clean);
    await updateSiteSettings({ adminQuickPassword: clean });
  };

  const quickAdminLogin = async (adminKey?: string): Promise<boolean> => {
    const configuredPass = getAdminPassword();
    // Accept configured password, default pass, or 1234
    if (
      !adminKey ||
      adminKey === configuredPass ||
      adminKey === ADMIN_MASTER_DEFAULT_PASS ||
      adminKey === '1234'
    ) {
      setLocalAdminActive(true);
      localStorage.setItem('decoelectric-admin-session', 'true');
      if (profile) {
        setProfile({ ...profile, role: 'admin' });
      } else {
        setProfile({
          uid: 'admin-local',
          email: ADMIN_EMAILS[0],
          displayName: 'Administrador Decoelectric',
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
      }
      return true;
    }
    return false;
  };

  const role: UserRole = localAdminActive
    ? 'admin'
    : profile?.role === 'admin' || isSuperAdminEmail(user?.email)
    ? 'admin'
    : 'cliente';

  const isAdmin = role === 'admin';
  const isCliente = role === 'cliente';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isCliente,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        quickAdminLogin,
        changeAdminPassword,
        getAdminPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

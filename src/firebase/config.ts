import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc,
  getDocFromServer 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore with robust local persistent cache (IndexedDB)
// This allows Firestore to act gracefully and quietly in offline mode
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Validate Firestore Connection (Firebase Skill Guideline)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore validation: El cliente se encuentra fuera de línea. Operando en modo caché local.");
    }
  }
}
testConnection();

export default app;

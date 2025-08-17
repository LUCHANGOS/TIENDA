import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
// Usa variables de entorno seguras de GitHub Secrets
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug: Verificar configuración en desarrollo
if (import.meta.env.DEV) {
  console.log('🔥 Firebase Config Debug:', {
    apiKey: firebaseConfig.apiKey ? `✅ ${firebaseConfig.apiKey.substring(0, 10)}...` : '❌ Faltante',
    authDomain: firebaseConfig.authDomain || '❌ Faltante',
    databaseURL: firebaseConfig.databaseURL || '❌ Faltante',
    projectId: firebaseConfig.projectId || '❌ Faltante',
    storageBucket: firebaseConfig.storageBucket || '❌ Faltante',
    messagingSenderId: firebaseConfig.messagingSenderId || '❌ Faltante',
    appId: firebaseConfig.appId ? `✅ ${firebaseConfig.appId.substring(0, 15)}...` : '❌ Faltante',
    timestamp: new Date().toISOString()
  });
}

// Verificar que todas las variables estén configuradas
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'demo-api-key') {
  console.error('❌ FIREBASE CONFIG ERROR: API Key no configurado correctamente');
  console.error('Variables de entorno disponibles:', import.meta.env);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;

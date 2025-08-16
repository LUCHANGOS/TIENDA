import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase
// IMPORTANTE: Los valores reales deben configurarse según tu proyecto Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "tu-api-key-aqui",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "tienda-de81e.firebaseapp.com",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://tienda-de81e-default-rtdb.firebaseio.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "tienda-de81e",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "tienda-de81e.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "tu-app-id-aqui"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read Firebase configuration from environment variables.
// Use Vite's `import.meta.env` with `VITE_` prefix for public vars.
// If env vars are not available, use fallback (for Vercel deployment)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCyO8lf2V62X_PBR6kdQZ8zhxvEfVJndPs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hora-extra-central.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hora-extra-central',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hora-extra-central.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '855086040858',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:855086040858:web:667a290e5dfda37bce8ea3',
};

// Log configuration status (for debugging on Vercel)
console.log('Firebase Config Status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
});

// Initialize Firebase
let app: any = undefined;
let _auth: any = undefined;
let _db: any = undefined;

try {
  app = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
}

export const auth = _auth;
export const db = _db;
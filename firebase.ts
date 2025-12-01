// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read Firebase configuration from environment variables.
// Use Vite's `import.meta.env` with `VITE_` prefix for public vars.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check configuration presence
const isFirebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(v => typeof v === 'string' && v.length > 0);

if (!isFirebaseConfigured) {
  // Log a clear message for runtime debugging (Vercel logs / browser console)
  console.error('Firebase is not configured. Please set VITE_FIREBASE_* environment variables.');
}

// Initialize Firebase only when configured
let app: any = undefined;
let _auth: any = undefined;
let _db: any = undefined;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
}

export const auth = _auth;
export const db = _db;
export const isFirebaseConfiguredFlag = isFirebaseConfigured;
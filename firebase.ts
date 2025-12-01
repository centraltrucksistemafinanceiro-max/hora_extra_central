// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyO8lf2V62X_PBR6kdQZ8zhxvEfVJndPs",
  authDomain: "hora-extra-central.firebaseapp.com",
  projectId: "hora-extra-central",
  storageBucket: "hora-extra-central.firebasestorage.app",
  messagingSenderId: "855086040858",
  appId: "1:855086040858:web:667a290e5dfda37bce8ea3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
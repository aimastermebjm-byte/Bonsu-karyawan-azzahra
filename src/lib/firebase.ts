import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase config - Bonus Karyawan Azzahra
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDvYlTZ89g5tAktpLgTxbGki9OFufus_ok",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bonus-karyawan-azzahra.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bonus-karyawan-azzahra",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bonus-karyawan-azzahra.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "253079131021",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:253079131021:web:46ecc7dd5ae62fe13d63c4",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-209741TZGW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
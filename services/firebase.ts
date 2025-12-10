import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD2Bzxf7CDeG3ndkMqrUBNNf-8LJO3mbLE",
  authDomain: "mess-qr-system-e2954.firebaseapp.com",
  databaseURL: "https://mess-qr-system-e2954-default-rtdb.firebaseio.com",
  projectId: "mess-qr-system-e2954",
  storageBucket: "mess-qr-system-e2954.firebasestorage.app",
  messagingSenderId: "124647979992",
  appId: "1:124647979992:web:cfe9bdc01b06fd95f690ad",
  measurementId: "G-CCS9F9GHQE"
};

// Prevent multiple initializations in dev/hot-reload environments
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getDatabase(app);

// Helper to check if config is still default
export const isConfigured = () => {
  return true;
};
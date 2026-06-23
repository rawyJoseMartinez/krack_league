import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import.meta.env.VITE_FIREBASE_API_KEY

const firebaseConfig = {
  apiKey: "AIzaSyAryadzr3nEk5xryOWXyPYQ01ZOSx2Rk1Q",
  authDomain: "krackleague.firebaseapp.com",
  projectId: "krackleague",
  storageBucket: "krackleague.firebasestorage.app",
  messagingSenderId: "55878915153",
  appId: "1:55878915153:web:5f9fa91461be348c5bd470"
  
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar solo la autenticación
export const auth = getAuth(app);
export const db = getFirestore(app);
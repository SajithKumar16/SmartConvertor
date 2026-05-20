import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCP6yEQv13wk0P3soQKG4KMLHfDnogP-c8",
  authDomain: "studio-6604564113-ced29.firebaseapp.com",
  projectId: "studio-6604564113-ced29",
  storageBucket: "studio-6604564113-ced29.firebasestorage.app",
  messagingSenderId: "412694772226",
  appId: "1:412694772226:web:dab0770b8e47e27ea1851b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
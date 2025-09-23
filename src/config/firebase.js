import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC9x3Eq9lmBMfO4gvR1j3Vk57Eb6U8KIyw",
  authDomain: "crisisconnect-3dca9.firebaseapp.com",
  projectId: "crisisconnect-3dca9",
  storageBucket: "crisisconnect-3dca9.firebasestorage.app",
  messagingSenderId: "273163117411",
  appId: "1:273163117411:web:6b94bcda7144f897e56956",
  measurementId: "G-8VFBNKC9T5",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9x3Eq9lmBMfO4gvR1j3Vk57Eb6U8KIyw",
  authDomain: "crisisconnect-3dca9.firebaseapp.com",
  projectId: "crisisconnect-3dca9",
  storageBucket: "crisisconnect-3dca9.firebasestorage.app",
  messagingSenderId: "273163117411",
  appId: "1:273163117411:web:6b94bcda7144f897e56956",
  measurementId: "G-8VFBNKC9T5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
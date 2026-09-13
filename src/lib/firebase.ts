import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Read Firebase config from the pre-generated file or default values
const firebaseConfig = {
  apiKey: "AIzaSyCKG16IQBw1wKy91kIAFPdR9qjkbGJ9ems",
  authDomain: "otpkreative.firebaseapp.com",
  projectId: "otpkreative",
  appId: "1:158940324837:web:7152ece40bc1e05acdc50c",
  storageBucket: "otpkreative.firebasestorage.app",
  messagingSenderId: "158940324837"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

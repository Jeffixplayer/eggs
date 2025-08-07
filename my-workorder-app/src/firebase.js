// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "IDE JÖN AZ API KULCS",
  authDomain: "IDE JÖN A DOMÉN",
  projectId: "IDE JÖN A PROJEKT AZONOSÍTÓ",
  storageBucket: "IDE A STORAGE BUCKET",
  messagingSenderId: "IDE A MESSAGING ID",
  appId: "IDE AZ APP ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
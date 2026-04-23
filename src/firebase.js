import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwdHDERrskwIASbBKEVBjrpLG4ZCLfyy4",
  authDomain: "trading-journal-74263.firebaseapp.com",
  projectId: "trading-journal-74263",
  storageBucket: "trading-journal-74263.firebasestorage.app",
  messagingSenderId: "572777328971",
  appId: "1:572777328971:web:da965b6dbad3090e9b38ce",
  measurementId: "G-82G45CS1NK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
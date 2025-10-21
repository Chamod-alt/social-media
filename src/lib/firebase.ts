import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAyfg4NZtt2QD9TB5ZTrvdEiuVD0exhcf0",
  authDomain: "ai-chat-app-fbf55.firebaseapp.com",
  databaseURL: "https://ai-chat-app-fbf55-default-rtdb.firebaseio.com",
  projectId: "ai-chat-app-fbf55",
  storageBucket: "ai-chat-app-fbf55.firebasestorage.app",
  messagingSenderId: "270518407095",
  appId: "1:270518407095:web:6d5868fe8584e15f8d2232",
  measurementId: "G-DEL76B4TEW",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };

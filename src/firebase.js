// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Helper to check if we are running locally to avoid login fatigue
export const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

// TODO: Replace the following with your app's Firebase project configuration
// You can find this in the Firebase Console -> Project Settings -> General -> Your Apps -> Config
const firebaseConfig = {
    apiKey: "AIzaSyAGtu7l-7sQ8EfLGrPXMU38uVNlhQdu2Cc",
    authDomain: "famsocial-723ae.firebaseapp.com",
    projectId: "famsocial-723ae",
    storageBucket: "famsocial-723ae.firebasestorage.app",
    messagingSenderId: "843773862973",
    appId: "1:843773862973:web:30381df5333a2a302ab654",
    measurementId: "G-R11ZCRSFWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

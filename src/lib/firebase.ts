// Firebase Configuration
// This file sets up Firebase for authentication

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
    Auth
} from "firebase/auth";

// Firebase configuration - Replace with your keys
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;

if (typeof window !== "undefined") {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
}

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
});

// Auth Functions
export async function signInWithEmail(email: string, password: string) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: getErrorMessage(error.code) };
    }
}

export async function signUpWithEmail(email: string, password: string) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: getErrorMessage(error.code) };
    }
}

export async function signInWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return { user: result.user, error: null };
    } catch (error: any) {
        return { user: null, error: getErrorMessage(error.code) };
    }
}

export async function logOut() {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}

export function onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
    return auth?.currentUser || null;
}

// Error message mapping
function getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
        "auth/invalid-email": "Invalid email address",
        "auth/user-disabled": "This account has been disabled",
        "auth/user-not-found": "No account found with this email",
        "auth/wrong-password": "Incorrect password",
        "auth/email-already-in-use": "An account with this email already exists",
        "auth/weak-password": "Password should be at least 6 characters",
        "auth/popup-closed-by-user": "Sign-in popup was closed",
        "auth/cancelled-popup-request": "Sign-in was cancelled",
        "auth/network-request-failed": "Network error. Please check your connection",
    };
    return messages[code] || "An error occurred. Please try again.";
}

export { auth };

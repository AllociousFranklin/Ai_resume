"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import {
    onAuthChange,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logOut
} from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    googleSignIn: () => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const result = await signInWithEmail(email, password);
        return { error: result.error };
    };

    const signUp = async (email: string, password: string) => {
        const result = await signUpWithEmail(email, password);
        return { error: result.error };
    };

    const googleSignIn = async () => {
        const result = await signInWithGoogle();
        return { error: result.error };
    };

    const logout = async () => {
        await logOut();
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, googleSignIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm">
                        <Sparkles className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Sign in to SkillSnap
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Enterprise talent intelligence for modern hiring.
                    </p>
                </div>

                {/* Auth Form */}
                <AuthForm onSuccess={() => router.push("/")} />

                {/* Footer Link */}
                <div className="text-center">
                    <a href="/" className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline">
                        Return to home page
                    </a>
                </div>
            </div>
        </main>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    Sparkles,
    Users,
    LogIn,
    LogOut,
    User,
    BarChart3
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                    <span className="font-bold text-lg">
                        Skill<span className="text-indigo-500">Snap</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link
                        href="/"
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            isActive("/")
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        Analyze
                    </Link>
                    <Link
                        href="/batch"
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                            isActive("/batch")
                                ? "bg-indigo-500/20 text-indigo-400"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Batch
                    </Link>
                </nav>

                {/* Auth */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                                <User className="w-4 h-4" />
                                {user.email?.split("@")[0]}
                            </div>
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </motion.header>
    );
}

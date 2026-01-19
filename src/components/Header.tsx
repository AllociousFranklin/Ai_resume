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
    Sun,
    Moon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function Header() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <Sparkles className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                    <span className="font-bold text-lg">
                        Skill<span className="text-primary">Snap</span>
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    <Link
                        href="/"
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                            isActive("/")
                                ? "bg-primary/20 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        Analyze
                    </Link>
                    <Link
                        href="/batch"
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                            isActive("/batch")
                                ? "bg-primary/20 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Batch
                    </Link>
                </nav>

                {/* Theme Toggle + Auth */}
                <div className="flex items-center gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="w-4 h-4" />
                                {user.email?.split("@")[0]}
                            </div>
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden md:inline">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 rounded-lg transition-colors"
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


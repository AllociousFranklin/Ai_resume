"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Sparkles,
    Users,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">
                        SkillSnap
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-blue-600",
                            isActive("/") ? "text-blue-600" : "text-gray-600"
                        )}
                    >
                        Analyze
                    </Link>
                    <Link
                        href="/batch"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-blue-600 flex items-center gap-1.5",
                            isActive("/batch") ? "text-blue-600" : "text-gray-600"
                        )}
                    >
                        <Users className="w-4 h-4" />
                        Batch Processing
                    </Link>
                </nav>

                {/* Right Section */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                {user.email?.split("@")[0]}
                            </span>
                            <button
                                onClick={() => logout()}
                                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-3 space-y-3">
                        <Link
                            href="/"
                            className="block text-sm font-medium text-gray-700 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Analyze Resume
                        </Link>
                        <Link
                            href="/batch"
                            className="block text-sm font-medium text-gray-700 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Batch Processing
                        </Link>
                        <div className="pt-3 border-t border-gray-100">
                            {user ? (
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="block w-full text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}


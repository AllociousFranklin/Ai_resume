"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function LandingNavbar() {
    return (
        <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 rounded-2xl bg-[#030014]/60 backdrop-blur-xl border border-white/5 shadow-2xl shadow-purple-900/10">
            <div className="px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">SkillSnap</span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                    {["Product", "Solutions", "Pricing", "Resources"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all"
                        >
                            {item}
                        </Link>
                    ))}
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors hidden sm:block"
                    >
                        Sign In
                    </Link>
                    <Link
                        href="/analyze"
                        className="relative group px-5 py-2 text-sm font-bold text-white rounded-full overflow-hidden"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center gap-1">
                            Start Free
                        </span>
                    </Link>
                </div>
            </div>
        </nav>
    );
}

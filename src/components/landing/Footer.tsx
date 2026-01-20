"use client";

import Link from "next/link";
import { ShieldCheck, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#030014] border-t border-white/5 pt-20 pb-10 relative z-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white tracking-tight">SkillSnap</span>
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            The deterministic talent intelligence platform for modern engineering teams.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
                            <Link href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></Link>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-bold">Product</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Verification Engine</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Bias Elimination</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Changelog</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-bold">Resources</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">API Reference</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Community</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-white font-bold">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-purple-400 transition-colors">Security</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-8">
                    <p className="text-slate-600 text-xs">
                        &copy; 2024 SkillSnap Intelligence Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

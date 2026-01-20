"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { AnimatedDemo } from "./AnimatedDemo";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 px-6 text-center z-10 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
            <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto space-y-8"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-purple-200 backdrop-blur-sm hover:border-purple-500/50 transition-colors cursor-pointer"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    Introducing Automated Bias Elimination Protocol
                </motion.div>

                {/* Headlines */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                    Turn Resumes into <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 animate-gradient-x">
                        Verified Intelligence
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Stop parsing keywords. Start validating skills. The deterministic scoring engine specifically built for modern engineering teams.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link
                        href="/analyze"
                        className="group relative px-8 py-4 text-base font-bold text-white rounded-full overflow-hidden transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-500/40"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:scale-105 transition-transform duration-300" />
                        <span className="relative flex items-center gap-2">
                            Analyze Candidate <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>

                    <button className="group px-8 py-4 text-base font-bold text-white bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-sm">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                        Watch Demo
                    </button>
                </div>
            </motion.div>

            {/* Animated Demo Section */}
            <motion.div
                initial={{ opacity: 0, rotateX: 20, y: 100 }}
                animate={{ opacity: 1, rotateX: 10, y: 0 }}
                transition={{ duration: 1, delay: 0.4, type: "spring", stiffness: 50 }}
                className="mt-16 relative mx-auto max-w-3xl perspective-1000"
                style={{ perspective: "1000px" }}
            >
                {/* Floating Glow Behind */}
                <div className="absolute inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur-2xl opacity-30 animate-pulse-slow"></div>

                {/* Demo Container */}
                <div className="relative bg-[#0A0A0F]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden aspect-video transform transition-transform hover:scale-[1.01] duration-700">
                    {/* Fake Browser UI */}
                    <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2 z-20">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                        </div>
                        <div className="ml-4 px-3 py-1 rounded-full bg-[#030014] border border-white/5 text-[10px] text-slate-500 font-mono">
                            skillsnap.ai/demo
                        </div>
                    </div>

                    {/* Animated Demo Component */}
                    <div className="pt-10 h-full">
                        <AnimatedDemo />
                    </div>
                </div>
            </motion.div>
        </section>
    );
}

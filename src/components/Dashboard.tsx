"use client";

import { motion } from "framer-motion";
import { Upload, FileText, Github, Linkedin, CheckCircle, AlertTriangle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Dashboard({ data, onReset }: { data: any, onReset: () => void }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-rose-400";
    };

    return (
        <div className="min-h-screen p-8 max-w-7xl mx-auto space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                    Analysis Result
                </h2>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-secondary hover:bg-muted text-sm rounded-lg transition-colors"
                >
                    Analyze Another
                </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Score Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 md:col-span-3 lg:col-span-1 glass p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 z-0" />
                    <h3 className="text-muted-foreground uppercase tracking-widest text-sm font-semibold z-10">Usefulness Score</h3>
                    <div className={cn("text-8xl font-black mt-4 mb-2 z-10", getScoreColor(data.final_score))}>
                        {data.final_score}
                    </div>
                    <p className="text-sm text-muted-foreground z-10 max-w-[200px]">
                        Based on ATS, GitHub, and Skill Proof metrics.
                    </p>
                </motion.div>

                {/* Breakdown */}
                <div className="col-span-1 md:col-span-3 lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ScoreCard
                        title="ATS Score"
                        val={data.ats_score}
                        icon={<FileText className="w-5 h-5" />}
                        delay={0.2}
                    />
                    <ScoreCard
                        title="GitHub Impact"
                        val={data.github_stats.github_score}
                        icon={<Github className="w-5 h-5" />}
                        delay={0.3}
                    />
                    <ScoreCard
                        title="Proof Index"
                        val={data.proof_stats.proof_score}
                        icon={<CheckCircle className="w-5 h-5" />}
                        delay={0.4}
                    />
                </div>
            </div>

            {/* Explanation & Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* AI Explanation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-400">
                        <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                        AI Assessment
                    </h3>
                    <p className="text-lg leading-relaxed text-gray-300">
                        {data.explanation}
                    </p>
                </motion.div>

                {/* Gap Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-cyan-400">
                        <span className="w-2 h-8 bg-cyan-500 rounded-full" />
                        Skill Gap Analysis
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Missing Critical Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {data.gap_analysis.missing.length > 0 ? (
                                    data.gap_analysis.missing.map((skill: string) => (
                                        <span key={skill} className="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-full">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-emerald-400 text-sm flex items-center gap-1">
                                        <CheckCircle className="w-4 h-4" /> No major gaps detected
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Verified Proofs (GitHub)</p>
                            <div className="flex flex-wrap gap-2">
                                {data.proof_stats.proven.map((skill: string) => (
                                    <span key={skill} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> {skill}
                                    </span>
                                ))}
                                {data.proof_stats.proven.length === 0 && (
                                    <span className="text-muted-foreground text-sm italic">No skills verified via GitHub</span>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

function ScoreCard({ title, val, icon, delay }: { title: string, val: number, icon: any, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-card/50 border border-white/5 p-6 rounded-xl flex items-center justify-between"
        >
            <div>
                <p className="text-muted-foreground text-xs uppercase font-bold mb-1">{title}</p>
                <p className="text-3xl font-bold text-white">{val}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg text-indigo-400">
                {icon}
            </div>
        </motion.div>
    );
}

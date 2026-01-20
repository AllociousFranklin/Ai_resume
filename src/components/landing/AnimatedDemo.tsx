"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Code2, Briefcase, Github, CheckCircle2 } from "lucide-react";

const scenes = [
    { id: "intro", duration: 3000 },
    { id: "input", duration: 4000 },
    { id: "mapping", duration: 5000 },
    { id: "scoring", duration: 4000 },
    { id: "dashboard", duration: 4000 },
    { id: "outro", duration: 5000 },
];

export function AnimatedDemo() {
    const [currentScene, setCurrentScene] = useState(0);
    const [scoreFill, setScoreFill] = useState(false);

    useEffect(() => {
        const scene = scenes[currentScene];

        // Trigger score animation for scene 3 (scoring)
        if (currentScene === 3) {
            setTimeout(() => setScoreFill(true), 500);
        } else {
            setScoreFill(false);
        }

        const timer = setTimeout(() => {
            setCurrentScene((prev) => (prev + 1) % scenes.length);
        }, scene.duration);

        return () => clearTimeout(timer);
    }, [currentScene]);

    return (
        <div className="w-full h-full bg-slate-50 rounded-b-[2rem] overflow-hidden relative">
            <AnimatePresence mode="wait">
                {/* SCENE 1: Intro */}
                {currentScene === 0 && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <motion.h1
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tight"
                        >
                            Skill<span className="text-blue-600">Snap</span>
                        </motion.h1>
                    </motion.div>
                )}

                {/* SCENE 2: Input (Resume & JD) */}
                {currentScene === 1 && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center gap-8 p-8"
                    >
                        {/* Resume Card */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className="w-56 bg-white rounded-xl shadow-lg border border-slate-200 p-5"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                                <div className="h-2 bg-slate-100 rounded w-full"></div>
                                <div className="h-2 bg-slate-100 rounded w-3/4"></div>
                            </div>
                        </motion.div>

                        {/* JD Card */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="w-56 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-5"
                        >
                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Job Description</p>
                            <div className="space-y-2">
                                <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-2 bg-slate-200 rounded w-full"></div>
                                <div className="h-2 bg-slate-200 rounded w-full"></div>
                                <div className="h-2 bg-slate-200 rounded w-full"></div>
                                <div className="h-2 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* SCENE 3: Mapping */}
                {currentScene === 2 && (
                    <motion.div
                        key="mapping"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center p-8"
                    >
                        {/* SVG Connection Lines */}
                        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                            <motion.path
                                d="M280,180 Q400,180 520,120"
                                fill="none"
                                stroke="#CBD5E1"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.3 }}
                            />
                            <motion.path
                                d="M280,200 Q420,200 520,200"
                                fill="none"
                                stroke="#CBD5E1"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                            <motion.path
                                d="M280,220 Q400,220 520,280"
                                fill="none"
                                stroke="#CBD5E1"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.7 }}
                            />
                        </svg>

                        {/* Central Resume Card */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute left-[15%] w-44 bg-white rounded-xl shadow-lg border border-slate-200 p-4 z-10"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div className="h-3 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                        </motion.div>

                        {/* Extracted Nodes */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute right-[15%] top-[20%] bg-white rounded-lg shadow-md border border-slate-200 px-4 py-3 flex items-center gap-3 z-10"
                        >
                            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                                <Code2 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Skills</p>
                                <p className="text-sm font-semibold text-slate-700">React, Node.js</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="absolute right-[12%] top-[45%] bg-white rounded-lg shadow-md border border-slate-200 px-4 py-3 flex items-center gap-3 z-10"
                        >
                            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Experience</p>
                                <p className="text-sm font-semibold text-slate-700">Senior Engineer</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute right-[15%] bottom-[20%] bg-white rounded-lg shadow-md border border-slate-200 px-4 py-3 flex items-center gap-3 z-10"
                        >
                            <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                                <Github className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400">Verified</p>
                                <p className="text-sm font-semibold text-slate-700">GitHub Profile</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* SCENE 4: Scoring */}
                {currentScene === 3 && (
                    <motion.div
                        key="scoring"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center p-8"
                    >
                        <motion.h2
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-xl font-bold text-slate-800 mb-8"
                        >
                            Verification Complete
                        </motion.h2>

                        <div className="w-full max-w-md space-y-4">
                            {[
                                { label: "Technical", value: 92, color: "bg-indigo-600", textColor: "text-indigo-600" },
                                { label: "Relevance", value: 88, color: "bg-blue-600", textColor: "text-blue-600" },
                                { label: "Resume QA", value: 98, color: "bg-green-600", textColor: "text-green-600" },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + i * 0.2 }}
                                    className="flex items-center gap-4"
                                >
                                    <span className="w-24 text-right text-sm font-semibold text-slate-700">{item.label}</span>
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${item.color} rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: scoreFill ? `${item.value}%` : 0 }}
                                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </div>
                                    <span className={`w-10 text-sm font-bold ${item.textColor}`}>{item.value}%</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* SCENE 5: Dashboard */}
                {currentScene === 4 && (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-sm text-slate-800">Candidates - Senior Frontend</span>
                                <span className="text-xs text-slate-400">Sorted by Relevance</span>
                            </div>
                            {[
                                { name: "John Doe", role: "Full Stack Dev", score: 96, badge: "bg-green-100 text-green-700" },
                                { name: "Sarah Smith", role: "", score: 89, badge: "bg-blue-100 text-blue-700" },
                                { name: "Mike Johnson", role: "", score: 84, badge: "bg-blue-100 text-blue-700" },
                                { name: "Elena R.", role: "", score: 78, badge: "bg-slate-100 text-slate-500" },
                            ].map((c, i) => (
                                <motion.div
                                    key={c.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.15 }}
                                    className="px-4 py-3 flex items-center gap-3 border-b border-slate-50 last:border-b-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {c.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium text-sm text-slate-800">{c.name}</span>
                                        {c.role && <span className="ml-2 text-xs text-slate-400">{c.role}</span>}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.badge}`}>
                                        {c.score} Match
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* SCENE 6: Outro */}
                {currentScene === 5 && (
                    <motion.div
                        key="outro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-6"
                    >
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl font-semibold text-slate-700"
                        >
                            Fair. Explainable. Recruiter-Ready.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-xl font-bold text-slate-400"
                        >
                            Skill<span className="text-blue-600">Snap</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Scene Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {scenes.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === currentScene ? "bg-blue-600" : "bg-slate-300"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

"use client";

import { Github, EyeOff, Calculator, FileBarChart, CheckCircle2 } from "lucide-react";

export function FeaturesGrid() {
    return (
        <section id="product" className="py-32 px-6 relative z-10">
            <div className="max-w-7xl mx-auto space-y-20">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        The only ATS that checks the <span className="text-purple-400">commit history</span>.
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Traditional tools read resumes. SkillSnap reads the actual work.
                        Our engine validates engineering claims against real-world evidence.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Card 1: GitHub Verification (Large) */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:border-purple-500/50 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <Github className="w-6 h-6 text-purple-400" /> GitHub Verification
                            </h3>
                            <p className="text-slate-400 max-w-md">
                                Don't trust the keyword "React". Verify it. We cross-reference claimed skills with actual merged PRs and commit velocity.
                            </p>

                            {/* Visual */}
                            <div className="mt-auto relative h-32 w-full bg-[#0A0A0F] rounded-t-xl border-t border-x border-white/10 overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 flex items-center justify-center gap-12">
                                    <div className="flex flex-col items-center gap-2 opacity-50">
                                        <div className="w-12 h-16 bg-white/10 rounded-sm"></div>
                                        <div className="text-[10px] text-slate-500">RESUME</div>
                                    </div>
                                    <div className="h-px w-24 bg-green-500/50 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <CheckCircle2 className="w-3 h-3 text-[#0A0A0F]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <Github className="w-12 h-12 text-white" />
                                        <div className="text-[10px] text-slate-500">VERIFIED</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Blind Mode */}
                    <div className="md:col-span-1 relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:border-purple-500/50 transition-colors">
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <EyeOff className="w-5 h-5 text-blue-400" /> Blind Mode
                            </h3>
                            <p className="text-slate-400 text-sm mb-8">
                                Eliminate unconscious bias. Toggle candidate details to focus purely on merit and metrics.
                            </p>

                            <div className="mt-auto flex items-center justify-center p-6 bg-[#0A0A0F] rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="text-sm font-bold text-slate-500">OFF</div>
                                    <div className="w-12 h-6 bg-purple-600 rounded-full relative cursor-pointer shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="text-sm font-bold text-white">ON</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Transparent Scoring */}
                    <div className="md:col-span-1 relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:border-purple-500/50 transition-colors">
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-green-400" /> Transparent Math
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                No "AI Black Box". Just clear, explainable formulas you can trust.
                            </p>

                            <div className="mt-auto flex flex-col items-center justify-center p-4 bg-[#0A0A0F] rounded-xl border border-white/5 font-mono text-sm leading-8">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Score = </span>
                                    <span className="px-2 py-1 bg-white/10 rounded text-blue-300">ATS</span>
                                    <span>+</span>
                                    <span className="px-2 py-1 bg-white/10 rounded text-green-300">Proof</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Interactive Reports (Large) */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 hover:border-purple-500/50 transition-colors">
                        <div className="relative z-10 h-full flex flex-col">
                            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                <FileBarChart className="w-6 h-6 text-pink-400" /> Interactive Reports
                            </h3>
                            <p className="text-slate-400 max-w-md">
                                Generate shareable, deep-dive candidate packets for hiring managers. Complete with code snippets and project velocity graphs.
                            </p>

                            <div className="mt-auto relative h-32 w-full bg-[#0A0A0F] rounded-t-xl border-t border-x border-white/10 overflow-hidden p-4 grid grid-cols-3 gap-4">
                                <div className="bg-white/5 rounded h-full animate-pulse"></div>
                                <div className="bg-white/5 rounded h-full animate-pulse delay-100"></div>
                                <div className="bg-white/5 rounded h-full animate-pulse delay-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

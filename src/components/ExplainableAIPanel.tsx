"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertTriangle, Info, ShieldCheck, Github } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ExplainableAIPanelProps {
    explanation: string;
    matchedSkills: string[];
    missingSkills: string[];
    criticalMisses?: string[];
    proofEvidence?: {
        proven: string[];
        inferred: string[];
        missing: string[];
    };
    githubProof?: string[];
    recommendation: {
        label: string;
        recommendation: string;
    };
}

export function ExplainableAIPanel({
    explanation,
    matchedSkills,
    missingSkills,
    criticalMisses = [],
    proofEvidence,
    githubProof = [],
    recommendation,
}: ExplainableAIPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-gray-900">Evaluation Logic & Summary</span>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                </button>
            </div>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 space-y-8">
                            {/* Detailed Explanation */}
                            <div className="relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-blue-600" />
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Executive Summary</h4>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                    {explanation}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Competency Alignment */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Proficiency Match
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {matchedSkills.slice(0, 12).map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-md"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {matchedSkills.length > 12 && (
                                            <span className="text-xs text-gray-500 font-medium py-1">
                                                + {matchedSkills.length - 12} additional
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Engineering Footprint Verification */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Github className="w-3 h-3 text-gray-900" /> Foundational Evidence
                                    </h4>
                                    <div className="space-y-2">
                                        {githubProof.slice(0, 4).map((proof, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                                {proof}
                                            </div>
                                        ))}
                                        {githubProof.length === 0 && (
                                            <p className="text-sm text-gray-500 italic">No automated verification data available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Summary */}
                            {proofEvidence && (
                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified History</span>
                                            <span className="text-lg font-bold text-green-600">{proofEvidence.proven.length} items</span>
                                        </div>
                                        <div className="h-8 w-px bg-gray-200" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inferred Skillset</span>
                                            <span className="text-lg font-bold text-blue-600">{proofEvidence.inferred.length} items</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                        <Info className="w-3 h-3" />
                                        <span>Data-driven evaluation</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}


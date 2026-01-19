"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, XCircle, AlertCircle, Lightbulb } from "lucide-react";
import { useState } from "react";

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
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-border rounded-xl overflow-hidden bg-card">
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-primary" />
                    <span className="font-medium">Why this score?</span>
                </div>
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
            </button>

            {/* Expandable Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-4">
                            {/* AI Explanation */}
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                                <p className="text-sm leading-relaxed">{explanation}</p>
                            </div>

                            {/* Critical Misses Warning */}
                            {criticalMisses.length > 0 && (
                                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-destructive" />
                                        <span className="text-sm font-semibold text-destructive">
                                            Critical Skill Gaps
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {criticalMisses.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Matched Skills */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-semibold">
                                        Matched Skills ({matchedSkills.length})
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {matchedSkills.slice(0, 8).map((skill, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {matchedSkills.length > 8 && (
                                        <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                                            +{matchedSkills.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            {missingSkills.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-semibold">
                                            Missing Skills ({missingSkills.length})
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {missingSkills.slice(0, 6).map((skill, i) => (
                                            <span
                                                key={i}
                                                className={`px-2 py-0.5 text-xs rounded-full ${criticalMisses.includes(skill)
                                                        ? "bg-destructive/20 text-destructive"
                                                        : "bg-amber-500/20 text-amber-500"
                                                    }`}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {missingSkills.length > 6 && (
                                            <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                                                +{missingSkills.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* GitHub Proof */}
                            {githubProof.length > 0 && (
                                <div className="pt-2 border-t border-border">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        GitHub Evidence
                                    </span>
                                    <ul className="mt-2 space-y-1">
                                        {githubProof.map((proof, i) => (
                                            <li key={i} className="text-sm flex items-center gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                {proof}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Proof Evidence Detail */}
                            {proofEvidence && (
                                <div className="pt-2 border-t border-border">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                        Skill Verification
                                    </span>
                                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                        <div className="p-2 bg-green-500/10 rounded-lg text-center">
                                            <div className="text-lg font-bold text-green-500">
                                                {proofEvidence.proven.length}
                                            </div>
                                            <div className="text-muted-foreground">Proven</div>
                                        </div>
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-center">
                                            <div className="text-lg font-bold text-blue-500">
                                                {proofEvidence.inferred.length}
                                            </div>
                                            <div className="text-muted-foreground">Inferred</div>
                                        </div>
                                        <div className="p-2 bg-amber-500/10 rounded-lg text-center">
                                            <div className="text-lg font-bold text-amber-500">
                                                {proofEvidence.missing.length}
                                            </div>
                                            <div className="text-muted-foreground">Unverified</div>
                                        </div>
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

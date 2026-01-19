"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, X } from "lucide-react";
import { ScoreGauge, SkillRadarChart } from "./visualizations/Charts";

interface CandidateData {
    name: string;
    score: number;
    atsScore: number;
    githubScore: number;
    proofScore: number;
    qualityScore: number;
    skillBreakdown: {
        technical: number;
        tools: number;
        soft: number;
    };
    matchedSkills: string[];
    missingSkills: string[];
}

interface ComparisonViewProps {
    candidate1: CandidateData;
    candidate2: CandidateData;
    onClose: () => void;
}

export function ComparisonView({ candidate1, candidate2, onClose }: ComparisonViewProps) {
    const getDelta = (a: number, b: number) => a - b;

    const DeltaIndicator = ({ value }: { value: number }) => {
        if (value > 0) {
            return (
                <span className="flex items-center gap-1 text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    +{value}
                </span>
            );
        } else if (value < 0) {
            return (
                <span className="flex items-center gap-1 text-red-500 text-sm">
                    <TrendingDown className="w-4 h-4" />
                    {value}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-muted-foreground text-sm">
                <Minus className="w-4 h-4" />
                0
            </span>
        );
    };

    const winner =
        candidate1.score > candidate2.score
            ? candidate1.name
            : candidate2.score > candidate1.score
                ? candidate2.name
                : "Tie";

    const radarData1 = [
        { name: "Tech", value: candidate1.skillBreakdown.technical },
        { name: "Tools", value: candidate1.skillBreakdown.tools },
        { name: "Soft", value: candidate1.skillBreakdown.soft },
        { name: "ATS", value: candidate1.atsScore },
        { name: "GitHub", value: candidate1.githubScore },
    ];

    const radarData2 = [
        { name: "Tech", value: candidate2.skillBreakdown.technical },
        { name: "Tools", value: candidate2.skillBreakdown.tools },
        { name: "Soft", value: candidate2.skillBreakdown.soft },
        { name: "ATS", value: candidate2.atsScore },
        { name: "GitHub", value: candidate2.githubScore },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Candidate Comparison</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Winner Banner */}
                <div className="px-6 py-4 bg-primary/10 border-b border-primary/20">
                    <div className="flex items-center justify-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="font-semibold">
                            {winner === "Tie"
                                ? "It's a tie!"
                                : `${winner} is the stronger candidate`}
                        </span>
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="p-6">
                    {/* Score Gauges */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="flex flex-col items-center">
                            <ScoreGauge score={candidate1.score} label={candidate1.name} size="md" />
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-muted-foreground">VS</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <ScoreGauge score={candidate2.score} label={candidate2.name} size="md" />
                        </div>
                    </div>

                    {/* Radar Charts */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-semibold text-center mb-2">{candidate1.name}</h3>
                            <SkillRadarChart data={radarData1} size={180} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-center mb-2">{candidate2.name}</h3>
                            <SkillRadarChart data={radarData2} size={180} />
                        </div>
                    </div>

                    {/* Score Breakdown Table */}
                    <div className="border border-border rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Metric</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">
                                        {candidate1.name}
                                    </th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">Delta</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold">
                                        {candidate2.name}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { label: "Final Score", v1: candidate1.score, v2: candidate2.score },
                                    { label: "ATS Score", v1: candidate1.atsScore, v2: candidate2.atsScore },
                                    { label: "GitHub Score", v1: candidate1.githubScore, v2: candidate2.githubScore },
                                    { label: "Proof Score", v1: candidate1.proofScore, v2: candidate2.proofScore },
                                    { label: "Quality Score", v1: candidate1.qualityScore, v2: candidate2.qualityScore },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-sm">{row.label}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`font-semibold ${row.v1 > row.v2
                                                        ? "text-green-500"
                                                        : row.v1 < row.v2
                                                            ? "text-muted-foreground"
                                                            : ""
                                                    }`}
                                            >
                                                {row.v1}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <DeltaIndicator value={getDelta(row.v1, row.v2)} />
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={`font-semibold ${row.v2 > row.v1
                                                        ? "text-green-500"
                                                        : row.v2 < row.v1
                                                            ? "text-muted-foreground"
                                                            : ""
                                                    }`}
                                            >
                                                {row.v2}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Skill Overlap */}
                    <div className="mt-6 grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-semibold mb-2">
                                {candidate1.name} Matched Skills ({candidate1.matchedSkills.length})
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {candidate1.matchedSkills.slice(0, 8).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold mb-2">
                                {candidate2.name} Matched Skills ({candidate2.matchedSkills.length})
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {candidate2.matchedSkills.slice(0, 8).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2 py-0.5 text-xs bg-green-500/20 text-green-500 rounded-full"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

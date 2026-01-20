"use client";

import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Minus, X, ArrowRightLeft } from "lucide-react";
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
                <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded">
                    <TrendingUp className="w-3 h-3" />
                    +{value}
                </span>
            );
        } else if (value < 0) {
            return (
                <span className="flex items-center gap-1 text-red-600 font-bold text-sm bg-red-50 px-2 py-0.5 rounded">
                    <TrendingDown className="w-3 h-3" />
                    {value}
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-gray-400 text-sm">
                <Minus className="w-3 h-3" />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-hidden"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-white border border-gray-200 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Side-by-Side Comparison</h2>
                            <p className="text-sm text-gray-500">Evaluating core competencies and fit</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Winner Banner */}
                <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-center gap-3">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-gray-800">
                            {winner === "Tie"
                                ? "Current evaluation shows a statistical tie."
                                : `${winner} leads in overall match score.`}
                        </span>
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="p-8">
                    {/* Score Gauges */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <ScoreGauge score={candidate1.score} label={candidate1.name} size="md" />
                            <p className="mt-4 text-sm font-bold text-gray-900 uppercase tracking-widest">{candidate1.name}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                <span className="text-xs font-black text-gray-400">VS</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <ScoreGauge score={candidate2.score} label={candidate2.name} size="md" />
                            <p className="mt-4 text-sm font-bold text-gray-900 uppercase tracking-widest">{candidate2.name}</p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        {/* Radar Comparison */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Competency Mapping</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-900 mb-4">{candidate1.name}</p>
                                    <SkillRadarChart data={radarData1} size={150} />
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200">
                                    <p className="text-xs font-bold text-gray-900 mb-4">{candidate2.name}</p>
                                    <SkillRadarChart data={radarData2} size={150} />
                                </div>
                            </div>
                        </div>

                        {/* Metric Comparison */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Core Metrics</h3>
                            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Metric</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900">C1</th>
                                            <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delta</th>
                                            <th className="px-4 py-3 text-center text-xs font-bold text-gray-900">C2</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[
                                            { label: "Final Score", v1: candidate1.score, v2: candidate2.score, primary: true },
                                            { label: "ATS Semantic Match", v1: candidate1.atsScore, v2: candidate2.atsScore },
                                            { label: "Evidence Proof", v1: candidate1.proofScore, v2: candidate2.proofScore },
                                            { label: "Engineering Depth", v1: candidate1.githubScore, v2: candidate2.githubScore },
                                            { label: "Project Quality", v1: candidate1.qualityScore, v2: candidate2.qualityScore },
                                        ].map((row, i) => (
                                            <tr key={i} className={row.primary ? "bg-blue-50/30" : ""}>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.label}</td>
                                                <td className="px-4 py-3 text-center font-bold text-gray-900">{row.v1}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <DeltaIndicator value={getDelta(row.v1, row.v2)} />
                                                </td>
                                                <td className="px-4 py-3 text-center font-bold text-gray-900">{row.v2}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Skill Highlights */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {candidate1.name}: Top Proficiencies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {candidate1.matchedSkills.slice(0, 10).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-md shadow-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                                {candidate2.name}: Top Proficiencies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {candidate2.matchedSkills.slice(0, 10).map((skill, i) => (
                                    <span
                                        key={i}
                                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 text-gray-700 rounded-md shadow-sm"
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


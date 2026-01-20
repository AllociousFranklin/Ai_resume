"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Github,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Award,
    Target,
    BarChart3,
    User,
    ChevronRight,
    Download,
    LayoutDashboard,
    Code2,
    Search,
    BrainCircuit,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import CandidateActions from "./CandidateActions";
import { ScoreGauge, AnimatedProgressBar, SkillRadarChart } from "./visualizations/Charts";
import { ExplainableAIPanel } from "./ExplainableAIPanel";
import { generateCandidateReport } from "@/lib/pdf-export";

interface DashboardProps {
    data: any;
    onReset?: () => void;
}

type TabType = "overview" | "skills" | "engineering" | "insights";

export default function Dashboard({ data, onReset }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>("overview");

    const recommendation = data.recommendation;

    const tabs = [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "skills", label: "Skill Profile", icon: Target },
        { id: "engineering", label: "Engineering Depth", icon: Code2 },
        { id: "insights", label: "Hiring Insights", icon: BrainCircuit },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            {/* Top Bar / Actions */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">
                                {data.metadata?.candidate_name || "Anonymous Candidate"}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">
                                {data.metadata?.candidate_email || "No email provided"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => generateCandidateReport({
                                name: data.metadata?.candidate_name || "Candidate",
                                email: data.metadata?.candidate_email,
                                phone: data.metadata?.candidate_phone,
                                finalScore: data.final_score,
                                recommendation: data.recommendation?.label || "Review",
                                atsScore: data.ats?.score || 0,
                                githubScore: data.github?.score || 0,
                                proofScore: data.proof?.score || 0,
                                qualityScore: data.quality?.score || 0,
                                matchedSkills: data.ats?.matched_skills || [],
                                missingSkills: data.ats?.missing_skills || [],
                                explanation: data.explanation || "",
                                githubProof: data.github?.proof || [],
                            })}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export Report
                        </button>
                        {onReset && (
                            <button
                                onClick={onReset}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                New Analysis
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub-Navigation (Tabs) */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "flex items-center gap-2 py-4 text-sm font-medium transition-colors border-b-2 relative",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                                )}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            {/* Left Column: Essential Metrics */}
                            <div className="space-y-6">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 flex flex-col items-center text-center">
                                    <ScoreGauge
                                        score={data.final_score}
                                        label="Overall Fit Score"
                                        size="lg"
                                    />
                                    <div className={cn(
                                        "mt-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                        recommendation?.color === "emerald" || recommendation?.color === "green"
                                            ? "bg-green-50 text-green-700 border border-green-100"
                                            : recommendation?.color === "amber"
                                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                                : "bg-red-50 text-red-700 border border-red-100"
                                    )}>
                                        {recommendation?.label || "Evaluation Complete"}
                                    </div>
                                    <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                                        Candidate fits the <span className="font-semibold text-gray-900 capitalize">{data.cluster?.type?.replace(/_/g, " ") || "standard"}</span> profile with focus on {data.cluster?.traits?.[0] || 'technical excellence'}.
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-4 h-4 text-blue-600" /> Executive Summary
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">ATS Match</span>
                                            <span className="font-bold text-gray-900">{data.ats?.score}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Skill Verification</span>
                                            <span className="font-bold text-gray-900">{data.proof?.score}%</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Experience Impact</span>
                                            <span className="font-bold text-gray-900">{data.github?.score}%</span>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100">
                                            <CandidateActions
                                                candidateName={data.metadata?.candidate_name}
                                                candidateEmail={data.metadata?.candidate_email}
                                                recommendation={data.recommendation?.recommendation}
                                                githubUsername={data.github?.username}
                                                finalScore={data.final_score}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center/Right Column: Evaluator Insights */}
                            <div className="lg:col-span-2 space-y-6">
                                <ExplainableAIPanel
                                    explanation={data.explanation || "Analysis complete."}
                                    matchedSkills={data.ats?.matched_skills || []}
                                    missingSkills={data.ats?.missing_skills || []}
                                    criticalMisses={data.gap_analysis?.critical_gaps || []}
                                    proofEvidence={{
                                        proven: data.proof?.proven || [],
                                        inferred: data.proof?.inferred || [],
                                        missing: data.proof?.missing || []
                                    }}
                                    githubProof={data.github?.proof || []}
                                    recommendation={data.recommendation || { label: "Review", recommendation: "review" }}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Core Strengths</h4>
                                        <div className="space-y-2">
                                            {data.proof?.proven?.slice(0, 4).map((s: string) => (
                                                <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <CheckCircle className="w-4 h-4 text-green-500" /> {s}
                                                </div>
                                            ))}
                                            {(!data.proof?.proven || data.proof?.proven.length === 0) && (
                                                <p className="text-sm text-gray-500">No verified strengths found.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Attention Areas</h4>
                                        <div className="space-y-2">
                                            {data.gap_analysis?.critical_gaps?.slice(0, 4).map((s: string) => (
                                                <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <AlertTriangle className="w-4 h-4 text-amber-500" /> {s}
                                                </div>
                                            ))}
                                            {(!data.gap_analysis?.critical_gaps || data.gap_analysis?.critical_gaps.length === 0) && (
                                                <p className="text-sm text-gray-500">No critical gaps identified.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "skills" && (
                        <motion.div
                            key="skills"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white border border-gray-200 rounded-xl shadow-sm p-8"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Technical Skill Matrix</h3>
                                        <p className="text-gray-500 text-sm mt-1">Quantified competency across candidate's primary domains.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <AnimatedProgressBar
                                            value={data.ats?.breakdown?.skillMatch || 0}
                                            label="Core Technical Proficiencies"
                                            color="primary"
                                        />
                                        <AnimatedProgressBar
                                            value={data.ats?.breakdown?.toolMatch || 0}
                                            label="Systems & Tooling"
                                            color="primary"
                                        />
                                        <AnimatedProgressBar
                                            value={data.ats?.breakdown?.softMatch || 0}
                                            label="Interpersonal & Strategic"
                                            color="primary"
                                        />
                                        <AnimatedProgressBar
                                            value={data.github?.score || 0}
                                            label="Application Accuracy (Practical Proof)"
                                            color={data.github?.score >= 70 ? "success" : data.github?.score >= 40 ? "warning" : "danger"}
                                        />
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Matched Competencies</p>
                                            <p className="text-2xl font-bold text-gray-900">{data.ats?.matched_skills?.length || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Requirement Gaps</p>
                                            <p className="text-2xl font-bold text-blue-600">{data.ats?.missing_skills?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                    <SkillRadarChart
                                        data={[
                                            { name: "Technical", value: data.ats?.breakdown?.skillMatch || 50 },
                                            { name: "Tools", value: data.ats?.breakdown?.toolMatch || 50 },
                                            { name: "Strategic", value: data.ats?.breakdown?.softMatch || 50 },
                                            { name: "Verified", value: data.proof?.score || 0 },
                                            { name: "Doc Quality", value: data.quality?.score || 50 },
                                        ]}
                                        size={320}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "engineering" && (
                        <motion.div
                            key="engineering"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="md:col-span-1 space-y-4">
                                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                        <Github className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {data.github?.username ? `@${data.github.username}` : "Not Found"}
                                        </h3>
                                        <p className="text-sm text-gray-500">Contribution Analytics</p>
                                    </div>
                                    <div className="pt-4 space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <History className="w-4 h-4" /> {data.github?.stats?.activeRepos || 0} Active Repos
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <TrendingUp className="w-4 h-4" /> {data.github?.velocity?.trend || "Stable"} Trend
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <EngineeringStatCard
                                        label="Technical Breadth"
                                        value={data.github?.stats?.topLanguage || "N/A"}
                                        subtext="Primary Focus"
                                    />
                                    <EngineeringStatCard
                                        label="Commit Frequency"
                                        value={`${data.github?.stats?.avgCommitsPerWeek || 0}`}
                                        subtext="Avg Commits / Week"
                                    />
                                    <EngineeringStatCard
                                        label="Project Seniority"
                                        value={`${data.project_depth?.complexity || 0}/100`}
                                        subtext="Avg Logic Complexity"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                    <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-blue-600" /> Engineering Evidence
                                    </h4>
                                    <div className="space-y-4">
                                        {data.github?.proof?.map((p: string, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                                                <span className="text-sm font-medium text-green-700">{p}</span>
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                            </div>
                                        ))}
                                        {(!data.github?.proof || data.github?.proof.length === 0) && (
                                            <div className="text-center py-8">
                                                <p className="text-sm text-gray-500 italic">No automated evidence available for this profile.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                    <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Search className="w-4 h-4 text-blue-600" /> Project Surface Analysis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Deep Projects</p>
                                            <p className="text-2xl font-bold text-gray-900">{data.project_depth?.deep_projects || 0}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Surface Projects</p>
                                            <p className="text-2xl font-bold text-gray-900">{data.project_depth?.surface_projects || 0}</p>
                                        </div>
                                    </div>
                                    <p className="mt-6 text-sm text-gray-600 leading-relaxed italic border-l-2 border-gray-200 pl-4">
                                        {data.project_depth?.recommendation || "Maintain evaluation based on provided resume details."}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "insights" && (
                        <motion.div
                            key="insights"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* Candidate Evaluation Summary Card */}
                            {data.predictions && (
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-8 flex items-center gap-2">
                                        <BrainCircuit className="w-5 h-5 text-blue-600" /> Hiring Intelligence Summary
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                        <InsightCard
                                            title="Performance Probability"
                                            value={`${Math.round((data.predictions?.success?.probability || 0.65) * 100)}%`}
                                            confidence={data.predictions?.success?.confidence}
                                        />
                                        <InsightCard
                                            title="Retainability Forecast"
                                            value={`${Math.round((data.predictions?.retention?.two_year_probability || 0.7) * 100)}%`}
                                            subtext="2-Year Window"
                                        />
                                        <InsightCard
                                            title="Trajectory"
                                            value={data.predictions?.growth?.trajectory || 'Steady'}
                                            type="text"
                                        />
                                        <InsightCard
                                            title="Productivity Lead-time"
                                            value={data.predictions?.rampUp?.weeksToProductivity || data.predictions?.ramp_up?.weeks || 5}
                                            subtext="Approx Weeks"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Resume Quality Breakdown */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                                    <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-blue-600" /> Documentation Standard
                                    </h4>
                                    <div className="grid grid-cols-3 gap-6 mb-8">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{data.quality?.formatting || 0}%</p>
                                            <p className="text-xs text-gray-500 font-medium">Layout</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{data.quality?.achievements || 0}%</p>
                                            <p className="text-xs text-gray-500 font-medium">Quantification</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-gray-900">{data.quality?.clarity || 0}%</p>
                                            <p className="text-xs text-gray-500 font-medium">Communication</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Expert Recommendations</p>
                                        {data.quality?.improvements?.map((imp: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" /> {imp}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bias & Integrity Awareness */}
                                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col">
                                    <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-600" /> Bias-Controlled Evaluation
                                    </h4>
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl",
                                                data.bias_analysis?.risk_level === "low" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                                            )}>
                                                {data.bias_analysis?.risk_level?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 capitalize italic">Risk Level: {data.bias_analysis?.risk_level || "low"}</p>
                                                <p className="text-xs text-gray-500">Automated identity protection active</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {data.bias_analysis?.details || "Evaluation conducted with focus on skills and proven history, mitigating demographic signal bias."}
                                        </p>
                                        {data.bias_analysis?.redactions?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                                                {data.bias_analysis.redactions.map((r: any, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] uppercase font-bold rounded">
                                                        {r.count}x {r.type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// Sub-components

function EngineeringStatCard({ label, value, subtext }: { label: string; value: string; subtext: string }) {
    return (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900 truncate">{value}</p>
            <p className="text-[10px] text-gray-500 font-medium mt-1">{subtext}</p>
        </div>
    );
}

function InsightCard({ title, value, type = "perc", subtext, confidence }: { title: string; value: string | number; type?: "perc" | "text"; subtext?: string; confidence?: number }) {
    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{title}</p>
            <p className={cn(
                "text-2xl font-bold",
                type === "text" ? "text-blue-600" : "text-gray-900"
            )}>
                {value}{type === "perc" && !value.toString().includes('%') ? '%' : ''}
            </p>
            {(subtext || confidence !== undefined) && (
                <p className="text-[10px] text-gray-500 font-medium">
                    {confidence !== undefined ? `${Math.round(confidence * 100)}% Confidence` : subtext}
                </p>
            )}
        </div>
    );
}



"use client";

import { motion } from "framer-motion";
import {
    FileText,
    Github,
    CheckCircle,
    AlertTriangle,
    XCircle,
    TrendingUp,
    Award,
    Zap,
    Target,
    BarChart3,
    Clock,
    User,
    Sparkles,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
    data: any;
    onReset: () => void;
}

export default function Dashboard({ data, onReset }: DashboardProps) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        return "text-rose-400";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "from-emerald-500/20 to-emerald-500/5";
        if (score >= 60) return "from-amber-500/20 to-amber-500/5";
        return "from-rose-500/20 to-rose-500/5";
    };

    const recommendation = data.recommendation;

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Candidate Analysis Report
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Processed in {data.processing_time_ms}ms
                    </p>
                </div>
                <button
                    onClick={onReset}
                    className="px-4 py-2 bg-secondary hover:bg-muted text-sm rounded-lg transition-colors"
                >
                    Analyze Another
                </button>
            </motion.div>

            {/* Main Score Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                        "lg:col-span-1 glass p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden",
                        "bg-gradient-to-br", getScoreBg(data.final_score)
                    )}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 z-0" />
                    <h3 className="text-muted-foreground uppercase tracking-widest text-xs font-semibold z-10">
                        Fit Score
                    </h3>
                    <div className={cn("text-6xl md:text-7xl font-black mt-2 mb-1 z-10", getScoreColor(data.final_score))}>
                        {data.final_score}
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-10",
                        recommendation?.color === "emerald" && "bg-emerald-500/20 text-emerald-400",
                        recommendation?.color === "green" && "bg-green-500/20 text-green-400",
                        recommendation?.color === "amber" && "bg-amber-500/20 text-amber-400",
                        recommendation?.color === "rose" && "bg-rose-500/20 text-rose-400"
                    )}>
                        {recommendation?.label || "Analysis Complete"}
                    </div>
                </motion.div>

                {/* Score Breakdown */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <ScoreCard
                        title="ATS Score"
                        value={data.ats?.score || 0}
                        icon={<FileText className="w-4 h-4" />}
                        delay={0.15}
                    />
                    <ScoreCard
                        title="GitHub Impact"
                        value={data.github?.score || 0}
                        icon={<Github className="w-4 h-4" />}
                        delay={0.2}
                    />
                    <ScoreCard
                        title="Proof Index"
                        value={data.proof?.score || 0}
                        icon={<CheckCircle className="w-4 h-4" />}
                        delay={0.25}
                    />
                    <ScoreCard
                        title="Resume Quality"
                        value={data.quality?.score || 0}
                        icon={<Award className="w-4 h-4" />}
                        delay={0.3}
                    />
                </div>
            </div>

            {/* Candidate Cluster Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-card p-4 rounded-xl flex flex-wrap items-center gap-4"
            >
                <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span className="text-sm text-muted-foreground">Candidate Type:</span>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium capitalize">
                        {data.cluster?.type?.replace(/_/g, " ") || "Unknown"}
                    </span>
                </div>
                {data.cluster?.traits?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.cluster.traits.map((trait: string, i: number) => (
                            <span
                                key={i}
                                className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs"
                            >
                                {trait}
                            </span>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Explanation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                        AI Assessment
                    </h3>
                    <p className="text-base leading-relaxed text-gray-300">
                        {data.explanation}
                    </p>
                </motion.div>

                {/* Skills Gap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-cyan-400">
                        <Target className="w-5 h-5" />
                        Skills Match ({data.gap_analysis?.match_percentage || 0}%)
                    </h3>

                    {/* Critical Gaps */}
                    {data.gap_analysis?.critical_gaps?.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs uppercase tracking-wider text-rose-400 mb-2">Critical Missing</p>
                            <div className="flex flex-wrap gap-2">
                                {data.gap_analysis.critical_gaps.map((skill: string) => (
                                    <span key={skill} className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-full">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Proven Skills */}
                    {data.proof?.proven?.length > 0 && (
                        <div>
                            <p className="text-xs uppercase tracking-wider text-emerald-400 mb-2">Verified via GitHub</p>
                            <div className="flex flex-wrap gap-2">
                                {data.proof.proven.slice(0, 8).map((skill: string) => (
                                    <span key={skill} className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* GitHub & Growth Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GitHub Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-5 rounded-xl"
                >
                    <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                        <Github className="w-4 h-4" /> GitHub Profile
                    </h4>
                    {data.github?.username ? (
                        <div className="space-y-2 text-sm">
                            <StatRow label="Username" value={`@${data.github.username}`} />
                            <StatRow label="Original Repos" value={data.github.stats?.originalRepos || 0} />
                            <StatRow label="Total Stars" value={data.github.stats?.totalStars || 0} />
                            <StatRow label="Active Repos" value={data.github.stats?.activeRepos || 0} />
                            <StatRow label="Top Language" value={data.github.stats?.topLanguage || "N/A"} />
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No GitHub profile found</p>
                    )}
                </motion.div>

                {/* Velocity & Growth */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="glass-card p-5 rounded-xl"
                >
                    <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Growth Analysis
                    </h4>
                    <div className="space-y-2 text-sm">
                        <StatRow label="Growth Score" value={`${data.skill_evolution?.growth_score || 0}/100`} />
                        <StatRow
                            label="Learning Velocity"
                            value={data.skill_evolution?.learning_velocity || "N/A"}
                            valueClass={
                                data.skill_evolution?.learning_velocity === "fast" ? "text-emerald-400" :
                                    data.skill_evolution?.learning_velocity === "slow" ? "text-rose-400" : ""
                            }
                        />
                        <StatRow label="Coding Trend" value={data.github?.velocity?.trend || "N/A"} />
                        <StatRow label="Commits/Week" value={data.github?.stats?.avgCommitsPerWeek || 0} />
                    </div>
                </motion.div>

                {/* Project Depth */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-card p-5 rounded-xl"
                >
                    <h4 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Project Analysis
                    </h4>
                    <div className="space-y-2 text-sm">
                        <StatRow label="Avg Complexity" value={`${data.project_depth?.complexity || 0}/100`} />
                        <StatRow label="Deep Projects" value={data.project_depth?.deep_projects || 0} />
                        <StatRow label="Surface Projects" value={data.project_depth?.surface_projects || 0} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 italic">
                        {data.project_depth?.recommendation}
                    </p>
                </motion.div>
            </div>

            {/* ML Predictions */}
            {data.predictions && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.62 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h4 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> AI Predictions
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <PredictionCard
                            title="Success Probability"
                            value={`${Math.round(data.predictions.success.probability * 100)}%`}
                            confidence={data.predictions.success.confidence}
                        />
                        <PredictionCard
                            title="2-Year Retention"
                            value={`${Math.round(data.predictions.retention.two_year_probability * 100)}%`}
                        />
                        <PredictionCard
                            title="Growth Potential"
                            value={data.predictions.growth.trajectory}
                            isText
                        />
                        <PredictionCard
                            title="Ramp-up Time"
                            value={`${data.predictions.ramp_up.weeks} weeks`}
                        />
                    </div>

                    {/* Success Factors */}
                    {data.predictions.success.factors?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Impact Factors</p>
                            <div className="flex flex-wrap gap-2">
                                {data.predictions.success.factors.map((f: any, i: number) => (
                                    <span
                                        key={i}
                                        className={cn(
                                            "px-2 py-1 text-xs rounded-full flex items-center gap-1",
                                            f.impact === "positive" && "bg-emerald-500/10 text-emerald-400",
                                            f.impact === "negative" && "bg-rose-500/10 text-rose-400",
                                            f.impact === "neutral" && "bg-gray-500/10 text-gray-400"
                                        )}
                                    >
                                        {f.impact === "positive" && <TrendingUp className="w-3 h-3" />}
                                        {f.impact === "negative" && <AlertTriangle className="w-3 h-3" />}
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Bias Analysis */}
            {data.bias_analysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.64 }}
                    className={cn(
                        "glass-card p-4 rounded-xl flex flex-wrap items-center gap-4",
                        data.bias_analysis.risk_level === "high" && "border border-amber-500/20",
                        data.bias_analysis.risk_level === "low" && "border border-emerald-500/20"
                    )}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Bias Risk:</span>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium capitalize",
                            data.bias_analysis.risk_level === "low" && "bg-emerald-500/20 text-emerald-400",
                            data.bias_analysis.risk_level === "medium" && "bg-amber-500/20 text-amber-400",
                            data.bias_analysis.risk_level === "high" && "bg-rose-500/20 text-rose-400"
                        )}>
                            {data.bias_analysis.risk_level}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{data.bias_analysis.details}</p>
                    {data.bias_analysis.redactions?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {data.bias_analysis.redactions.map((r: any, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-white/5 text-gray-500 text-xs rounded">
                                    {r.count}x {r.type}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Resume Quality */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="glass-card p-5 rounded-xl"
            >
                <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Resume Quality Breakdown
                </h4>
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <QualityMeter label="Formatting" value={data.quality?.formatting || 0} />
                    <QualityMeter label="Achievements" value={data.quality?.achievements || 0} />
                    <QualityMeter label="Clarity" value={data.quality?.clarity || 0} />
                </div>
                {data.quality?.improvements?.length > 0 && (
                    <div>
                        <p className="text-xs uppercase tracking-wider text-amber-400 mb-2">Suggestions</p>
                        <ul className="space-y-1">
                            {data.quality.improvements.map((imp: string, i: number) => (
                                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                    <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                    {imp}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>

            {/* Proof Details */}
            {data.github?.proof?.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap gap-2"
                >
                    {data.github.proof.map((p: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> {p}
                        </span>
                    ))}
                    {data.github.risks?.map((r: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 text-sm rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {r}
                        </span>
                    ))}
                </motion.div>
            )}
        </div>
    );
}

// Sub-components
function ScoreCard({ title, value, icon, delay }: { title: string; value: number; icon: any; delay: number }) {
    const getColor = (v: number) => v >= 70 ? "text-emerald-400" : v >= 50 ? "text-amber-400" : "text-rose-400";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-card/50 border border-white/5 p-4 rounded-xl"
        >
            <div className="flex items-center justify-between mb-2">
                <p className="text-muted-foreground text-xs uppercase font-semibold">{title}</p>
                <div className="p-2 bg-white/5 rounded-lg text-indigo-400">
                    {icon}
                </div>
            </div>
            <p className={cn("text-3xl font-bold", getColor(value))}>{value}</p>
        </motion.div>
    );
}

function StatRow({ label, value, valueClass = "" }: { label: string; value: string | number; valueClass?: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-muted-foreground">{label}</span>
            <span className={cn("font-medium text-white", valueClass)}>{value}</span>
        </div>
    );
}

function QualityMeter({ label, value }: { label: string; value: number }) {
    const getColor = (v: number) => v >= 70 ? "bg-emerald-500" : v >= 50 ? "bg-amber-500" : "bg-rose-500";

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{label}</span>
                <span className="text-white font-medium">{value}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn("h-full rounded-full transition-all", getColor(value))}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function PredictionCard({
    title,
    value,
    confidence,
    isText = false
}: {
    title: string;
    value: string;
    confidence?: number;
    isText?: boolean;
}) {
    return (
        <div className="bg-white/5 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className={cn(
                "text-lg font-bold",
                isText ? "text-purple-400 capitalize" : "text-white"
            )}>
                {value}
            </p>
            {confidence !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                    {Math.round(confidence * 100)}% confidence
                </p>
            )}
        </div>
    );
}


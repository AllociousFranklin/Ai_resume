"use client";

import { motion } from "framer-motion";
import {
    TrendingUp,
    Users,
    Target,
    Clock,
    BarChart2,
    PieChart,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle
} from "lucide-react";

interface AnalyticsData {
    totalAnalyzed: number;
    strongCandidates: number;
    averageScore: number;
    avgProcessingTime: number;
    topSkillsMatched: string[];
    topSkillsGap: string[];
    clusterDistribution: Record<string, number>;
    scoreDistribution: {
        excellent: number; // 80+
        good: number; // 60-79
        fair: number; // 40-59
        poor: number; // <40
    };
}

interface AnalyticsDashboardProps {
    data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
    const passRate = data.totalAnalyzed > 0
        ? Math.round((data.strongCandidates / data.totalAnalyzed) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Hiring Analytics</h2>
                <div className="text-sm text-muted-foreground">
                    Last 30 days
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Users className="w-5 h-5" />}
                    label="Candidates Analyzed"
                    value={data.totalAnalyzed}
                    color="indigo"
                />
                <MetricCard
                    icon={<CheckCircle className="w-5 h-5" />}
                    label="Strong Candidates"
                    value={data.strongCandidates}
                    color="emerald"
                />
                <MetricCard
                    icon={<Target className="w-5 h-5" />}
                    label="Average Score"
                    value={`${data.averageScore}%`}
                    color="cyan"
                />
                <MetricCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Avg Processing"
                    value={`${data.avgProcessingTime}s`}
                    color="purple"
                />
            </div>

            {/* Score Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> Score Distribution
                    </h3>
                    <div className="space-y-3">
                        <DistributionBar
                            label="Excellent (80+)"
                            value={data.scoreDistribution.excellent}
                            total={data.totalAnalyzed}
                            color="bg-emerald-500"
                        />
                        <DistributionBar
                            label="Good (60-79)"
                            value={data.scoreDistribution.good}
                            total={data.totalAnalyzed}
                            color="bg-green-500"
                        />
                        <DistributionBar
                            label="Fair (40-59)"
                            value={data.scoreDistribution.fair}
                            total={data.totalAnalyzed}
                            color="bg-amber-500"
                        />
                        <DistributionBar
                            label="Poor (<40)"
                            value={data.scoreDistribution.poor}
                            total={data.totalAnalyzed}
                            color="bg-rose-500"
                        />
                    </div>
                </motion.div>

                {/* Candidate Types */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                        <PieChart className="w-4 h-4" /> Candidate Types
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(data.clusterDistribution).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                                <span className="text-sm text-gray-300 capitalize">
                                    {type.replace(/_/g, " ")}
                                </span>
                                <span className="text-sm font-medium text-white">
                                    {count}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Skills Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Top Matched Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.topSkillsMatched.map((skill, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-sm rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-sm font-semibold text-rose-400 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Common Skill Gaps
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.topSkillsGap.map((skill, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-rose-500/10 text-rose-400 text-sm rounded-full"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Pass Rate */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Qualification Rate
                    </h3>
                    <span className="text-2xl font-bold text-indigo-400">{passRate}%</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${passRate}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                    {data.strongCandidates} out of {data.totalAnalyzed} candidates scored 65+
                </p>
            </motion.div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    color
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    const colorClasses: Record<string, string> = {
        indigo: "bg-indigo-500/20 text-indigo-400",
        emerald: "bg-emerald-500/20 text-emerald-400",
        cyan: "bg-cyan-500/20 text-cyan-400",
        purple: "bg-purple-500/20 text-purple-400",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 rounded-xl"
        >
            <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]} mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </motion.div>
    );
}

function DistributionBar({
    label,
    value,
    total,
    color
}: {
    label: string;
    value: number;
    total: number;
    color: string;
}) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{value} ({percentage}%)</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

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
    AlertTriangle,
    ChevronRight,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Hiring Intelligence</h2>
                    <p className="text-sm font-medium text-gray-500">Pipeline health and talent distribution metrics</p>
                </div>
                <div className="px-3 py-1 bg-gray-50 rounded-full border border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Last 30 days
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard
                    icon={<Users className="w-5 h-5" />}
                    label="Talent Analyzed"
                    value={data.totalAnalyzed}
                    color="blue"
                    description="+12% from last month"
                />
                <MetricCard
                    icon={<CheckCircle className="w-5 h-5" />}
                    label="Qualified Hires"
                    value={data.strongCandidates}
                    color="green"
                    description="Candidates with 65+ score"
                />
                <MetricCard
                    icon={<Target className="w-5 h-5" />}
                    label="Avg Match Score"
                    value={`${data.averageScore}%`}
                    color="amber"
                    description="Overall pipeline quality"
                />
                <MetricCard
                    icon={<Clock className="w-5 h-5" />}
                    label="Avg Logic Wait"
                    value={`${data.avgProcessingTime}s`}
                    color="indigo"
                    description="System analysis latency"
                />
            </div>

            {/* Middle Section: Scores & Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Score Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart2 className="w-4 h-4" /> Score Distribution
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <DistributionBar
                            label="Platinum Talent (80+)"
                            value={data.scoreDistribution.excellent}
                            total={data.totalAnalyzed}
                            color="bg-blue-600"
                        />
                        <DistributionBar
                            label="Strong Match (60-79)"
                            value={data.scoreDistribution.good}
                            total={data.totalAnalyzed}
                            color="bg-indigo-500"
                        />
                        <DistributionBar
                            label="Average Match (40-59)"
                            value={data.scoreDistribution.fair}
                            total={data.totalAnalyzed}
                            color="bg-gray-400"
                        />
                        <DistributionBar
                            label="Underqualified (<40)"
                            value={data.scoreDistribution.poor}
                            total={data.totalAnalyzed}
                            color="bg-gray-200"
                        />
                    </div>
                </motion.div>

                {/* Candidate Types Cluster */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <PieChart className="w-4 h-4" /> Role Segmentation
                        </h3>
                    </div>

                    <div className="space-y-5">
                        {Object.entries(data.clusterDistribution).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                                    <span className="text-sm font-bold text-gray-700 capitalize group-hover:text-gray-900 transition-colors">
                                        {type.replace(/_/g, " ")}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-gray-400">
                                        {Math.round((count / data.totalAnalyzed) * 100)}%
                                    </span>
                                    <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                                        {count}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Skills Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-green-50/50 p-8 rounded-3xl border border-green-100"
                >
                    <h3 className="text-xs font-black text-green-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Pipeline Strengths
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.topSkillsMatched.map((skill, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 bg-white text-green-700 text-xs font-bold rounded-xl border border-green-100 shadow-sm"
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
                    className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100"
                >
                    <h3 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Talent Gaps Identified
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {data.topSkillsGap.map((skill, i) => (
                            <span
                                key={i}
                                className="px-4 py-2 bg-white text-amber-700 text-xs font-bold rounded-xl border border-amber-100 shadow-sm"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Pass Rate Performance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 disabled:pointer-events-none rounded-full -mr-20 -mt-20 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-blue-100 flex items-center gap-2 uppercase tracking-widest">
                                    Overall Logic Benchmarking
                                </h3>
                                <p className="text-white text-2xl font-black">Qualification Threshold</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-5xl font-black tracking-tighter">{passRate}%</span>
                        </div>
                    </div>

                    <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10 p-1">
                        <motion.div
                            className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${passRate}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <div className="mt-6 flex items-center justify-between text-blue-100">
                        <p className="text-sm font-bold">
                            {data.strongCandidates} out of {data.totalAnalyzed} candidates meet engineering standards
                        </p>
                        <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest">
                            Healthy Margin <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function MetricCard({
    icon,
    label,
    value,
    color,
    description
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
    description?: string;
}) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        green: "bg-green-50 text-green-600 border-green-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
        >
            <div className={cn("inline-flex p-3 rounded-2xl border mb-5 transition-transform group-hover:scale-110", colorClasses[color])}>
                {icon}
            </div>
            <p className="text-3xl font-black text-gray-900 tracking-tight mb-1">{value}</p>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{label}</p>
            {description && (
                <p className="text-[10px] font-bold text-gray-400 leading-tight">
                    {description}
                </p>
            )}
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
        <div className="group">
            <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-gray-500 group-hover:text-gray-900 transition-colors">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">{value} profiles</span>
                    <span className="text-gray-900">{percentage}%</span>
                </div>
            </div>
            <div className="h-3 bg-gray-50 rounded-full overflow-hidden border border-gray-100 p-0.5">
                <motion.div
                    className={cn("h-full rounded-full transition-all", color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}

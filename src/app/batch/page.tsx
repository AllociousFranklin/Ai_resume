"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
    Upload,
    FileText,
    X,
    Loader2,
    Users,
    Trophy,
    AlertCircle,
    CheckCircle,
    Eye,
    ArrowLeft,
    RefreshCw,
    GitCompare,
    Download,
    ChevronRight,
    Github,
    Mail,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import Dashboard from "@/components/Dashboard";
import { ComparisonView } from "@/components/ComparisonView";
import { ScoreGauge } from "@/components/visualizations/Charts";

interface CandidateResult {
    candidateId: string;
    rank: number;
    name: string | null;
    email: string | null;
    finalScore: number;
    recommendation: {
        recommendation: string;
        label: string;
        color: string;
    } | null;
    githubVerified: boolean;
    githubUsername: string | null;
    status: "success" | "failed" | "processing" | "cached";
    errorMessage?: string;
    processingTimeMs: number;
    fromCache: boolean;
    fullAnalysis: any | null;
}

interface BatchResult {
    batchId: string;
    totalCandidates: number;
    processed: number;
    failed: number;
    cached: number;
    candidates: CandidateResult[];
    processingTimeMs: number;
}

export default function BatchPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [jdText, setJdText] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [compareMode, setCompareMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<CandidateResult[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter(
            f => f.type === "application/pdf" ||
                f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );
        setFiles(prev => [...prev, ...validFiles].slice(0, 50));
        setError(null);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
        },
        multiple: true
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (files.length === 0 || !jdText.trim()) {
            setError("Please upload at least one resume and enter the job description");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setProgress({ current: 0, total: files.length });

        try {
            const formData = new FormData();
            formData.append("jd", jdText);
            files.forEach((file) => {
                formData.append("resumes", file);
            });

            const response = await fetch("/api/batch", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Batch processing failed");
            }

            setBatchResult(data.batch);
            setProgress({ current: data.batch.processed, total: data.batch.totalCandidates });

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRetry = async (candidate: CandidateResult) => {
        setError("Please re-run the batch to retry failed candidates");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600";
        if (score >= 65) return "text-blue-600";
        if (score >= 45) return "text-amber-600";
        return "text-red-600";
    };

    const getRecommendationBadge = (rec: CandidateResult["recommendation"]) => {
        if (!rec) return null;
        const colors: Record<string, string> = {
            emerald: "bg-green-50 text-green-700 border-green-100",
            green: "bg-green-50 text-green-700 border-green-100",
            amber: "bg-amber-50 text-amber-700 border-amber-100",
            rose: "bg-red-50 text-red-700 border-red-100",
            blue: "bg-blue-50 text-blue-700 border-blue-100"
        };
        const colorClass = colors[rec.color] || colors.blue;
        return (
            <span className={cn("px-2.5 py-1 text-xs font-bold rounded-md border uppercase tracking-wider", colorClass)}>
                {rec.label}
            </span>
        );
    };

    // Show full dashboard for selected candidate
    if (selectedCandidate?.fullAnalysis) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <button
                        onClick={() => setSelectedCandidate(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Ranking Result
                    </button>

                    <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-black">
                                {selectedCandidate.rank}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.name || "Unknown Candidate"}</h2>
                                <p className="text-gray-500 font-medium">Ranked High-Potential Applicant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Match Score</p>
                                <span className={cn("text-3xl font-black", getScoreColor(selectedCandidate.finalScore))}>
                                    {selectedCandidate.finalScore}
                                </span>
                            </div>
                            {getRecommendationBadge(selectedCandidate.recommendation)}
                        </div>
                    </div>

                    <Dashboard data={selectedCandidate.fullAnalysis} />
                </div>
            </div>
        );
    }

    // Show results table
    if (batchResult && !isProcessing) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] pb-12">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">
                                <Trophy className="w-3 h-3" />
                                Analysis Complete
                            </div>
                            <h1 className="text-3xl font-black text-gray-900">Pipeline Rankings</h1>
                            <p className="text-gray-500 font-medium mt-1">
                                {batchResult.processed} resumes processed in {(batchResult.processingTimeMs / 1000).toFixed(1)}s
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setCompareMode(!compareMode);
                                    setSelectedForCompare([]);
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border",
                                    compareMode
                                        ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm"
                                )}
                            >
                                <GitCompare className="w-4 h-4" />
                                {compareMode ? "Stop Comparing" : "Compare"}
                            </button>

                            {compareMode && selectedForCompare.length === 2 && (
                                <button
                                    onClick={() => setShowComparison(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                                >
                                    Analyze Pair
                                </button>
                            )}

                            <button
                                onClick={() => {
                                    setBatchResult(null);
                                    setFiles([]);
                                    setJdText("");
                                }}
                                className="px-5 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                New Analysis
                            </button>
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: "Total Candidates", value: batchResult.totalCandidates, icon: Users, color: "text-blue-600" },
                            { label: "High Confidence", value: batchResult.processed - batchResult.failed, icon: CheckCircle, color: "text-green-600" },
                            { label: "Processing Gaps", value: batchResult.failed, icon: AlertCircle, color: "text-red-500" },
                            { label: "Cached Results", value: batchResult.cached, icon: RefreshCw, color: "text-indigo-500" },
                        ].map((stat, i) => (
                            <div key={i} className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                                    <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                                </div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Results Table */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    {compareMode && (
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pick</th>
                                    )}
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Candidate Information</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Data</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {batchResult.candidates.map((candidate, idx) => (
                                    <motion.tr
                                        key={candidate.candidateId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className={cn(
                                            "hover:bg-gray-50/50 transition-colors group",
                                            candidate.status === "failed" && "bg-red-50/30",
                                            selectedForCompare.some(c => c.candidateId === candidate.candidateId) && "bg-blue-50/50"
                                        )}
                                    >
                                        {compareMode && (
                                            <td className="px-6 py-6 font-medium text-gray-900">
                                                <input
                                                    type="checkbox"
                                                    disabled={candidate.status !== "success" || (selectedForCompare.length >= 2 && !selectedForCompare.some(c => c.candidateId === candidate.candidateId))}
                                                    checked={selectedForCompare.some(c => c.candidateId === candidate.candidateId)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedForCompare(prev => [...prev, candidate].slice(0, 2));
                                                        } else {
                                                            setSelectedForCompare(prev => prev.filter(c => c.candidateId !== candidate.candidateId));
                                                        }
                                                    }}
                                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-6">
                                            <span className={cn(
                                                "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black shadow-sm",
                                                candidate.rank === 1 ? "bg-amber-100 text-amber-700 font-black" :
                                                    candidate.rank === 2 ? "bg-gray-100 text-gray-700" :
                                                        candidate.rank === 3 ? "bg-orange-50 text-orange-700" :
                                                            "bg-white border border-gray-200 text-gray-400"
                                            )}>
                                                {candidate.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase">
                                                    {(candidate.name || "U")[0]}
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-bold group-hover:text-blue-600 transition-colors">{candidate.name || "Unknown Candidate"}</p>
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-0.5">
                                                        <Mail className="w-3 h-3" />
                                                        {candidate.email || "No email available"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={cn("text-2xl font-black", getScoreColor(candidate.finalScore))}>
                                                {candidate.finalScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            {candidate.githubVerified ? (
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded w-fit capitalize">
                                                        <Github className="w-3.5 h-3.5" />
                                                        {candidate.githubUsername}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-6">
                                            {getRecommendationBadge(candidate.recommendation)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                {candidate.status === "success" ? (
                                                    <button
                                                        onClick={() => setSelectedCandidate(candidate)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Review Profile
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRetry(candidate)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5" />
                                                        Retry
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Comparison Modal */}
                <AnimatePresence>
                    {showComparison && selectedForCompare.length === 2 && (
                        <ComparisonView
                            candidate1={{
                                name: selectedForCompare[0].name || "Candidate 1",
                                score: selectedForCompare[0].finalScore,
                                atsScore: selectedForCompare[0].fullAnalysis?.ats?.score || 0,
                                githubScore: selectedForCompare[0].fullAnalysis?.github?.score || 0,
                                proofScore: selectedForCompare[0].fullAnalysis?.proof?.score || 0,
                                qualityScore: selectedForCompare[0].fullAnalysis?.quality?.score || 0,
                                skillBreakdown: {
                                    technical: selectedForCompare[0].fullAnalysis?.ats?.breakdown?.skillMatch || 50,
                                    tools: selectedForCompare[0].fullAnalysis?.ats?.breakdown?.toolMatch || 50,
                                    soft: selectedForCompare[0].fullAnalysis?.ats?.breakdown?.softMatch || 50,
                                },
                                matchedSkills: selectedForCompare[0].fullAnalysis?.ats?.matched_skills || [],
                                missingSkills: selectedForCompare[0].fullAnalysis?.ats?.missing_skills || [],
                            }}
                            candidate2={{
                                name: selectedForCompare[1].name || "Candidate 2",
                                score: selectedForCompare[1].finalScore,
                                atsScore: selectedForCompare[1].fullAnalysis?.ats?.score || 0,
                                githubScore: selectedForCompare[1].fullAnalysis?.github?.score || 0,
                                proofScore: selectedForCompare[1].fullAnalysis?.proof?.score || 0,
                                qualityScore: selectedForCompare[1].fullAnalysis?.quality?.score || 0,
                                skillBreakdown: {
                                    technical: selectedForCompare[1].fullAnalysis?.ats?.breakdown?.skillMatch || 50,
                                    tools: selectedForCompare[1].fullAnalysis?.ats?.breakdown?.toolMatch || 50,
                                    soft: selectedForCompare[1].fullAnalysis?.ats?.breakdown?.softMatch || 50,
                                },
                                matchedSkills: selectedForCompare[1].fullAnalysis?.ats?.matched_skills || [],
                                missingSkills: selectedForCompare[1].fullAnalysis?.ats?.missing_skills || [],
                            }}
                            onClose={() => setShowComparison(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Upload form
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 mb-6"
                    >
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Enterprise Talent Pipeline</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                        Pipeline Intelligence
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                        Analyze, rank, and verify up to 50 candidates simultaneously.
                        Our engine cross-references resumes with real-world engineering footprints.
                    </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-medium"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Left Column: Input */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Drop Zone */}
                        <div
                            {...getRootProps()}
                            className={cn(
                                "p-12 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all duration-300 bg-white",
                                isDragActive
                                    ? "border-blue-600 bg-blue-50/50"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Upload className={cn(
                                    "w-8 h-8 transition-colors",
                                    isDragActive ? "text-blue-600" : "text-gray-400"
                                )} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {isDragActive ? "Drop to analysis..." : "Upload Talent Pool"}
                            </h3>
                            <p className="text-gray-500 font-medium px-4">
                                Drag & drop PDF/Word resumes or click to browse
                            </p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Max 50 Files</p>
                        </div>

                        {/* Job Description */}
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4" /> Position Requirements
                            </label>
                            <textarea
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                                placeholder="Paste the job description or ideal candidate profile here..."
                                className="w-full h-64 p-6 bg-white border border-gray-200 rounded-3xl text-gray-900 placeholder-gray-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50/50 transition-all resize-none shadow-sm text-sm leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Right Column: Queue & Action */}
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                Analysis Queue {files.length > 0 && `(${files.length})`}
                            </h4>
                            {files.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <FileText className="w-8 h-8 text-gray-200 mb-4" />
                                    <p className="text-xs font-medium text-gray-400 italic">No resumes selected</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                    {files.map((file, idx) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={idx}
                                            className="group flex items-center gap-3 p-3 bg-gray-50/50 hover:bg-gray-100 rounded-2xl border border-transparent hover:border-gray-200 transition-all"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700 truncate flex-1">{file.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {files.length > 0 && (
                                <button
                                    onClick={() => setFiles([])}
                                    className="w-full mt-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="space-y-4">
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing || files.length === 0 || !jdText.trim()}
                                className={cn(
                                    "w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl",
                                    isProcessing || files.length === 0 || !jdText.trim()
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 transform hover:-translate-y-1"
                                )}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Ranking...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-6 h-6" />
                                        <span>Start Ranking</span>
                                    </>
                                )}
                            </button>

                            {isProcessing && (
                                <div className="space-y-2 px-2">
                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        <span>Progress</span>
                                        <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                                            className="h-full bg-blue-600 shadow-sm"
                                        />
                                    </div>
                                    <p className="text-center text-[10px] font-medium text-gray-400 italic">
                                        Running semantic match & code verification...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

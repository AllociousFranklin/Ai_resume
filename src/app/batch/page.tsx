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
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import Dashboard from "@/components/Dashboard";

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
            files.forEach((file, i) => {
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
        // For now, just remove from failed and let user re-run batch
        // In a full implementation, you'd retry just that one
        setError("Please re-run the batch to retry failed candidates");
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 65) return "text-green-400";
        if (score >= 45) return "text-amber-400";
        return "text-rose-400";
    };

    const getRecommendationBadge = (rec: CandidateResult["recommendation"]) => {
        if (!rec) return null;
        const colors: Record<string, string> = {
            emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
            green: "bg-green-500/20 text-green-400 border-green-500/30",
            amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
            rose: "bg-rose-500/20 text-rose-400 border-rose-500/30"
        };
        return (
            <span className={cn("px-2 py-0.5 text-xs rounded-full border", colors[rec.color] || colors.amber)}>
                {rec.label}
            </span>
        );
    };

    // Show full dashboard for selected candidate
    if (selectedCandidate?.fullAnalysis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                <div className="max-w-7xl mx-auto p-4">
                    <button
                        onClick={() => setSelectedCandidate(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Rankings
                    </button>
                    <div className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="text-gray-400">Viewing:</span>
                                <span className="ml-2 text-white font-semibold">
                                    #{selectedCandidate.rank} - {selectedCandidate.name || "Unknown"}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={cn("text-2xl font-bold", getScoreColor(selectedCandidate.finalScore))}>
                                    {selectedCandidate.finalScore}
                                </span>
                                {getRecommendationBadge(selectedCandidate.recommendation)}
                            </div>
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
            <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <Trophy className="w-8 h-8 text-amber-400" />
                                    Candidate Rankings
                                </h1>
                                <p className="text-gray-400 mt-1">
                                    {batchResult.processed} candidates processed in {(batchResult.processingTimeMs / 1000).toFixed(1)}s
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setBatchResult(null);
                                    setFiles([]);
                                    setJdText("");
                                }}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                New Batch
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4 mt-6">
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <p className="text-gray-400 text-sm">Total</p>
                                <p className="text-2xl font-bold text-white">{batchResult.totalCandidates}</p>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                                <p className="text-emerald-400 text-sm">Processed</p>
                                <p className="text-2xl font-bold text-emerald-400">{batchResult.processed - batchResult.failed}</p>
                            </div>
                            <div className="p-4 bg-rose-500/10 rounded-xl border border-rose-500/30">
                                <p className="text-rose-400 text-sm">Failed</p>
                                <p className="text-2xl font-bold text-rose-400">{batchResult.failed}</p>
                            </div>
                            <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                                <p className="text-cyan-400 text-sm">From Cache</p>
                                <p className="text-2xl font-bold text-cyan-400">{batchResult.cached}</p>
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-800/50 border-b border-gray-700/50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rank</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Candidate</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Score</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">GitHub</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Recommendation</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {batchResult.candidates.map((candidate, idx) => (
                                    <motion.tr
                                        key={candidate.candidateId}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={cn(
                                            "border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors",
                                            candidate.status === "failed" && "opacity-60"
                                        )}
                                    >
                                        <td className="px-4 py-4">
                                            <span className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                                                candidate.rank === 1 && "bg-amber-500/20 text-amber-400",
                                                candidate.rank === 2 && "bg-gray-400/20 text-gray-300",
                                                candidate.rank === 3 && "bg-amber-700/20 text-amber-600",
                                                candidate.rank > 3 && "bg-gray-800 text-gray-400"
                                            )}>
                                                {candidate.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white font-medium">{candidate.name || "Unknown"}</p>
                                            {candidate.email && (
                                                <p className="text-gray-500 text-sm">{candidate.email}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={cn("text-2xl font-bold", getScoreColor(candidate.finalScore))}>
                                                {candidate.finalScore}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            {candidate.githubVerified ? (
                                                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {candidate.githubUsername}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {getRecommendationBadge(candidate.recommendation)}
                                        </td>
                                        <td className="px-4 py-4">
                                            {candidate.status === "success" && (
                                                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                                    <CheckCircle className="w-4 h-4" />
                                                    {candidate.fromCache ? "Cached" : "Success"}
                                                </span>
                                            )}
                                            {candidate.status === "failed" && (
                                                <span className="flex items-center gap-1 text-rose-400 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Failed
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {candidate.status === "success" ? (
                                                <button
                                                    onClick={() => setSelectedCandidate(candidate)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg text-sm transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRetry(candidate)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-colors"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Retry
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // Upload form
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4">
            <div className="max-w-4xl mx-auto pt-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-full border border-indigo-500/30 mb-6"
                    >
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-indigo-300">Enterprise Batch Processing</span>
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Analyze Multiple Resumes
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Upload up to 50 resumes and get ranked results instantly.
                        Click any candidate to view their full analysis.
                    </p>
                </div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400"
                        >
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drop Zone */}
                <div
                    {...getRootProps()}
                    className={cn(
                        "p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300",
                        isDragActive
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className={cn(
                        "w-12 h-12 mx-auto mb-4 transition-colors",
                        isDragActive ? "text-indigo-400" : "text-gray-500"
                    )} />
                    <p className="text-lg text-white mb-2">
                        {isDragActive ? "Drop resumes here..." : "Drag & drop resumes here"}
                    </p>
                    <p className="text-gray-500">or click to browse (PDF, DOCX • Max 50 files)</p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-6"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-gray-400">
                                {files.length} resume{files.length !== 1 ? "s" : ""} selected
                            </p>
                            <button
                                onClick={() => setFiles([])}
                                className="text-sm text-gray-500 hover:text-rose-400 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                            {files.map((file, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50"
                                >
                                    <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                                    <span className="text-sm text-gray-300 truncate flex-1">{file.name}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="text-gray-500 hover:text-rose-400 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Job Description */}
                <div className="mt-8">
                    <label className="block text-gray-400 mb-2">Job Description</label>
                    <textarea
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste the job description here..."
                        className="w-full h-48 p-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                    />
                </div>

                {/* Submit Button */}
                <motion.button
                    onClick={handleSubmit}
                    disabled={isProcessing || files.length === 0 || !jdText.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                        "w-full mt-6 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all",
                        isProcessing || files.length === 0 || !jdText.trim()
                            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/25"
                    )}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing {progress.current}/{progress.total}...
                        </>
                    ) : (
                        <>
                            <Users className="w-5 h-5" />
                            Analyze {files.length} Resume{files.length !== 1 ? "s" : ""}
                        </>
                    )}
                </motion.button>

                {/* Processing Progress */}
                {isProcessing && (
                    <div className="mt-4">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                            />
                        </div>
                        <p className="text-center text-gray-500 text-sm mt-2">
                            This may take a few minutes...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

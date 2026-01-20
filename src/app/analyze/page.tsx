"use client";

import { useState } from "react";
import {
    Upload,
    FileText,
    CheckCircle2,
    BarChart3,
    ArrowRight,
    ShieldCheck,
    Github,
    Code2
} from "lucide-react";
import Dashboard from "@/components/Dashboard";

export default function AnalyzePage() {
    const [step, setStep] = useState(0); // 0: Input, 1: Loading, 2: Result
    const [result, setResult] = useState(null);
    const [file, setFile] = useState<File | null>(null);
    const [jd, setJd] = useState("");
    const [progress, setProgress] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !jd) return;

        setStep(1);
        setProgress(0);

        const formData = new FormData();
        formData.append("resume", file);
        formData.append("jd", jd);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 5, 95));
        }, 200);

        try {
            const res = await fetch("/api/analyze", {
                method: "POST",
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await res.json();

            clearInterval(progressInterval);
            setProgress(100);

            // Small delay to show 100%
            setTimeout(() => {
                setResult(data);
                setStep(2);
            }, 500);

        } catch (error: any) {
            clearInterval(progressInterval);
            console.error(error);
            setStep(0);
            alert(error.message || "Something went wrong. Please try again.");
        }
    };

    const handleReset = () => {
        setStep(0);
        setResult(null);
        setFile(null);
        setJd("");
        setProgress(0);
    };

    if (step === 2 && result) {
        return <Dashboard data={result} onReset={handleReset} />;
    }

    return (
        <main className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Left Column: Content & Form */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                                <ShieldCheck className="w-4 h-4" /> Enterprise-Grade Analysis
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                                Talent Intelligence for <br />
                                <span className="text-blue-600">Modern Hiring Teams</span>
                            </h1>
                            <p className="text-lg text-gray-600 max-w-lg">
                                Verify skills with evidence, not keywords. Our platform analyzes GitHub contributions to validate technical expertise against your job requirements.
                            </p>
                        </div>

                        {/* Upload Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                            {step === 0 ? (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Resume</label>
                                        <label
                                            className={`
                        flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                        ${file ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300'}
                      `}
                                        >
                                            <input
                                                type="file"
                                                accept=".pdf,.docx,.doc"
                                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                            />
                                            {file ? (
                                                <div className="text-center">
                                                    <CheckCircle2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)}kb</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600">Click to upload or drag & drop</p>
                                                    <p className="text-xs text-gray-400">PDF or DOCX</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    {/* JD Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Job Description</label>
                                        <textarea
                                            value={jd}
                                            onChange={(e) => setJd(e.target.value)}
                                            placeholder="Paste the full job description here..."
                                            className="w-full h-24 rounded-lg border border-gray-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!file || !jd}
                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Analyze Application <ArrowRight className="w-4 h-4" />
                                    </button>

                                    <div className="text-center">
                                        <a href="/batch" className="text-sm text-gray-500 hover:text-blue-600 inline-flex items-center gap-1">
                                            <BarChart3 className="w-4 h-4" /> Switch to Batch Analysis
                                        </a>
                                    </div>
                                </form>
                            ) : (
                                <div className="py-12 text-center space-y-6">
                                    <div className="relative w-16 h-16 mx-auto">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                                            <circle
                                                cx="50" cy="50" r="45" fill="none" stroke="#2563EB" strokeWidth="8"
                                                strokeDasharray="283" strokeDashoffset={283 - (283 * progress / 100)}
                                                className="transition-all duration-200 ease-linear origin-center -rotate-90"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-blue-600">
                                            {Math.round(progress)}%
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Analyzing Candidate</h3>
                                        <p className="text-sm text-gray-500 mt-1">Cross-referencing GitHub activity...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Illustration */}
                    <div className="hidden lg:block relative">
                        {/* Abstract Dashboard Composition */}
                        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-lg mx-auto transform rotate-1 transition-transform hover:rotate-0">
                            {/* Header Mockup */}
                            <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                                    <div className="h-3 bg-gray-50 rounded w-1/4" />
                                </div>
                                <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                                    Recommended
                                </div>
                            </div>

                            {/* Content Mockup */}
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Github className="w-4 h-4 text-blue-600" />
                                            <div className="text-xs font-semibold text-blue-800">GitHub Score</div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">92/100</div>
                                    </div>
                                    <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Code2 className="w-4 h-4 text-gray-600" />
                                            <div className="text-xs font-semibold text-gray-700">Skills Match</div>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">88%</div>
                                    </div>
                                </div>

                                {/* List Items */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                                        <div className="h-2 bg-gray-200 rounded w-full" />
                                    </div>
                                ))}
                            </div>

                            {/* Floating Badge */}
                            <div className="absolute -right-8 top-12 bg-white shadow-lg rounded-lg p-3 border border-gray-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                <div className="p-1.5 bg-green-100 rounded-full text-green-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <div className="text-xs font-medium text-gray-700">
                                    Skills Verified
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -z-10 top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />
                        <div className="absolute -z-10 -bottom-10 -left-10 w-64 h-64 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                    </div>

                </div>
            </div>
        </main>
    );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Upload,
  FileText,
  CheckCircle2,
  Sparkles,
  Github,
  Target,
  Zap,
  BarChart3
} from "lucide-react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [step, setStep] = useState(0); // 0: Input, 1: Loading, 2: Result
  const [result, setResult] = useState(null);
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loadingStage, setLoadingStage] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jd) return;

    setStep(1);
    setLoadingStage(0);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    // Simulate loading stages
    const stageInterval = setInterval(() => {
      setLoadingStage(prev => Math.min(prev + 1, 4));
    }, 1500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      clearInterval(stageInterval);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data);
      setStep(2);
    } catch (error: any) {
      clearInterval(stageInterval);
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
    setLoadingStage(0);
  };

  if (step === 2 && result) {
    return <Dashboard data={result} onReset={handleReset} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            {/* Hero */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-400 mb-4"
              >
                <Sparkles className="w-3 h-3" /> Talent Intelligence Engine v2.0
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                Skill<span className="text-indigo-500">Snap</span> AI
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Evaluate candidates with bias-proof, evidence-based AI.
                <span className="text-indigo-400 font-medium"> Feasibility over fantasy.</span>
              </p>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              <FeaturePill icon={<Github className="w-3 h-3" />} text="GitHub Verification" />
              <FeaturePill icon={<Target className="w-3 h-3" />} text="Skill Proof Index" />
              <FeaturePill icon={<Zap className="w-3 h-3" />} text="AI-Powered Analysis" />
              <FeaturePill icon={<BarChart3 className="w-3 h-3" />} text="Quality Scoring" />
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="glass border border-white/5 p-8 rounded-2xl shadow-2xl space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Resume Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Upload Resume (PDF or DOCX)
                </label>
                <label
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${file
                    ? 'border-emerald-500/50 bg-emerald-500/5'
                    : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'
                    }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {file ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                      <p className="text-sm text-emerald-300 font-medium">{file.name}</p>
                      <p className="text-xs text-emerald-400/60 mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Drag & drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Supports PDF and DOCX
                      </p>
                    </>
                  )}
                </label>
              </div>

              {/* JD Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Job Description
                </label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-36 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none outline-none"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!file || !jd}
                className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 p-4 font-bold text-white shadow-2xl transition-all hover:scale-[1.02] hover:shadow-indigo-500/25 disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  Analyze Candidate <Play className="w-4 h-4 fill-current" />
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
              </button>

              {/* Batch Processing Link */}
              <div className="text-center pt-4 border-t border-white/5">
                <a
                  href="/batch"
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Enterprise Mode: Analyze up to 50 resumes at once →
                </a>
              </div>
            </motion.form>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center text-center max-w-md"
          >
            {/* Animated Loader */}
            <div className="relative w-28 h-28 mb-8">
              <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-4 border-4 border-cyan-500/30 rounded-full" />
              <div className="absolute inset-4 border-4 border-cyan-500 border-b-transparent rounded-full animate-spin animation-delay-200" style={{ animationDirection: 'reverse' }} />
              <Sparkles className="absolute inset-0 m-auto text-white w-8 h-8 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Analyzing Candidate Profile</h2>
            <p className="text-muted-foreground mb-8">
              Extracting intelligence from Resume, GitHub, and JD...
            </p>

            {/* Loading Stages */}
            <div className="space-y-3 text-sm w-full">
              <LoadingStage
                text="Parsing resume structure"
                active={loadingStage >= 0}
                complete={loadingStage > 0}
              />
              <LoadingStage
                text="Extracting skills with AI"
                active={loadingStage >= 1}
                complete={loadingStage > 1}
              />
              <LoadingStage
                text="Analyzing GitHub profile"
                active={loadingStage >= 2}
                complete={loadingStage > 2}
              />
              <LoadingStage
                text="Verifying skill proofs"
                active={loadingStage >= 3}
                complete={loadingStage > 3}
              />
              <LoadingStage
                text="Generating insights"
                active={loadingStage >= 4}
                complete={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

function FeaturePill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-full text-xs text-gray-400">
      {icon}
      {text}
    </div>
  );
}

function LoadingStage({ text, active, complete }: { text: string; active: boolean; complete: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${active ? 'bg-white/5' : 'opacity-30'
      }`}>
      {complete ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      ) : active ? (
        <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="w-4 h-4 border-2 border-white/20 rounded-full" />
      )}
      <span className={complete ? 'text-emerald-400' : active ? 'text-white' : 'text-gray-500'}>
        {text}
      </span>
    </div>
  );
}

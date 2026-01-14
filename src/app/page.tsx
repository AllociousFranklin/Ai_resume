"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Upload, FileText, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [step, setStep] = useState(0); // 0: Input, 1: Loading, 2: Result
  const [result, setResult] = useState(null);

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jd) return;

    setStep(1);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      setResult(data);
      setStep(2);
    } catch (error) {
      console.error(error);
      setStep(0);
      alert("Something went wrong. Please try again.");
    }
  };

  if (step === 2 && result) {
    return <Dashboard data={result} onReset={() => setStep(0)} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-400 mb-4"
              >
                <Sparkles className="w-3 h-3" /> Talent Intelligence Engine
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
                Skill<span className="text-indigo-500">Snap</span> AI
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Evaluate candidates with bias-proof, evidence-based AI.
                Feasibility over fantasy.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="glass border border-white/5 p-8 rounded-2xl shadow-2xl space-y-6">

              {/* Resume Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Upload Resume (PDF)
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-indigo-500/50 hover:bg-white/5'}`}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" // Hack to cover the div
                  // Note: Input inside relative/absolute setup might be tricky, let's just use standard hidden input logic if needed, 
                  // but for quick simplicity, let's keep it visible but styled or standard.
                  // Actually, let's do a proper label wrapper.
                  />
                  <div className="pointer-events-none">
                    {file ? (
                      <>
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-emerald-300 font-medium">{file.name}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Drag drop or click to upload</p>
                      </>
                    )}
                  </div>
                  {/* Re-implementing input to simple relative */}
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="resume-upload" className="absolute inset-0 cursor-pointer" />
                </div>
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
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none outline-none"
                  required
                />
              </div>



              {/* Action */}
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

            </form>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center"
          >
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Candidate Profile</h2>
            <p className="text-muted-foreground">Extracting intelligence from Resume, GitHub, and JD...</p>

            <div className="mt-8 flex flex-col gap-2 text-sm text-gray-500">
              <span className="animate-pulse delay-75">• Parsing PDF structure...</span>
              <span className="animate-pulse delay-150">• Verifying GitHub proofs...</span>
              <span className="animate-pulse delay-300">• Calculating feasibility score...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

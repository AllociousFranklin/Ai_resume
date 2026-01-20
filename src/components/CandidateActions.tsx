"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Shield,
    Mail,
    Clock,
    CheckCircle,
    Loader2,
    X,
    FileCheck,
    AlertTriangle,
    Eye,
    EyeOff,
    Send,
    ChevronRight,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CandidateActionsProps {
    candidateName: string | null;
    candidateEmail: string | null;
    recommendation: string;
    githubUsername: string | null;
    finalScore: number;
}

export default function CandidateActions({
    candidateName,
    candidateEmail,
    recommendation,
    githubUsername,
    finalScore
}: CandidateActionsProps) {
    const [showScheduler, setShowScheduler] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [showBlindMode, setShowBlindMode] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Mock available slots
    const [slots] = useState([
        { date: "Tomorrow", time: "10:00 AM", available: true },
        { date: "Tomorrow", time: "2:00 PM", available: true },
        { date: "Day After", time: "11:00 AM", available: true },
        { date: "Friday", time: "9:00 AM", available: true },
    ]);

    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [verificationDocs, setVerificationDocs] = useState<string[]>([]);

    const handleScheduleInterview = async () => {
        if (selectedSlot === null) return;
        setLoading("schedule");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(null);
        setSuccess("Interview scheduled successfully!");
        setTimeout(() => {
            setShowScheduler(false);
            setSuccess(null);
            setSelectedSlot(null);
        }, 2000);
    };

    const handleRequestVerification = async () => {
        if (verificationDocs.length === 0) return;
        setLoading("verification");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(null);
        setSuccess("Verification request sent!");
        setTimeout(() => {
            setShowVerification(false);
            setSuccess(null);
            setVerificationDocs([]);
        }, 2000);
    };

    const toggleDoc = (doc: string) => {
        setVerificationDocs(prev =>
            prev.includes(doc)
                ? prev.filter(d => d !== doc)
                : [...prev, doc]
        );
    };

    const shouldShowActions = recommendation === "strong_yes" || recommendation === "yes" || recommendation === "maybe";

    return (
        <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Candidate Logistics</h3>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {shouldShowActions && (
                    <>
                        <button
                            onClick={() => setShowScheduler(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-sm shadow-blue-100"
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule Interview
                        </button>

                        <button
                            onClick={() => setShowVerification(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-lg transition-all shadow-sm"
                        >
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            Request Proofs
                        </button>
                    </>
                )}

                <button
                    onClick={() => setShowBlindMode(!showBlindMode)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all border shadow-sm",
                        showBlindMode
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    )}
                >
                    {showBlindMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showBlindMode ? "Blind Mode On" : "Blind Mode Off"}
                </button>

                {candidateEmail && (
                    <a
                        href={`mailto:${candidateEmail}?subject=Interview Opportunity - ${candidateName || 'Candidate'}`}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-bold rounded-lg transition-all shadow-sm"
                    >
                        <Mail className="w-4 h-4 text-blue-600" />
                        Send Email
                    </a>
                )}
            </div>

            {/* Blind Mode Info */}
            <AnimatePresence>
                {showBlindMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 bg-amber-50 border border-amber-100 rounded-xl"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <EyeOff className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-bold text-amber-900">Anti-Bias Protocol Enabled</p>
                                <p className="text-sm text-amber-700/80 mt-1 leading-relaxed">
                                    All personal identifiers have been redated. Evaluate the talent based purely on objective skill mapping and engineering documentation.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-white/50 border border-amber-200 rounded text-[10px] font-bold text-amber-700 uppercase tracking-wider">PII REDACTED</span>
                                    <span className="px-2 py-1 bg-white/50 border border-amber-200 rounded text-[10px] font-bold text-amber-700 uppercase tracking-wider">ANONYMIZED PROFILE</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule Interview Modal */}
            <AnimatePresence>
                {showScheduler && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowScheduler(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600" />

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Schedule Interview</h3>
                                </div>
                                <button
                                    onClick={() => setShowScheduler(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <p className="text-gray-500 font-medium mb-6">
                                Propose a time slot for <span className="text-gray-900 font-bold">{candidateName || "this candidate"}</span>.
                            </p>

                            {/* Time Slots */}
                            <div className="space-y-2 mb-8 max-h-64 overflow-y-auto pr-1">
                                {slots.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => slot.available && setSelectedSlot(idx)}
                                        disabled={!slot.available}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border flex items-center justify-between transition-all group",
                                            !slot.available && "opacity-40 cursor-not-allowed",
                                            selectedSlot === idx
                                                ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
                                                : "bg-white border-gray-100 hover:border-gray-300"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                selectedSlot === idx ? "bg-white" : "bg-gray-50"
                                            )}>
                                                <Clock className={cn("w-5 h-5", selectedSlot === idx ? "text-blue-600" : "text-gray-400")} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900">{slot.date}</p>
                                                <p className="text-xs font-bold text-gray-400">{slot.time}</p>
                                            </div>
                                        </div>
                                        {selectedSlot === idx && <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-white" /></div>}
                                    </button>
                                ))}
                            </div>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-green-50 rounded-2xl text-green-700 font-bold flex items-center gap-3 border border-green-100"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {success}
                                </motion.div>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowScheduler(false)}
                                        className="flex-1 py-4 bg-gray-50 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleScheduleInterview}
                                        disabled={selectedSlot === null || loading === "schedule"}
                                        className="flex-[2] py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
                                    >
                                        {loading === "schedule" ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>Send Invite</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Verification Modal */}
            <AnimatePresence>
                {showVerification && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                            onClick={() => setShowVerification(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500" />

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 rounded-lg">
                                        <ShieldCheck className="w-5 h-5 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900">Verification Engine</h3>
                                </div>
                                <button
                                    onClick={() => setShowVerification(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <p className="text-gray-500 font-medium mb-8">
                                Securely request official credentials from <span className="text-gray-900 font-bold">{candidateName || "this candidate"}</span>.
                            </p>

                            {/* Document Checkboxes */}
                            <div className="space-y-3 mb-8">
                                {[
                                    { id: "id", label: "Gov-Issued Identity", icon: Shield },
                                    { id: "education", label: "Educational Record", icon: FileCheck },
                                    { id: "employment", label: "Past Employment Proof", icon: FileCheck },
                                    { id: "reference", label: "Professional Vetting", icon: Mail },
                                ].map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => toggleDoc(doc.id)}
                                        className={cn(
                                            "w-full p-4 rounded-2xl border flex items-center gap-4 transition-all",
                                            verificationDocs.includes(doc.id)
                                                ? "bg-green-50 border-green-200 ring-2 ring-green-100"
                                                : "bg-white border-gray-100 hover:border-gray-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                            verificationDocs.includes(doc.id)
                                                ? "bg-green-600 border-green-600 shadow-sm"
                                                : "border-gray-200 bg-white shadow-inner"
                                        )}>
                                            {verificationDocs.includes(doc.id) && (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-gray-900">{doc.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {!candidateEmail && (
                                <div className="p-4 bg-amber-50 rounded-2xl text-amber-700 text-xs font-bold flex items-center gap-3 mb-6 border border-amber-100">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>No direct email found. Communication will be manual.</span>
                                </div>
                            )}

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-green-50 rounded-2xl text-green-700 font-bold flex items-center gap-3 border border-green-100"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    {success}
                                </motion.div>
                            ) : (
                                <button
                                    onClick={handleRequestVerification}
                                    disabled={verificationDocs.length === 0 || loading === "verification"}
                                    className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading === "verification" ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Transmit Logic Request</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}


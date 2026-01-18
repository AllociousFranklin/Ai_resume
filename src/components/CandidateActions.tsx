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
    Send
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
        { date: "Day After", time: "3:00 PM", available: false },
        { date: "Friday", time: "9:00 AM", available: true },
    ]);

    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [verificationDocs, setVerificationDocs] = useState<string[]>([]);

    const handleScheduleInterview = async () => {
        if (selectedSlot === null) return;

        setLoading("schedule");

        // Simulate API call
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

        // Simulate API call
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
        <div className="space-y-4">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                {shouldShowActions && (
                    <>
                        <button
                            onClick={() => setShowScheduler(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl transition-colors border border-indigo-500/30"
                        >
                            <Calendar className="w-4 h-4" />
                            Schedule Interview
                        </button>

                        <button
                            onClick={() => setShowVerification(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl transition-colors border border-emerald-500/30"
                        >
                            <Shield className="w-4 h-4" />
                            Request Verification
                        </button>
                    </>
                )}

                <button
                    onClick={() => setShowBlindMode(!showBlindMode)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-colors border",
                        showBlindMode
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                            : "bg-gray-700/50 text-gray-400 border-gray-600/50 hover:bg-gray-700"
                    )}
                >
                    {showBlindMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showBlindMode ? "Blind Mode On" : "Toggle Blind Mode"}
                </button>

                {candidateEmail && (
                    <a
                        href={`mailto:${candidateEmail}?subject=Interview Opportunity - ${candidateName || 'Candidate'}`}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl transition-colors border border-cyan-500/30"
                    >
                        <Mail className="w-4 h-4" />
                        Send Email
                    </a>
                )}
            </div>

            {/* Blind Mode Info */}
            <AnimatePresence>
                {showBlindMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <EyeOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-400">Blind Screening Active</p>
                                <p className="text-sm text-amber-400/70 mt-1">
                                    Personal identifiers (name, email, phone, location, age indicators) are hidden.
                                    Evaluate based on skills and experience only.
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400">Name → [REDACTED]</span>
                                    <span className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400">Email → [EMAIL]</span>
                                    <span className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400">Phone → [PHONE]</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Schedule Interview Modal */}
            <AnimatePresence>
                {showScheduler && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowScheduler(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-indigo-400" />
                                    Schedule Interview
                                </h3>
                                <button
                                    onClick={() => setShowScheduler(false)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-4">
                                Select a time slot for <span className="text-white font-medium">{candidateName || "this candidate"}</span>
                            </p>

                            {/* Time Slots */}
                            <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                                {slots.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => slot.available && setSelectedSlot(idx)}
                                        disabled={!slot.available}
                                        className={cn(
                                            "w-full p-3 rounded-xl border flex items-center justify-between transition-all",
                                            !slot.available && "opacity-40 cursor-not-allowed",
                                            selectedSlot === idx
                                                ? "bg-indigo-500/20 border-indigo-500/50"
                                                : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-white">{slot.date}</span>
                                            <span className="text-gray-400">{slot.time}</span>
                                        </div>
                                        {selectedSlot === idx && <CheckCircle className="w-5 h-5 text-indigo-400" />}
                                        {!slot.available && <span className="text-xs text-gray-500">Unavailable</span>}
                                    </button>
                                ))}
                            </div>

                            {success ? (
                                <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    {success}
                                </div>
                            ) : (
                                <button
                                    onClick={handleScheduleInterview}
                                    disabled={selectedSlot === null || loading === "schedule"}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-indigo-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading === "schedule" ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Interview Invite
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Verification Modal */}
            <AnimatePresence>
                {showVerification && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowVerification(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-gray-700/50 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    Request Verification
                                </h3>
                                <button
                                    onClick={() => setShowVerification(false)}
                                    className="text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <p className="text-gray-400 mb-4">
                                Request document verification from <span className="text-white font-medium">{candidateName || "this candidate"}</span>
                            </p>

                            {/* Document Checkboxes */}
                            <div className="space-y-2 mb-6">
                                {[
                                    { id: "id", label: "Government ID", icon: FileCheck },
                                    { id: "education", label: "Education Certificate", icon: FileCheck },
                                    { id: "employment", label: "Employment History", icon: FileCheck },
                                    { id: "reference", label: "Professional References", icon: FileCheck },
                                ].map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => toggleDoc(doc.id)}
                                        className={cn(
                                            "w-full p-3 rounded-xl border flex items-center gap-3 transition-all",
                                            verificationDocs.includes(doc.id)
                                                ? "bg-emerald-500/20 border-emerald-500/50"
                                                : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded border flex items-center justify-center",
                                            verificationDocs.includes(doc.id)
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "border-gray-600"
                                        )}>
                                            {verificationDocs.includes(doc.id) && (
                                                <CheckCircle className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <doc.icon className="w-4 h-4 text-gray-400" />
                                        <span className="text-white">{doc.label}</span>
                                    </button>
                                ))}
                            </div>

                            {!candidateEmail && (
                                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 text-sm flex items-center gap-2 mb-4">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    No email found. Request will be pending manual contact.
                                </div>
                            )}

                            {success ? (
                                <div className="p-4 bg-emerald-500/10 rounded-xl text-emerald-400 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    {success}
                                </div>
                            ) : (
                                <button
                                    onClick={handleRequestVerification}
                                    disabled={verificationDocs.length === 0 || loading === "verification"}
                                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading === "verification" ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Mail className="w-4 h-4" />
                                            Send Verification Request
                                        </>
                                    )}
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

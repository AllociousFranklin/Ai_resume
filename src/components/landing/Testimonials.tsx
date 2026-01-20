"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        quote: "Finally, a tool that actually checks the code. We skipped 3 bad hires in the first week.",
        author: "Sarah J.",
        role: "VP of Engineering",
        company: "FinTech Co"
    },
    {
        quote: "The blind mode feature is a game changer for our DE&I initiatives. Pure meritocracy.",
        author: "David L.",
        role: "Head of Talent",
        company: "ScaleUp Inc"
    },
    {
        quote: "SkillSnap scoring is the only one I trust. It matches my own manual code reviews.",
        author: "Elena R.",
        role: "Senior Staff Engineer",
        company: "Cloud Systems"
    },
    {
        quote: "We reduced our time-to-hire by 40% because we stopped interviewing unqualified candidates.",
        author: "Marcus T.",
        role: "Recruiting Manager",
        company: "TechFlow"
    },
    {
        quote: "The interactive reports save me hours of writing feedback for hiring managers.",
        author: "Jessica K.",
        role: "Technical Recruiter",
        company: "DataCorp"
    },
    {
        quote: "Integration with GitHub is seamless. It just works.",
        author: "Alex B.",
        role: "CTO",
        company: "StartupLab"
    }
];

export function Testimonials() {
    return (
        <section id="solutions" className="py-32 px-6 relative z-10 bg-[#05050A]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Loved by Engineers. <br />
                        <span className="text-purple-400">Trusted by Recruiters.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white/5 border border-white/5 rounded-2xl p-8 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className="w-4 h-4 fill-purple-500 text-purple-500" />
                                ))}
                            </div>
                            <p className="text-lg text-slate-300 mb-8 leading-relaxed">&quot;{t.quote}&quot;</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                                    {t.author.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-white font-bold text-sm">{t.author}</div>
                                    <div className="text-slate-500 text-xs">{t.role}, {t.company}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

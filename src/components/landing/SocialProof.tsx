"use client";

export function SocialProof() {
    return (
        <section className="py-12 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-8">
                    Trusted by forward-thinking teams
                </p>

                <div className="relative overflow-hidden w-full">
                    <div className="flex items-center justify-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {/* Company Logo Placeholders */}
                        <div className="text-xl font-bold text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-full"></div> Stripe</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-tr-xl"></div> Vercel</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2"><div className="w-6 h-6 border-2 border-white rounded-full"></div> OpenAI</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rotate-45"></div> Linear</div>
                        <div className="text-xl font-bold text-white flex items-center gap-2"><div className="w-6 h-6 bg-white rounded-lg"></div> Raycast</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

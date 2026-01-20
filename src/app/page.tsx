"use client";

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { SocialProof } from "@/components/landing/SocialProof";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Testimonials } from "@/components/landing/Testimonials";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30 overflow-x-hidden">
            <LandingNavbar />

            <main>
                <HeroSection />
                <SocialProof />
                <FeaturesGrid />
                <Testimonials />
                <section className="py-32 text-center relative z-10 border-t border-white/5 bg-[#030014]">
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 to-transparent -z-10"></div>
                    <div className="max-w-3xl mx-auto px-6 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to hire with precision?</h2>
                        <a
                            href="/analyze"
                            className="inline-block px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:shadow-2xl hover:shadow-purple-500/30 transition-all hover:scale-105"
                        >
                            Start Analyzing Now
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

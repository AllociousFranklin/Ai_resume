import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSnap AI | Talent Intelligence Engine",
  description: "AI-powered resume screening that verifies candidate skills through GitHub analysis and intelligent matching.",
  keywords: ["resume screening", "AI hiring", "talent intelligence", "GitHub verification", "ATS"],
  authors: [{ name: "SkillSnap AI" }],
  openGraph: {
    title: "SkillSnap AI | Talent Intelligence Engine",
    description: "Evaluate candidates with bias-proof, evidence-based AI. Feasibility over fantasy.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}

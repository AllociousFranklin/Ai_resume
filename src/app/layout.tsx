import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SkillSnap | Enterprise Talent Intelligence",
  description: "Evidence-based candidate verification and ATS for modern recruiting teams. Verify skills with GitHub data.",
  keywords: ["ATS", "recruiting", "talent intelligence", "skill verification", "hiring platform"],
  authors: [{ name: "SkillSnap" }],
  openGraph: {
    title: "SkillSnap | Enterprise Talent Intelligence",
    description: "The Applicant Tracking System that verifies skills with actual code evidence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

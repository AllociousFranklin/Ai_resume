import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/ingestion";
import { extractCombinedData, explainRanking } from "@/lib/gemini";
import { analyzeGitHub } from "@/lib/github";
import { calculateATSScore } from "@/lib/scoring";
import { verifySkills, analyzeGap } from "@/lib/analysis";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file = formData.get("resume") as File;
        const jdText = formData.get("jd") as string;
        const githubUrl = formData.get("github") as string;

        if (!file || !jdText) {
            return NextResponse.json({ error: "Resume and Job Description are required" }, { status: 400 });
        }

        // 1. Ingestion
        const buffer = Buffer.from(await file.arrayBuffer());
        const { text: resumeText, links } = await parseResume(buffer);

        // 2. Skill Extraction (Combined Request)
        const combinedData = await extractCombinedData(resumeText, jdText);
        const resumeData = combinedData.resume;
        const jdData = combinedData.jd;

        // 3. GitHub Intelligence
        // Use parsed link, fallback to empty string if not found
        const githubStats = await analyzeGitHub(links.github || "");

        // 4. Intelligence & Scoring
        const atsResult = calculateATSScore(resumeData, jdData, !!resumeData.experience_years);
        const proofResult = verifySkills([...resumeData.technical, ...resumeData.tools], githubStats);
        const gapResult = analyzeGap([...resumeData.technical, ...resumeData.tools], [...jdData.technical, ...jdData.tools]);

        // 5. Final Ranking Calculation
        // ATS * 0.35 + GitHub * 0.25 + Proof * 0.20 + Exp * 0.10 (Simplified)
        // We'll normalize "Exp" based on some heuristic if available, else 0
        const expScore = Math.min((resumeData.experience_years || 0) * 10, 100);

        const finalScore = Math.round(
            (atsResult * 0.40) +
            (githubStats.github_score * 0.30) +
            (proofResult.proof_score * 0.20) +
            (expScore * 0.10)
        );

        // 6. Explanation
        const explanation = await explainRanking(
            { ats: atsResult, github: githubStats.github_score, proof: proofResult.proof_score, skills: resumeData.technical },
            jdData.technical
        );

        return NextResponse.json({
            final_score: finalScore,
            ats_score: atsResult,
            github_stats: githubStats,
            proof_stats: proofResult,
            gap_analysis: gapResult,
            explanation,
            extracted_data: resumeData // For debugging/display
        });

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/ingestion";
import { extractCombinedData, explainRanking } from "@/lib/gemini";
import { analyzeGitHub } from "@/lib/github";
import { calculateATSScore, getHiringRecommendation } from "@/lib/scoring";
import {
    verifySkills,
    analyzeGap,
    analyzeSkillEvolution,
    evaluateProjectDepth,
    calculateFitScore
} from "@/lib/analysis";
import { getFullPrediction } from "@/lib/ml/predictions";
import { redactResume, calculateBiasRisk } from "@/lib/bias/blind-screening";

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        const formData = await req.formData();

        const file = formData.get("resume") as File;
        const jdText = formData.get("jd") as string;

        if (!file || !jdText) {
            return NextResponse.json(
                { error: "Resume and Job Description are required" },
                { status: 400 }
            );
        }

        console.log(`[API] Starting analysis for: ${file.name}`);

        // 1. Ingestion - Parse Resume
        const buffer = Buffer.from(await file.arrayBuffer());
        const { text: resumeText, links, metadata } = await parseResume(buffer, file.name);
        console.log(`[API] Resume parsed: ${metadata.wordCount} words, format: ${metadata.format}`);

        // 2. AI Extraction - Skills, Quality, Clustering
        const combinedData = await extractCombinedData(resumeText, jdText);
        const resumeData = combinedData.resume;
        const jdData = combinedData.jd;
        const qualityData = combinedData.quality;
        const clusterData = combinedData.cluster;
        console.log(`[API] AI extraction complete. Cluster: ${clusterData.type}`);

        // 3. GitHub Intelligence
        const githubUsername = links.github || "";
        const githubStats = await analyzeGitHub(githubUsername);
        console.log(`[API] GitHub analyzed. Score: ${githubStats.github_score}`);

        // 4. Calculate ATS Score
        const atsResult = calculateATSScore(
            resumeData,
            jdData,
            resumeData.experience_years,
            jdData.required_experience
        );
        console.log(`[API] ATS Score: ${atsResult.score}`);

        // 5. Skill Verification
        const allCandidateSkills = [...resumeData.technical, ...resumeData.tools];
        const proofResult = verifySkills(allCandidateSkills, githubStats);
        console.log(`[API] Proof Score: ${proofResult.proof_score}`);

        // 6. Gap Analysis
        const allJdSkills = [...jdData.technical, ...jdData.tools];
        const gapResult = analyzeGap(allCandidateSkills, allJdSkills);
        console.log(`[API] Match: ${gapResult.match_percentage}%`);

        // 7. Skill Evolution
        const skillEvolution = analyzeSkillEvolution(githubStats);
        console.log(`[API] Growth Score: ${skillEvolution.growth_score}`);

        // 8. Project Depth
        const projectDepth = evaluateProjectDepth(githubStats);
        console.log(`[API] Project Complexity: ${projectDepth.average_complexity}`);

        // 9. Calculate Final Score
        const experienceMatch = jdData.required_experience > 0
            ? resumeData.experience_years >= jdData.required_experience * 0.7
            : true;

        const finalScore = calculateFitScore(
            atsResult.score,
            githubStats.github_score,
            proofResult.proof_score,
            qualityData.score,
            experienceMatch
        );

        // 10. Get Recommendation
        const recommendation = getHiringRecommendation(finalScore);

        // 11. Generate AI Explanation
        const explanation = await explainRanking(
            {
                ats: atsResult.score,
                github: githubStats.github_score,
                proof: proofResult.proof_score,
                quality: qualityData.score,
                skills: resumeData.technical,
                cluster: clusterData.type
            },
            jdData.technical
        );

        const processingTime = Date.now() - startTime;
        console.log(`[API] Analysis complete in ${processingTime}ms`);

        // 12. ML Predictions
        const mlPredictions = getFullPrediction({
            atsScore: atsResult.score,
            githubScore: githubStats.github_score,
            proofScore: proofResult.proof_score,
            qualityScore: qualityData.score,
            experienceYears: resumeData.experience_years,
            skillMatchPercentage: gapResult.match_percentage,
            velocityScore: githubStats.velocity?.score || 0,
            clusterType: clusterData.type,
            educationLevel: resumeData.education_level
        });
        console.log(`[API] ML Predictions generated. Success probability: ${mlPredictions.success.probability}`);

        // 13. Blind Screening Analysis
        const blindScreening = redactResume(resumeText);
        const biasRisk = calculateBiasRisk(blindScreening.redactions);
        console.log(`[API] Bias risk level: ${biasRisk.level}`);

        // Return comprehensive response
        return NextResponse.json({
            // Core Scores
            final_score: finalScore,
            recommendation,

            // Breakdowns
            ats: {
                score: atsResult.score,
                breakdown: atsResult.breakdown,
                matched_skills: atsResult.matchedSkills,
                missing_skills: atsResult.missingSkills
            },

            github: {
                score: githubStats.github_score,
                username: githubUsername || null,
                proof: githubStats.proof,
                risks: githubStats.risks,
                stats: githubStats.stats,
                velocity: githubStats.velocity
            },

            proof: {
                score: proofResult.proof_score,
                proven: proofResult.proven,
                inferred: proofResult.inferred,
                missing: proofResult.missing
            },

            quality: {
                score: qualityData.score,
                formatting: qualityData.formatting,
                achievements: qualityData.achievements,
                clarity: qualityData.clarity,
                improvements: qualityData.improvements
            },

            gap_analysis: {
                match_percentage: gapResult.match_percentage,
                missing: gapResult.missing,
                critical_gaps: gapResult.critical_gaps,
                nice_to_have: gapResult.nice_to_have_gaps
            },

            skill_evolution: {
                growth_score: skillEvolution.growth_score,
                new_skills: skillEvolution.new_skills,
                mastered_skills: skillEvolution.mastered_skills,
                learning_velocity: skillEvolution.learning_velocity
            },

            project_depth: {
                complexity: projectDepth.average_complexity,
                deep_projects: projectDepth.deep_projects,
                surface_projects: projectDepth.surface_projects,
                recommendation: projectDepth.recommendation
            },

            cluster: {
                type: clusterData.type,
                confidence: clusterData.confidence,
                traits: clusterData.traits
            },

            // ML Predictions
            predictions: {
                success: {
                    probability: mlPredictions.success.probability,
                    confidence: mlPredictions.success.confidence,
                    factors: mlPredictions.success.factors
                },
                retention: {
                    two_year_probability: mlPredictions.retention.twoYearProbability,
                    risk_factors: mlPredictions.retention.riskFactors,
                    retention_factors: mlPredictions.retention.retentionFactors
                },
                growth: {
                    score: mlPredictions.growth.score,
                    trajectory: mlPredictions.growth.trajectory,
                    indicators: mlPredictions.growth.indicators
                },
                ramp_up: {
                    weeks: mlPredictions.rampUp.weeksToProductivity,
                    range: mlPredictions.rampUp.confidenceRange,
                    factors: mlPredictions.rampUp.factors
                }
            },

            // Bias Mitigation
            bias_analysis: {
                risk_score: biasRisk.score,
                risk_level: biasRisk.level,
                details: biasRisk.details,
                redactions: blindScreening.redactions
            },

            // Metadata
            explanation,
            extracted_skills: resumeData,
            jd_requirements: jdData,
            resume_metadata: metadata,
            processing_time_ms: processingTime
        });

    } catch (error: any) {
        console.error("[API] Analysis Error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

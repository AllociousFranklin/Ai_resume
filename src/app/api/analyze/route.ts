import { NextRequest, NextResponse } from "next/server";
import { parseResume, extractCandidateName, extractEmail } from "@/lib/ingestion";
import { extractCombinedData, explainRanking } from "@/lib/gemini";
import { analyzeGitHub } from "@/lib/github";
import { calculateATSScoreWithSemantic, getHiringRecommendation } from "@/lib/scoring";
import {
    matchSkillsSemantically,
    getMissingSkills,
    getCriticalGaps,
    getNiceToHaveGaps,
    getMatchPercentages
} from "@/lib/semantic-skill-engine";
import {
    verifySkills,
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
        const candidateName = extractCandidateName(resumeText);
        const candidateEmail = extractEmail(resumeText);
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

        // 4. UNIFIED SEMANTIC SKILL ENGINE (Single Source of Truth)
        console.log(`[API] Starting semantic skill matching...`);
        const semanticResult = await matchSkillsSemantically(
            { technical: jdData.technical, tools: jdData.tools, soft: jdData.soft },
            { technical: resumeData.technical, tools: resumeData.tools, soft: resumeData.soft }
        );
        console.log(`[API] Semantic matching complete: ${semanticResult.stats.matched}/${semanticResult.stats.total} matched, ${semanticResult.stats.partial} partial, ${semanticResult.stats.missing} missing`);

        // 5. Calculate ATS Score (uses semantic results)
        const atsResult = calculateATSScoreWithSemantic(
            semanticResult,
            resumeData.experience_years,
            jdData.required_experience
        );
        console.log(`[API] ATS Score (Semantic): ${atsResult.score}`);

        // 6. Gap Analysis (uses SAME semantic results - no contradictions!)
        const { overallMatch } = getMatchPercentages(semanticResult);
        const missingSkills = getMissingSkills(semanticResult);
        const criticalGaps = getCriticalGaps(semanticResult);
        const niceToHaveGaps = getNiceToHaveGaps(semanticResult);
        console.log(`[API] Gap Analysis: ${overallMatch}% match, ${missingSkills.length} missing`);

        // 7. Skill Verification (GitHub-based - independent of semantic matching)
        const allCandidateSkills = [...resumeData.technical, ...resumeData.tools];
        const proofResult = verifySkills(allCandidateSkills, githubStats);
        console.log(`[API] Proof Score: ${proofResult.proof_score}`);

        // 8. Skill Evolution
        const skillEvolution = analyzeSkillEvolution(githubStats);
        console.log(`[API] Growth Score: ${skillEvolution.growth_score}`);

        // 9. Project Depth
        const projectDepth = evaluateProjectDepth(githubStats);
        console.log(`[API] Project Complexity: ${projectDepth.average_complexity}`);

        // 10. Calculate Final Score
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

        // 11. Get Recommendation
        const recommendation = getHiringRecommendation(finalScore);

        // 12. Generate AI Explanation
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

        // 13. ML Predictions
        const mlPredictions = getFullPrediction({
            atsScore: atsResult.score,
            githubScore: githubStats.github_score,
            proofScore: proofResult.proof_score,
            qualityScore: qualityData.score,
            experienceYears: resumeData.experience_years,
            skillMatchPercentage: overallMatch,
            velocityScore: githubStats.velocity?.score || 0,
            clusterType: clusterData.type,
            educationLevel: resumeData.education_level
        });
        console.log(`[API] ML Predictions generated. Success probability: ${mlPredictions.success.probability}`);

        // 14. Blind Screening Analysis
        const blindScreening = redactResume(resumeText);
        const biasRisk = calculateBiasRisk(blindScreening.redactions);
        console.log(`[API] Bias risk level: ${biasRisk.level}`);

        // Return comprehensive response
        return NextResponse.json({
            // Core Scores
            final_score: finalScore,
            recommendation,

            // ATS Breakdown (from semantic engine)
            ats: {
                score: atsResult.score,
                breakdown: atsResult.breakdown,
                matched_skills: atsResult.matchedSkills,
                missing_skills: atsResult.missingSkills,
                matching_type: "semantic",
                semantic_stats: semanticResult.stats
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

            // Gap Analysis (from SAME semantic engine - no contradictions)
            gap_analysis: {
                match_percentage: overallMatch,
                missing: missingSkills,
                critical_gaps: criticalGaps,
                nice_to_have: niceToHaveGaps
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

            predictions: mlPredictions,

            explanation,

            bias: {
                risk_level: biasRisk.level,
                risk_score: biasRisk.score,
                redactions: blindScreening.redactions.length
            },

            extracted_skills: {
                resume: {
                    technical: resumeData.technical,
                    tools: resumeData.tools,
                    soft: resumeData.soft
                },
                jd: {
                    technical: jdData.technical,
                    tools: jdData.tools,
                    soft: jdData.soft
                }
            },

            metadata: {
                candidate_name: candidateName,
                candidate_email: candidateEmail,
                resume_format: metadata.format,
                word_count: metadata.wordCount,
                hyperlinks_found: metadata.hyperlinkCount || 0,
                github_detected: !!links.github,
                linkedin_detected: !!links.linkedin,
                experience_years: resumeData.experience_years,
                education_level: resumeData.education_level,
                processing_time_ms: processingTime
            }
        });

    } catch (error: any) {
        console.error(`[API] Analysis failed:`, error);
        return NextResponse.json(
            { error: error?.message || "Analysis failed" },
            { status: 500 }
        );
    }
}

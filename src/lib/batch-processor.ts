/**
 * Batch Processor Module (API-Efficient Version)
 * 
 * Key optimizations:
 * - Uses LOCAL semantic matching (no Gemini calls for skill matching)
 * - Rate-limited Gemini calls (1 per resume)
 * - Sequential processing to respect API limits
 * - Caching at every layer
 */

import { parseResume, extractCandidateName, extractEmail } from './ingestion';
import { extractCombinedData } from './gemini';
import { analyzeGitHub, GitHubAnalysis } from './github';
import { getHiringRecommendation } from './scoring';
import { matchSkillsLocally } from './local-semantic-map';
import { verifySkills, analyzeSkillEvolution, evaluateProjectDepth, calculateFitScore } from './analysis';
import { getFullPrediction } from './ml/predictions';
import { redactResume, calculateBiasRisk } from './bias/blind-screening';
import { batchRateLimiter } from './rate-limiter';
import { validateLink } from './link-validator';
import {
    generateCandidateId,
    generateJdHash,
    generateAnalysisCacheKey,
    resumeAnalysisCache,
    githubProfileCache
} from './cache';


export type CandidateStatus = 'success' | 'failed' | 'processing' | 'cached';

export interface CandidateResult {
    candidateId: string;
    rank: number;
    name: string | null;
    email: string | null;
    finalScore: number;
    recommendation: {
        recommendation: string;
        label: string;
        color: string;
    } | null;
    githubVerified: boolean;
    githubUsername: string | null;
    status: CandidateStatus;
    errorMessage?: string;
    processingTimeMs: number;
    fromCache: boolean;
    fullAnalysis: any | null;
}

export interface BatchResult {
    batchId: string;
    jobDescription: string;
    jdHash: string;
    totalCandidates: number;
    processed: number;
    failed: number;
    cached: number;
    candidates: CandidateResult[];
    createdAt: Date;
    processingTimeMs: number;
}

/**
 * Calculate ATS score from local matching results
 * No Gemini call - pure deterministic scoring
 */
function calculateATSScoreFromLocal(
    localResult: ReturnType<typeof matchSkillsLocally>,
    experienceYears: number,
    requiredExperience: number
) {
    const { matches, stats } = localResult;

    // Priority weights: critical=2x, preferred=1x, bonus=0.5x
    const getPriorityWeight = (m: typeof matches[0]) => {
        const priority = (m as any).priority || 'preferred';
        switch (priority) {
            case 'critical': return 2;
            case 'preferred': return 1;
            case 'bonus': return 0.5;
            default: return 1;
        }
    };

    // Calculate WEIGHTED match percentages by category
    const techMatches = matches.filter(m => m.category === 'technical');
    const toolMatches = matches.filter(m => m.category === 'tools');
    const softMatches = matches.filter(m => m.category === 'soft');

    const calcWeightedPercent = (arr: typeof matches) => {
        if (arr.length === 0) return 100;

        let weightedMatch = 0;
        let totalWeight = 0;

        arr.forEach(m => {
            const weight = getPriorityWeight(m);
            totalWeight += weight;
            if (m.status === 'matched') {
                weightedMatch += weight;
            } else if (m.status === 'partial') {
                weightedMatch += weight * 0.5; // Partial matches get half credit
            }
        });

        return totalWeight > 0 ? Math.round((weightedMatch / totalWeight) * 100) : 100;
    };

    const skillMatch = calcWeightedPercent(techMatches);
    const toolMatch = calcWeightedPercent(toolMatches);
    const softMatch = calcWeightedPercent(softMatches);

    // Experience match
    let experienceMatch = 100;
    if (requiredExperience > 0) {
        if (experienceYears >= requiredExperience) {
            experienceMatch = 100;
        } else if (experienceYears >= requiredExperience * 0.7) {
            experienceMatch = 70;
        } else if (experienceYears >= requiredExperience * 0.5) {
            experienceMatch = 50;
        } else {
            experienceMatch = 30;
        }
    }

    // Weighted keyword density
    let weightedMatchCount = 0;
    let totalWeight = 0;
    matches.forEach(m => {
        const weight = getPriorityWeight(m);
        totalWeight += weight;
        if (m.status === 'matched') weightedMatchCount += weight;
    });
    const keywordDensity = totalWeight > 0
        ? Math.round((weightedMatchCount / totalWeight) * 100)
        : 50;

    // Same formula
    const score = Math.round(
        (skillMatch * 0.35) +
        (toolMatch * 0.25) +
        (softMatch * 0.10) +
        (experienceMatch * 0.15) +
        (keywordDensity * 0.15)
    );

    const matchedSkills = matches
        .filter(m => m.status === 'matched' && m.resumeSkill)
        .map(m => `${m.jdSkill} ≈ ${m.resumeSkill}`);

    const missingSkills = matches
        .filter(m => m.status === 'missing')
        .map(m => m.jdSkill);

    // Highlight critical misses
    const criticalMisses = matches
        .filter(m => m.status === 'missing' && (m as any).priority === 'critical')
        .map(m => m.jdSkill);

    return {
        score: Math.min(Math.max(score, 0), 100),
        breakdown: { skillMatch, toolMatch, softMatch, experienceMatch, keywordDensity },
        matchedSkills,
        missingSkills,
        criticalMisses
    };
}

/**
 * Process a single resume with rate limiting
 * Uses LOCAL matching - only 1 Gemini call for extraction
 */
async function processResumeWithRetry(
    fileBuffer: Buffer,
    fileName: string,
    jdText: string,
    jdHash: string,
    maxRetries: number = 2
): Promise<CandidateResult> {
    const startTime = Date.now();
    const candidateId = generateCandidateId(fileBuffer);
    const cacheKey = generateAnalysisCacheKey(candidateId, jdHash);

    // Check cache first
    const cached = resumeAnalysisCache.get(cacheKey);
    if (cached) {
        console.log(`[BatchProcessor] Cache hit for ${candidateId}`);
        return {
            ...cached,
            fromCache: true,
            processingTimeMs: Date.now() - startTime
        };
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[BatchProcessor] Processing ${fileName} (attempt ${attempt}/${maxRetries})`);

            // 1. Parse Resume (no API call)
            const { text: resumeText, links, metadata } = await parseResume(fileBuffer, fileName);
            const candidateName = extractCandidateName(resumeText);
            const candidateEmail = extractEmail(resumeText);

            // 2. Rate-limited Gemini call (ONLY ONE per resume)
            await batchRateLimiter.waitIfNeeded();
            const combinedData = await extractCombinedData(resumeText, jdText);
            const resumeData = combinedData.resume;
            const jdData = combinedData.jd;
            const qualityData = combinedData.quality;
            const clusterData = combinedData.cluster;
            const explanation = combinedData.explanation;
            const apiMatches = combinedData.matches;
            // @ts-ignore
            const jobCategory = combinedData.job_category || "general";

            // 2.5 Adaptive Link Validation with Quality Scoring
            let linkScore = 0;
            console.log(`[BatchProcessor] Job Category: ${jobCategory}`);

            if (jobCategory === "creative" && links.portfolio) {
                const val = await validateLink(links.portfolio);
                if (val.isValid) linkScore = val.qualityScore;
            } else if (jobCategory === "general" && links.linkedin) {
                const val = await validateLink(links.linkedin);
                if (val.isValid) linkScore = val.qualityScore;
            } else if ((links.portfolio || links.linkedin) && jobCategory === "technical") {
                // Technical candidates get scaled bonus for verified portfolio/linkedin
                const url = links.portfolio || links.linkedin;
                if (url) {
                    const val = await validateLink(url);
                    if (val.isValid) linkScore = Math.round(val.qualityScore * 0.5);
                }
            }

            // 3. GitHub Analysis (with cache)
            const githubUsername = links.github || "";
            let githubStats: GitHubAnalysis;

            if (githubUsername && githubProfileCache.has(githubUsername)) {
                githubStats = githubProfileCache.get(githubUsername);
                console.log(`[BatchProcessor] GitHub cache hit for ${githubUsername}`);
            } else {
                githubStats = await analyzeGitHub(githubUsername);
                if (githubUsername) {
                    githubProfileCache.set(githubUsername, githubStats);
                }
            }

            // 4. Semantic Matching (API first, then Local)
            let localMatchResult: ReturnType<typeof matchSkillsLocally>;

            if (apiMatches && apiMatches.length > 0) {
                const matches = apiMatches.map(m => {
                    let status: "matched" | "partial" | "missing" = "missing";
                    if (m.confidence >= 0.8) status = "matched";
                    else if (m.confidence >= 0.5) status = "partial";

                    return {
                        jdSkill: m.jdSkill,
                        resumeSkill: m.resumeSkill,
                        confidence: m.confidence,
                        status,
                        category: m.category as "technical" | "tools" | "soft",
                        priority: m.priority || "preferred" // NEW: Include priority
                    };
                });

                localMatchResult = {
                    matches,
                    stats: {
                        total: matches.length,
                        matched: matches.filter(m => m.status === "matched").length,
                        partial: matches.filter(m => m.status === "partial").length,
                        missing: matches.filter(m => m.status === "missing").length
                    }
                };
                console.log(`[BatchProcessor] Using API semantic matches (${localMatchResult.stats.matched}/${localMatchResult.stats.total})`);
            } else {
                console.log(`[BatchProcessor] Fallback to Local semantic matches`);
                localMatchResult = matchSkillsLocally(
                    { technical: jdData.technical, tools: jdData.tools, soft: jdData.soft },
                    { technical: resumeData.technical, tools: resumeData.tools, soft: resumeData.soft }
                );
            }

            // 5. ATS Score (deterministic)
            const atsResult = calculateATSScoreFromLocal(
                localMatchResult,
                resumeData.experience_years,
                jdData.required_experience
            );

            // 6. Gap Analysis (from local result)
            const overallMatch = localMatchResult.stats.total > 0
                ? Math.round((localMatchResult.stats.matched / localMatchResult.stats.total) * 100)
                : 100;
            const missingSkills = localMatchResult.matches
                .filter(m => m.status === 'missing')
                .map(m => m.jdSkill);
            const criticalGaps = localMatchResult.matches
                .filter(m => m.status === 'missing' && m.category === 'technical')
                .map(m => m.jdSkill);
            const niceToHaveGaps = localMatchResult.matches
                .filter(m => m.status === 'missing' && m.category === 'soft')
                .map(m => m.jdSkill);

            // 7. Skill Verification (no API call)
            const allCandidateSkills = [...resumeData.technical, ...resumeData.tools];
            const proofResult = verifySkills(allCandidateSkills, githubStats);

            // 8. Other Analyses (no API calls)
            const skillEvolution = analyzeSkillEvolution(githubStats);
            const projectDepth = evaluateProjectDepth(githubStats);

            // 9. Final Score
            const experienceMatch = jdData.required_experience > 0
                ? resumeData.experience_years >= jdData.required_experience * 0.7
                : true;

            const finalScore = calculateFitScore(
                atsResult.score,
                githubStats.github_score,
                proofResult.proof_score,
                qualityData.score,
                experienceMatch,
                jobCategory as any,
                linkScore
            );

            // 10. Recommendation
            const recommendation = getHiringRecommendation(finalScore);

            // 11. ML Predictions
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

            // 12. Bias Analysis
            const blindScreening = redactResume(resumeText);
            const biasRisk = calculateBiasRisk(blindScreening.redactions);



            const processingTimeMs = Date.now() - startTime;

            // Build full analysis object
            const fullAnalysis = {
                final_score: finalScore,
                processing_time_ms: processingTimeMs,
                recommendation,
                explanation,
                ats: {
                    score: atsResult.score,
                    breakdown: atsResult.breakdown,
                    matched_skills: atsResult.matchedSkills,
                    missing_skills: atsResult.missingSkills,
                    matching_type: apiMatches && apiMatches.length > 0 ? "api-semantic" : "local-semantic",
                    local_stats: localMatchResult.stats
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
                quality: qualityData,
                gap_analysis: {
                    match_percentage: overallMatch,
                    missing: missingSkills,
                    critical_gaps: criticalGaps,
                    nice_to_have: niceToHaveGaps
                },
                skill_evolution: skillEvolution,
                project_depth: {
                    complexity: projectDepth.average_complexity,
                    deep_projects: projectDepth.deep_projects,
                    surface_projects: projectDepth.surface_projects,
                    recommendation: projectDepth.recommendation
                },
                cluster: clusterData,
                predictions: mlPredictions,
                bias: {
                    risk_level: biasRisk.level,
                    risk_score: biasRisk.score,
                    redactions: blindScreening.redactions.length
                },
                extracted_skills: {
                    resume: { technical: resumeData.technical, tools: resumeData.tools, soft: resumeData.soft },
                    jd: { technical: jdData.technical, tools: jdData.tools, soft: jdData.soft }
                },
                metadata: {
                    candidate_name: candidateName,
                    candidate_email: candidateEmail,
                    resume_format: metadata.format,
                    word_count: metadata.wordCount,
                    experience_years: resumeData.experience_years,
                    education_level: resumeData.education_level
                }
            };

            const result: CandidateResult = {
                candidateId,
                rank: 0, // Will be set during sorting
                name: candidateName,
                email: candidateEmail,
                finalScore,
                recommendation,
                githubVerified: !!githubUsername && githubStats.github_score > 0,
                githubUsername: githubUsername || null,
                status: 'success',
                processingTimeMs: Date.now() - startTime,
                fromCache: false,
                fullAnalysis
            };

            // Cache the result
            resumeAnalysisCache.set(cacheKey, result);

            return result;

        } catch (error: any) {
            lastError = error;
            console.error(`[BatchProcessor] Attempt ${attempt} failed for ${fileName}:`, error.message);

            // If rate limited, wait longer
            if (error.message?.includes('429') || error.message?.includes('quota')) {
                console.log(`[BatchProcessor] Rate limited, waiting 30s...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
            } else if (attempt < maxRetries) {
                // Exponential backoff: 3s, 9s
                const delay = Math.pow(3, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // All retries failed
    return {
        candidateId,
        rank: 0,
        name: fileName.replace(/\.[^/.]+$/, ''), // Use filename as name
        email: null,
        finalScore: 0,
        recommendation: null,
        githubVerified: false,
        githubUsername: null,
        status: 'failed',
        errorMessage: lastError?.message || 'Analysis failed after retries',
        processingTimeMs: Date.now() - startTime,
        fromCache: false,
        fullAnalysis: null
    };
}

/**
 * Process multiple resumes SEQUENTIALLY to respect rate limits
 * No parallel processing in batch mode - API economics matter
 */
export async function processBatch(
    files: { buffer: Buffer; name: string }[],
    jdText: string,
    concurrency: number = 1, // Force sequential for free tier
    onProgress?: (processed: number, total: number) => void
): Promise<BatchResult> {
    const startTime = Date.now();
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const jdHash = generateJdHash(jdText);

    console.log(`[BatchProcessor] Starting batch ${batchId} with ${files.length} files (sequential mode)`);

    const results: CandidateResult[] = [];

    // Process SEQUENTIALLY to respect rate limits
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const result = await processResumeWithRetry(file.buffer, file.name, jdText, jdHash);
        results.push(result);

        // Progress callback
        if (onProgress) {
            onProgress(results.length, files.length);
        }

        console.log(`[BatchProcessor] Progress: ${results.length}/${files.length}`);
    }

    // Sort by score descending
    results.sort((a, b) => b.finalScore - a.finalScore);

    // Assign ranks
    results.forEach((r, i) => { r.rank = i + 1; });

    const failed = results.filter(r => r.status === 'failed').length;
    const cached = results.filter(r => r.fromCache).length;

    console.log(`[BatchProcessor] Batch complete. Success: ${results.length - failed}, Failed: ${failed}, Cached: ${cached}`);

    return {
        batchId,
        jobDescription: jdText.slice(0, 200) + '...',
        jdHash,
        totalCandidates: files.length,
        processed: results.length,
        failed,
        cached,
        candidates: results,
        createdAt: new Date(),
        processingTimeMs: Date.now() - startTime
    };
}

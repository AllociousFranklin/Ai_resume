/**
 * Scoring Module
 * 
 * ATS scoring now uses the Unified Semantic Skill Engine.
 * All skill matching is done once, then consumed here.
 */

import {
    SemanticEngineResult,
    getMatchPercentages,
    getMatchedSkills,
    getMissingSkills,
    THRESHOLDS
} from "./semantic-skill-engine";

// Types
export interface Skills {
    technical: string[];
    tools: string[];
    soft: string[];
}

export interface ATSResult {
    score: number;
    breakdown: {
        skillMatch: number;
        toolMatch: number;
        softMatch: number;
        experienceMatch: number;
        keywordDensity: number;
    };
    matchedSkills: string[];
    missingSkills: string[];
}

/**
 * Calculate ATS score using semantic (AI-interpreted) skill matching
 * 
 * Uses the Unified Semantic Skill Engine results.
 * - "JS" matches "JavaScript" (confidence: 0.95)
 * - "CLI" matches "Bash" (confidence: 0.91)
 * 
 * AI interprets meaning. Code calculates score.
 * Only matches with status === "matched" are counted.
 */
export function calculateATSScoreWithSemantic(
    semanticResult: SemanticEngineResult,
    experienceYears: number,
    requiredExperience: number
): ATSResult {
    // Get match percentages from semantic engine
    const { skillMatch, toolMatch, softMatch, overallMatch } = getMatchPercentages(semanticResult);

    // Experience match (tiered scoring)
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

    // Keyword density from semantic stats
    const { total, matched } = semanticResult.stats;
    const keywordDensity = total > 0
        ? Math.round((matched / total) * 100)
        : 50;

    // SAME FORMULA - deterministic scoring
    const score = Math.round(
        (skillMatch * 0.35) +
        (toolMatch * 0.25) +
        (softMatch * 0.10) +
        (experienceMatch * 0.15) +
        (keywordDensity * 0.15)
    );

    // Get matched and missing from semantic engine (SAME SOURCE)
    const matchedSkills = getMatchedSkills(semanticResult);
    const missingSkills = getMissingSkills(semanticResult);

    console.log(`[ATS-Semantic] Score: ${score} | Matched: ${matched}/${total} | Threshold: ${THRESHOLDS.MATCHED}`);

    return {
        score: Math.min(Math.max(score, 0), 100),
        breakdown: {
            skillMatch,
            toolMatch,
            softMatch,
            experienceMatch,
            keywordDensity
        },
        matchedSkills,
        missingSkills
    };
}

/**
 * Calculate hiring recommendation based on final score
 */
export function getHiringRecommendation(finalScore: number): {
    recommendation: "strong_yes" | "yes" | "maybe" | "no";
    label: string;
    color: string;
} {
    if (finalScore >= 80) {
        return { recommendation: "strong_yes", label: "Strong Candidate", color: "emerald" };
    } else if (finalScore >= 65) {
        return { recommendation: "yes", label: "Good Fit", color: "green" };
    } else if (finalScore >= 45) {
        return { recommendation: "maybe", label: "Consider", color: "amber" };
    } else {
        return { recommendation: "no", label: "Not Recommended", color: "rose" };
    }
}

/**
 * Compare two candidates
 */
export function compareCandidates(
    candidate1: { name: string; score: number; skills: string[] },
    candidate2: { name: string; score: number; skills: string[] }
): {
    winner: string;
    scoreDiff: number;
    uniqueSkills1: string[];
    uniqueSkills2: string[];
} {
    const skills1Set = new Set(candidate1.skills.map(s => s.toLowerCase()));
    const skills2Set = new Set(candidate2.skills.map(s => s.toLowerCase()));

    const uniqueSkills1 = candidate1.skills.filter(s => !skills2Set.has(s.toLowerCase()));
    const uniqueSkills2 = candidate2.skills.filter(s => !skills1Set.has(s.toLowerCase()));

    return {
        winner: candidate1.score >= candidate2.score ? candidate1.name : candidate2.name,
        scoreDiff: Math.abs(candidate1.score - candidate2.score),
        uniqueSkills1,
        uniqueSkills2
    };
}

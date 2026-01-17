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
 * Calculate comprehensive ATS score
 */
export function calculateATSScore(
    candidateSkills: Skills,
    jdSkills: Skills,
    experienceYears: number,
    requiredExperience: number
): ATSResult {
    // Flatten and normalize skills
    const candidateTech = new Set(candidateSkills.technical.map(s => s.toLowerCase()));
    const candidateTools = new Set(candidateSkills.tools.map(s => s.toLowerCase()));
    const candidateSoft = new Set(candidateSkills.soft.map(s => s.toLowerCase()));

    const jdTech = jdSkills.technical.map(s => s.toLowerCase());
    const jdTools = jdSkills.tools.map(s => s.toLowerCase());
    const jdSoft = jdSkills.soft.map(s => s.toLowerCase());

    // Calculate matches
    const techMatched = jdTech.filter(s => candidateTech.has(s));
    const toolsMatched = jdTools.filter(s => candidateTools.has(s));
    const softMatched = jdSoft.filter(s => candidateSoft.has(s));

    // Calculate match percentages
    const skillMatch = jdTech.length > 0 ? Math.round((techMatched.length / jdTech.length) * 100) : 100;
    const toolMatch = jdTools.length > 0 ? Math.round((toolsMatched.length / jdTools.length) * 100) : 100;
    const softMatch = jdSoft.length > 0 ? Math.round((softMatched.length / jdSoft.length) * 100) : 100;

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

    // Keyword density bonus (high overlap is good)
    const totalJdSkills = jdTech.length + jdTools.length;
    const totalMatched = techMatched.length + toolsMatched.length;
    const keywordDensity = totalJdSkills > 0
        ? Math.round((totalMatched / totalJdSkills) * 100)
        : 50;

    // Calculate weighted ATS score
    const score = Math.round(
        (skillMatch * 0.35) +
        (toolMatch * 0.25) +
        (softMatch * 0.10) +
        (experienceMatch * 0.15) +
        (keywordDensity * 0.15)
    );

    // Compile matched and missing skills
    const matchedSkills = [...techMatched, ...toolsMatched];
    const missingSkills = [
        ...jdTech.filter(s => !candidateTech.has(s)),
        ...jdTools.filter(s => !candidateTools.has(s))
    ];

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
 * Calculate hiring recommendation
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

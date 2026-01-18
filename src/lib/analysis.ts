import { GitHubAnalysis } from "./github";

// Types
export interface SkillVerification {
    proof_score: number;
    proven: string[];
    missing: string[];
    inferred: string[];
}

export interface GapAnalysis {
    missing: string[];
    match_percentage: number;
    critical_gaps: string[];
    nice_to_have_gaps: string[];
}

export interface SkillEvolution {
    growth_score: number; // 0-100
    new_skills: string[];
    mastered_skills: string[];
    learning_velocity: "fast" | "moderate" | "slow";
}

export interface ProjectDepth {
    average_complexity: number;
    deep_projects: number;
    surface_projects: number;
    recommendation: string;
}

/**
 * Verify skills against GitHub proof
 */
export function verifySkills(claimedSkills: string[], githubStats: GitHubAnalysis): SkillVerification {
    const proven: string[] = [];
    const missing: string[] = [];
    const inferred: string[] = [];

    const githubLanguages = new Set(
        (githubStats?.stats?.languages || []).map((l: string) => l.toLowerCase())
    );

    // Skill to language mapping for inference
    const skillMappings: Record<string, string[]> = {
        "react": ["javascript", "typescript"],
        "react.js": ["javascript", "typescript"],
        "next.js": ["javascript", "typescript"],
        "nextjs": ["javascript", "typescript"],
        "vue": ["javascript", "typescript"],
        "vue.js": ["javascript", "typescript"],
        "angular": ["javascript", "typescript"],
        "node.js": ["javascript", "typescript"],
        "nodejs": ["javascript", "typescript"],
        "express": ["javascript", "typescript"],
        "express.js": ["javascript", "typescript"],
        "django": ["python"],
        "flask": ["python"],
        "fastapi": ["python"],
        "pandas": ["python"],
        "numpy": ["python"],
        "tensorflow": ["python"],
        "pytorch": ["python"],
        "spring": ["java", "kotlin"],
        "spring boot": ["java", "kotlin"],
        "rails": ["ruby"],
        "ruby on rails": ["ruby"],
        "laravel": ["php"],
        "asp.net": ["c#"],
        ".net": ["c#"],
        "unity": ["c#"],
        "flutter": ["dart"],
        "android": ["java", "kotlin"],
        "ios": ["swift", "objective-c"],
        "swiftui": ["swift"],
        "tailwind": ["javascript", "typescript", "html"],
        "sass": ["css", "scss"],
        "graphql": ["javascript", "typescript"],
        "mongodb": ["javascript", "typescript", "python"],
        "postgresql": ["javascript", "typescript", "python", "go"],
        "docker": ["dockerfile", "shell"],
        "kubernetes": ["yaml", "go"],
        "aws": ["python", "javascript", "typescript"],
        "terraform": ["hcl"],
    };

    claimedSkills.forEach(skill => {
        const s = skill.toLowerCase().trim();

        // Direct language match
        if (githubLanguages.has(s)) {
            proven.push(skill);
            return;
        }

        // Check if skill can be inferred from languages
        const mappedLanguages = skillMappings[s];
        if (mappedLanguages) {
            const hasLanguage = mappedLanguages.some(lang => githubLanguages.has(lang));
            if (hasLanguage) {
                inferred.push(skill);
                return;
            }
        }

        // Check partial matches (e.g., "React Native" matches if "javascript" exists)
        const words = s.split(/\s+/);
        for (const word of words) {
            if (skillMappings[word]) {
                const hasLang = skillMappings[word].some(lang => githubLanguages.has(lang));
                if (hasLang) {
                    inferred.push(skill);
                    return;
                }
            }
        }

        missing.push(skill);
    });

    // Calculate proof score (proven = 100%, inferred = 70%, missing = 0%)
    const totalSkills = claimedSkills.length || 1;
    const proofScore = Math.round(
        ((proven.length * 100) + (inferred.length * 70)) / totalSkills
    );

    return {
        proof_score: Math.min(proofScore, 100),
        proven,
        missing,
        inferred
    };
}

/**
 * Analyze gaps between candidate skills and JD requirements
 */
export function analyzeGap(
    candidateSkills: string[],
    jdSkills: string[],
    jdCriticalSkills?: string[]
): GapAnalysis {
    const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase().trim()));

    const missing = jdSkills.filter(s => !candidateSet.has(s.toLowerCase().trim()));

    // Determine critical vs nice-to-have gaps
    const criticalSet = new Set((jdCriticalSkills || jdSkills.slice(0, 5)).map(s => s.toLowerCase()));
    const critical_gaps = missing.filter(s => criticalSet.has(s.toLowerCase()));
    const nice_to_have_gaps = missing.filter(s => !criticalSet.has(s.toLowerCase()));

    const matchPercentage = Math.round(
        ((jdSkills.length - missing.length) / (jdSkills.length || 1)) * 100
    );

    return {
        missing,
        match_percentage: matchPercentage,
        critical_gaps,
        nice_to_have_gaps
    };
}

/**
 * Analyze skill evolution based on GitHub history
 */
export function analyzeSkillEvolution(githubStats: GitHubAnalysis): SkillEvolution {
    const { skillEvolution, velocity, stats } = githubStats;

    const newSkills = skillEvolution?.newLanguagesLastYear || [];
    const masteredSkills = skillEvolution?.consistentLanguages || [];

    // Calculate growth score
    let growthScore = 0;
    growthScore += newSkills.length * 20; // New skills are valuable
    growthScore += masteredSkills.length * 10; // Consistency is good
    growthScore += velocity?.score ? velocity.score * 0.3 : 0; // Activity matters
    growthScore += stats?.avgCommitsPerWeek > 5 ? 20 : stats?.avgCommitsPerWeek > 2 ? 10 : 0;

    growthScore = Math.min(Math.round(growthScore), 100);

    // Determine learning velocity
    let learningVelocity: "fast" | "moderate" | "slow" = "moderate";
    if (newSkills.length >= 3 && velocity?.trend === "increasing") {
        learningVelocity = "fast";
    } else if (newSkills.length === 0 && velocity?.trend === "decreasing") {
        learningVelocity = "slow";
    }

    return {
        growth_score: growthScore,
        new_skills: newSkills,
        mastered_skills: masteredSkills,
        learning_velocity: learningVelocity
    };
}

/**
 * Evaluate project depth based on repository metrics
 */
export function evaluateProjectDepth(githubStats: GitHubAnalysis): ProjectDepth {
    const { stats } = githubStats;

    // Heuristic: Calculate based on stars, languages, and activity
    const avgComplexity = Math.min(
        Math.round(
            (stats.totalStars * 5) +
            (stats.languages.length * 10) +
            (stats.activeRepos * 8)
        ),
        100
    );

    // Estimate deep vs surface projects
    // Deep: original repos with stars or multiple languages
    const deepProjects = Math.min(
        Math.round((stats.originalRepos * 0.4) + (stats.totalStars / 10)),
        stats.originalRepos
    );
    const surfaceProjects = stats.originalRepos - deepProjects;

    // Generate recommendation
    let recommendation = "";
    if (avgComplexity >= 70) {
        recommendation = "Strong technical depth. Ready for complex projects.";
    } else if (avgComplexity >= 40) {
        recommendation = "Moderate depth. May need mentoring on complex architecture.";
    } else {
        recommendation = "Limited project complexity. Consider technical assessment.";
    }

    return {
        average_complexity: avgComplexity,
        deep_projects: deepProjects,
        surface_projects: surfaceProjects,
        recommendation
    };
}

/**
 * Calculate overall candidate fit score
 */
export function calculateFitScore(
    atsScore: number,
    githubScore: number,
    proofScore: number,
    qualityScore: number,
    experienceMatch: boolean,
    jobCategory: "technical" | "general" | "creative" = "technical",
    linkScore: number = 0
): number {
    // Dynamic weights based on category
    let weights;

    switch (jobCategory) {
        case "creative":
            // Portfolio is king
            weights = { ats: 0.20, github: 0.00, proof: 0.00, quality: 0.30, experience: 0.10, link: 0.40 };
            break;
        case "general":
            // Identity/LinkedIn is key
            weights = { ats: 0.40, github: 0.00, proof: 0.00, quality: 0.10, experience: 0.20, link: 0.30 };
            break;
        case "technical":
        default:
            // GitHub & Skills are king
            weights = { ats: 0.30, github: 0.25, proof: 0.20, quality: 0.15, experience: 0.10, link: 0.00 };
            break;
    }

    const expBonus = experienceMatch ? 100 : 50;

    let finalScore = (atsScore * weights.ats) +
        (githubScore * weights.github) +
        (proofScore * weights.proof) +
        (qualityScore * weights.quality) +
        (expBonus * weights.experience) +
        (linkScore * weights.link);

    // For technical roles, links are a bonus (capped at 100)
    if (jobCategory === "technical" && linkScore > 0) {
        finalScore += (linkScore * 0.05); // 5% bonus for valid links
    }

    return Math.round(Math.min(finalScore, 100));
}

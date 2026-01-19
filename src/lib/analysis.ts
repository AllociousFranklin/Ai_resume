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
 * Verify skills against GitHub proof using LANGUAGE-BASED verification only
 * 
 * Categories:
 * - PROVEN: Skill IS a GitHub language directly detected (Python, Java, etc.)
 * - INFERRED: Skill is a framework/library that requires a detected language (React → JS/TS)
 * - UNVERIFIED: No GitHub language evidence found
 * 
 * Scoring:
 * - Direct language match: 100 points (full proof)
 * - Framework inference: 70 points (strong inference)
 * - Tool with language proxy: 50 points (partial proof)
 * - No match: 0 points
 */
export function verifySkills(claimedSkills: string[], githubStats: GitHubAnalysis): SkillVerification {
    const proven: string[] = [];
    const inferred: string[] = [];
    const missing: string[] = [];

    // Get GitHub's detected languages (the ONLY reliable source)
    const githubLanguages = new Set(
        (githubStats?.stats?.languages || []).map((l: string) => l.toLowerCase())
    );

    // Comprehensive skill → required language mappings
    const skillToLanguage: Record<string, { languages: string[], weight: number }> = {
        // JavaScript/TypeScript ecosystem (full weight - 70)
        "react": { languages: ["javascript", "typescript"], weight: 70 },
        "react.js": { languages: ["javascript", "typescript"], weight: 70 },
        "reactjs": { languages: ["javascript", "typescript"], weight: 70 },
        "next.js": { languages: ["javascript", "typescript"], weight: 70 },
        "nextjs": { languages: ["javascript", "typescript"], weight: 70 },
        "vue": { languages: ["javascript", "typescript"], weight: 70 },
        "vue.js": { languages: ["javascript", "typescript"], weight: 70 },
        "vuejs": { languages: ["javascript", "typescript"], weight: 70 },
        "angular": { languages: ["javascript", "typescript"], weight: 70 },
        "svelte": { languages: ["javascript", "typescript"], weight: 70 },
        "node.js": { languages: ["javascript", "typescript"], weight: 70 },
        "nodejs": { languages: ["javascript", "typescript"], weight: 70 },
        "node": { languages: ["javascript", "typescript"], weight: 70 },
        "express": { languages: ["javascript", "typescript"], weight: 70 },
        "express.js": { languages: ["javascript", "typescript"], weight: 70 },
        "nestjs": { languages: ["typescript"], weight: 70 },
        "graphql": { languages: ["javascript", "typescript"], weight: 70 },
        "redux": { languages: ["javascript", "typescript"], weight: 70 },
        "jquery": { languages: ["javascript"], weight: 70 },
        "webpack": { languages: ["javascript", "typescript"], weight: 50 },
        "vite": { languages: ["javascript", "typescript"], weight: 50 },
        "tailwind": { languages: ["javascript", "typescript", "html", "css"], weight: 50 },
        "tailwindcss": { languages: ["javascript", "typescript", "html", "css"], weight: 50 },

        // Python ecosystem
        "django": { languages: ["python"], weight: 70 },
        "flask": { languages: ["python"], weight: 70 },
        "fastapi": { languages: ["python"], weight: 70 },
        "pandas": { languages: ["python"], weight: 70 },
        "numpy": { languages: ["python"], weight: 70 },
        "tensorflow": { languages: ["python"], weight: 70 },
        "pytorch": { languages: ["python"], weight: 70 },
        "keras": { languages: ["python"], weight: 70 },
        "scikit-learn": { languages: ["python"], weight: 70 },
        "sklearn": { languages: ["python"], weight: 70 },
        "opencv": { languages: ["python", "c++"], weight: 70 },
        "beautifulsoup": { languages: ["python"], weight: 70 },
        "selenium": { languages: ["python", "java"], weight: 70 },
        "streamlit": { languages: ["python"], weight: 70 },

        // Java/Kotlin ecosystem
        "spring": { languages: ["java", "kotlin"], weight: 70 },
        "spring boot": { languages: ["java", "kotlin"], weight: 70 },
        "springboot": { languages: ["java", "kotlin"], weight: 70 },
        "hibernate": { languages: ["java"], weight: 70 },
        "maven": { languages: ["java"], weight: 50 },
        "gradle": { languages: ["java", "kotlin", "groovy"], weight: 50 },
        "android": { languages: ["java", "kotlin"], weight: 70 },

        // C#/.NET ecosystem
        "asp.net": { languages: ["c#"], weight: 70 },
        ".net": { languages: ["c#"], weight: 70 },
        "dotnet": { languages: ["c#"], weight: 70 },
        "unity": { languages: ["c#"], weight: 70 },
        "xamarin": { languages: ["c#"], weight: 70 },
        "blazor": { languages: ["c#"], weight: 70 },

        // Ruby ecosystem
        "rails": { languages: ["ruby"], weight: 70 },
        "ruby on rails": { languages: ["ruby"], weight: 70 },
        "sinatra": { languages: ["ruby"], weight: 70 },

        // PHP ecosystem
        "laravel": { languages: ["php"], weight: 70 },
        "symfony": { languages: ["php"], weight: 70 },
        "wordpress": { languages: ["php"], weight: 70 },

        // Go ecosystem
        "gin": { languages: ["go"], weight: 70 },
        "golang": { languages: ["go"], weight: 100 }, // Direct alias

        // Rust ecosystem
        "actix": { languages: ["rust"], weight: 70 },
        "tokio": { languages: ["rust"], weight: 70 },

        // Mobile
        "flutter": { languages: ["dart"], weight: 70 },
        "react native": { languages: ["javascript", "typescript"], weight: 70 },
        "swiftui": { languages: ["swift"], weight: 70 },
        "ios": { languages: ["swift", "objective-c"], weight: 70 },

        // DevOps/Cloud (partial weight - 50, as these often exist without code)
        "docker": { languages: ["dockerfile", "shell", "python", "go"], weight: 50 },
        "kubernetes": { languages: ["yaml", "go", "python"], weight: 50 },
        "terraform": { languages: ["hcl"], weight: 50 },
        "ansible": { languages: ["yaml", "python"], weight: 50 },
        "aws": { languages: ["python", "javascript", "typescript", "go"], weight: 50 },
        "azure": { languages: ["python", "javascript", "c#"], weight: 50 },
        "gcp": { languages: ["python", "go", "javascript"], weight: 50 },
        "ci/cd": { languages: ["yaml", "shell"], weight: 50 },

        // Databases (partial weight - 50)
        "mongodb": { languages: ["javascript", "typescript", "python"], weight: 50 },
        "postgresql": { languages: ["sql", "python", "javascript"], weight: 50 },
        "mysql": { languages: ["sql", "python", "javascript", "php"], weight: 50 },
        "redis": { languages: ["python", "javascript", "go"], weight: 50 },
        "firebase": { languages: ["javascript", "typescript"], weight: 50 },

        // Data/ML
        "machine learning": { languages: ["python", "r"], weight: 70 },
        "deep learning": { languages: ["python"], weight: 70 },
        "data science": { languages: ["python", "r"], weight: 70 },
        "nlp": { languages: ["python"], weight: 70 },
        "computer vision": { languages: ["python", "c++"], weight: 70 },
    };

    // Direct language aliases (100 weight - these ARE the language)
    const directLanguages = new Set([
        "python", "javascript", "typescript", "java", "c++", "c#", "c",
        "go", "rust", "ruby", "php", "swift", "kotlin", "scala", "r",
        "dart", "html", "css", "sql", "shell", "bash", "powershell"
    ]);

    let totalScore = 0;

    claimedSkills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        let score = 0;
        let category: "proven" | "inferred" | "missing" = "missing";

        // Check 1: Direct language match (100% proof)
        if (directLanguages.has(s) && githubLanguages.has(s)) {
            score = 100;
            category = "proven";
        }
        // Check 2: Framework/tool inference
        else if (skillToLanguage[s]) {
            const mapping = skillToLanguage[s];
            const hasLanguage = mapping.languages.some(lang => githubLanguages.has(lang));
            if (hasLanguage) {
                score = mapping.weight;
                category = mapping.weight >= 70 ? "inferred" : "inferred";
            }
        }
        // Check 3: Partial word matching (e.g., "React.js development" → check "react")
        else {
            const words = s.split(/[\s.,\/\-]+/);
            for (const word of words) {
                if (directLanguages.has(word) && githubLanguages.has(word)) {
                    score = 100;
                    category = "proven";
                    break;
                }
                if (skillToLanguage[word]) {
                    const mapping = skillToLanguage[word];
                    const hasLang = mapping.languages.some(lang => githubLanguages.has(lang));
                    if (hasLang) {
                        score = mapping.weight;
                        category = "inferred";
                        break;
                    }
                }
            }
        }

        // Categorize
        if (category === "proven") {
            proven.push(skill);
        } else if (category === "inferred") {
            inferred.push(skill);
        } else {
            missing.push(skill);
        }

        totalScore += score;
    });

    // Calculate average proof score
    const totalSkills = claimedSkills.length || 1;
    const proofScore = Math.round(totalScore / totalSkills);

    return {
        proof_score: Math.min(proofScore, 100),
        proven,
        inferred,
        missing
    };
}

/**
 * ENHANCED Proof Score with new formula:
 * Proof = (Experience Relevance × 0.4) + (Project Match × 0.4) + (Language Match × 0.2)
 * 
 * This measures ACTUAL relevance, not just language detection.
 */
export interface EnhancedProofResult extends SkillVerification {
    experienceRelevance: number;
    projectMatch: number;
    languageMatch: number;
    matchedProjects: string[];
}

export function calculateEnhancedProofScore(
    claimedSkills: string[],
    resumeProjects: string[],
    experienceYears: number,
    requiredExperience: number,
    githubStats: GitHubAnalysis
): EnhancedProofResult {
    const proven: string[] = [];
    const missing: string[] = [];
    const inferred: string[] = [];
    const matchedProjects: string[] = [];

    // 1. Experience Relevance (0-100)
    let experienceRelevance = 100;
    if (requiredExperience > 0) {
        if (experienceYears >= requiredExperience) {
            experienceRelevance = 100;
        } else if (experienceYears >= requiredExperience * 0.8) {
            experienceRelevance = 85;
        } else if (experienceYears >= requiredExperience * 0.6) {
            experienceRelevance = 70;
        } else if (experienceYears >= requiredExperience * 0.4) {
            experienceRelevance = 50;
        } else {
            experienceRelevance = 30;
        }
    }

    // 2. Project Match (Resume projects vs GitHub repos)
    const repoNames = githubStats?.stats?.repoNames || [];
    const repoDescriptions = githubStats?.stats?.repoDescriptions || [];
    const allGithubText = [...repoNames, ...repoDescriptions].join(' ').toLowerCase();

    let projectMatchCount = 0;
    resumeProjects.forEach(project => {
        const projectLower = project.toLowerCase();
        // Check if project name or keywords appear in GitHub
        const words = projectLower.split(/\s+/).filter(w => w.length > 3);
        const hasMatch = words.some(word => allGithubText.includes(word));
        if (hasMatch) {
            projectMatchCount++;
            matchedProjects.push(project);
        }
    });

    const projectMatch = resumeProjects.length > 0
        ? Math.round((projectMatchCount / resumeProjects.length) * 100)
        : 50; // Default if no projects listed

    // 3. Language Match (simplified from original)
    const githubLanguages = new Set(
        (githubStats?.stats?.languages || []).map((l: string) => l.toLowerCase())
    );

    let languageMatchCount = 0;
    const technicalSkills = claimedSkills.filter(s => !s.toLowerCase().includes('communication'));

    technicalSkills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        if (githubLanguages.has(skillLower)) {
            proven.push(skill);
            languageMatchCount++;
        } else {
            // Check if skill can be inferred
            const inferMap: Record<string, string[]> = {
                "react": ["javascript", "typescript"],
                "vue": ["javascript", "typescript"],
                "angular": ["javascript", "typescript"],
                "node": ["javascript", "typescript"],
                "django": ["python"],
                "flask": ["python"],
                "spring": ["java", "kotlin"],
            };

            const mappedLangs = Object.entries(inferMap)
                .filter(([key]) => skillLower.includes(key))
                .flatMap(([_, langs]) => langs);

            if (mappedLangs.some(lang => githubLanguages.has(lang))) {
                inferred.push(skill);
                languageMatchCount += 0.5; // Partial credit
            } else {
                missing.push(skill);
            }
        }
    });

    const languageMatch = technicalSkills.length > 0
        ? Math.round((languageMatchCount / technicalSkills.length) * 100)
        : 50;

    // Final Score: Weighted average
    const proofScore = Math.round(
        (experienceRelevance * 0.4) +
        (projectMatch * 0.4) +
        (languageMatch * 0.2)
    );

    return {
        proof_score: Math.min(proofScore, 100),
        proven,
        missing,
        inferred,
        experienceRelevance,
        projectMatch,
        languageMatch,
        matchedProjects
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
 * 
 * Enhanced Signals:
 * - Stars: Community validation
 * - Languages: Tech diversity
 * - Repo Size: Code volume (>1MB = serious project)
 * - Descriptions: Documentation maturity
 * - Activity: Ongoing maintenance
 */
export function evaluateProjectDepth(githubStats: GitHubAnalysis): ProjectDepth {
    const { stats } = githubStats;

    // Component scores (0-25 each, total = 100)
    const starScore = Math.min(stats.totalStars * 3, 25);
    const languageScore = Math.min(stats.languages.length * 5, 25);
    const activityScore = Math.min(stats.activeRepos * 5, 25);

    // NEW: Size score (repos over 1MB = 1000KB indicate real projects)
    const largeRepos = stats.totalRepoSize > 5000 ? 25 :
        stats.totalRepoSize > 1000 ? 15 :
            stats.totalRepoSize > 500 ? 10 : 5;

    // NEW: Documentation score (well-described repos)
    const docScore = stats.reposWithDescription > 5 ? 10 :
        stats.reposWithDescription > 2 ? 5 : 0;

    const avgComplexity = Math.min(
        Math.round(starScore + languageScore + activityScore + largeRepos + docScore),
        100
    );

    // Estimate deep vs surface projects
    // Deep: original repos with stars OR large size OR good documentation
    const deepProjects = Math.min(
        Math.round(
            (stats.originalRepos * 0.3) +
            (stats.totalStars / 10) +
            (stats.reposWithDescription * 0.2)
        ),
        stats.originalRepos
    );
    const surfaceProjects = Math.max(0, stats.originalRepos - deepProjects);

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

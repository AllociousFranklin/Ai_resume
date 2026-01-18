/**
 * Local Semantic Mapping
 * 
 * Used for batch mode to avoid Gemini API calls.
 * Covers 80%+ of common skill synonyms.
 * 
 * No AI needed. Just smart engineering.
 */

// Bidirectional mapping - will be expanded to handle both directions
export const SEMANTIC_MAP: Record<string, string> = {
    // JavaScript ecosystem
    "js": "javascript",
    "es6": "javascript",
    "es2015": "javascript",
    "ecmascript": "javascript",
    "vanilla js": "javascript",

    // TypeScript
    "ts": "typescript",

    // Node.js
    "node": "node.js",
    "nodejs": "node.js",
    "node js": "node.js",

    // React ecosystem
    "react.js": "react",
    "reactjs": "react",
    "react js": "react",
    "next": "next.js",
    "nextjs": "next.js",
    "next js": "next.js",

    // Vue ecosystem
    "vue.js": "vue",
    "vuejs": "vue",
    "vue js": "vue",
    "nuxt": "nuxt.js",
    "nuxtjs": "nuxt.js",

    // Angular
    "angular.js": "angular",
    "angularjs": "angular",

    // Python
    "python3": "python",
    "python 3": "python",
    "py": "python",

    // Databases
    "postgres": "postgresql",
    "psql": "postgresql",
    "mongo": "mongodb",
    "mysql db": "mysql",
    "mssql": "sql server",
    "ms sql": "sql server",

    // Cloud
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "azure cloud": "azure",
    "microsoft azure": "azure",

    // DevOps
    "k8s": "kubernetes",
    "kube": "kubernetes",
    "docker containers": "docker",
    "containerization": "docker",
    "ci/cd": "cicd",
    "ci cd": "cicd",
    "continuous integration": "cicd",
    "github actions": "cicd",
    "jenkins": "cicd",
    "gitlab ci": "cicd",

    // CLI/Terminal
    "cli": "command line",
    "terminal": "command line",
    "bash": "shell",
    "zsh": "shell",
    "powershell": "shell",
    "shell scripting": "shell",

    // Machine Learning
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "deep learning": "machine learning",
    "neural networks": "machine learning",
    "nlp": "natural language processing",
    "cv": "computer vision",

    // Frontend
    "css3": "css",
    "html5": "html",
    "sass": "scss",
    "less css": "css",
    "tailwind": "tailwindcss",
    "tailwind css": "tailwindcss",
    "bootstrap css": "bootstrap",

    // Backend frameworks
    "express.js": "express",
    "expressjs": "express",
    "fastapi": "fast api",
    "django rest": "django",
    "drf": "django",
    "spring boot": "spring",
    "springboot": "spring",
    "ruby on rails": "rails",
    "ror": "rails",

    // Mobile
    "react native": "react-native",
    "rn": "react-native",
    "ios development": "ios",
    "swift ui": "swiftui",
    "android development": "android",

    // Version Control
    "git": "git",
    "github": "git",
    "gitlab": "git",
    "bitbucket": "git",
    "version control": "git",

    // APIs
    "rest api": "rest",
    "restful": "rest",
    "restful api": "rest",
    "graphql api": "graphql",

    // Testing
    "unit testing": "testing",
    "jest": "testing",
    "mocha": "testing",
    "pytest": "testing",
    "cypress": "e2e testing",
    "selenium": "e2e testing",

    // Soft skills
    "communication skills": "communication",
    "team work": "teamwork",
    "team player": "teamwork",
    "problem solving": "problem-solving",
    "analytical skills": "analytical",
    "leadership skills": "leadership",
    "project management": "project-management",
    "time management": "time-management",
    "agile methodology": "agile",
    "scrum methodology": "scrum",
};

/**
 * Normalize a skill to its canonical form
 */
export function normalizeSkill(skill: string): string {
    const lower = skill.toLowerCase().trim();
    return SEMANTIC_MAP[lower] || lower;
}

/**
 * Check if two skills are semantically equivalent
 */
export function areSkillsEquivalent(skill1: string, skill2: string): boolean {
    const norm1 = normalizeSkill(skill1);
    const norm2 = normalizeSkill(skill2);
    return norm1 === norm2;
}

/**
 * Find matching skill from a list using local semantic map
 */
export function findLocalMatch(
    jdSkill: string,
    resumeSkills: string[]
): { match: string | null; confidence: number } {
    const normalizedJd = normalizeSkill(jdSkill);

    // First: exact match after normalization
    for (const rs of resumeSkills) {
        if (normalizeSkill(rs) === normalizedJd) {
            return { match: rs, confidence: 0.95 };
        }
    }

    // Second: partial match (one contains the other)
    for (const rs of resumeSkills) {
        const normRs = normalizeSkill(rs);
        if (normRs.includes(normalizedJd) || normalizedJd.includes(normRs)) {
            return { match: rs, confidence: 0.85 };
        }
    }

    return { match: null, confidence: 0 };
}

/**
 * Match all JD skills against resume skills using local map
 * Used for batch mode - no Gemini calls!
 */
export function matchSkillsLocally(
    jdSkills: { technical: string[]; tools: string[]; soft: string[] },
    resumeSkills: { technical: string[]; tools: string[]; soft: string[] }
): {
    matches: Array<{
        jdSkill: string;
        resumeSkill: string | null;
        confidence: number;
        status: "matched" | "partial" | "missing";
        category: "technical" | "tools" | "soft";
    }>;
    stats: {
        total: number;
        matched: number;
        partial: number;
        missing: number;
    };
} {
    const allResumeSkills = [
        ...resumeSkills.technical,
        ...resumeSkills.tools,
        ...resumeSkills.soft
    ];

    const results: Array<{
        jdSkill: string;
        resumeSkill: string | null;
        confidence: number;
        status: "matched" | "partial" | "missing";
        category: "technical" | "tools" | "soft";
    }> = [];

    // Process each category
    const processCategory = (
        skills: string[],
        category: "technical" | "tools" | "soft"
    ) => {
        for (const jdSkill of skills) {
            const { match, confidence } = findLocalMatch(jdSkill, allResumeSkills);

            let status: "matched" | "partial" | "missing";
            if (confidence >= 0.8) {
                status = "matched";
            } else if (confidence >= 0.5) {
                status = "partial";
            } else {
                status = "missing";
            }

            results.push({
                jdSkill,
                resumeSkill: match,
                confidence,
                status,
                category
            });
        }
    };

    processCategory(jdSkills.technical, "technical");
    processCategory(jdSkills.tools, "tools");
    processCategory(jdSkills.soft, "soft");

    const stats = {
        total: results.length,
        matched: results.filter(r => r.status === "matched").length,
        partial: results.filter(r => r.status === "partial").length,
        missing: results.filter(r => r.status === "missing").length
    };

    console.log(`[LocalMatcher] ${stats.matched}/${stats.total} matched (no API call)`);

    return { matches: results, stats };
}

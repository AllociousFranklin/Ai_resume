import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// Types
export interface GitHubAnalysis {
    github_score: number;
    proof: string[];
    risks: string[];
    stats: {
        originalRepos: number;
        forks: number;
        totalStars: number;
        languages: string[];
        activeRepos: number;
        totalCommits: number;
        avgCommitsPerWeek: number;
        accountAge: number; // in months
        contributionStreak: number;
        topLanguage: string | null;
        languageDistribution: Record<string, number>;
    };
    velocity: {
        score: number; // 0-100
        trend: "increasing" | "stable" | "decreasing";
        recentActivity: boolean;
    };
    skillEvolution: {
        newLanguagesLastYear: string[];
        consistentLanguages: string[];
    };
}

/**
 * Comprehensive GitHub Profile Analyzer
 */
export async function analyzeGitHub(username: string): Promise<GitHubAnalysis> {
    if (!username) {
        return getEmptyAnalysis("No GitHub username provided");
    }

    // Clean username from URL if provided
    const cleanUser = username.replace(/^https?:\/\/(www\.)?github\.com\//i, "").split("/")[0];

    try {
        // Fetch user data
        const { data: user } = await octokit.rest.users.getByUsername({ username: cleanUser });

        // Fetch repositories
        const { data: repos } = await octokit.rest.repos.listForUser({
            username: cleanUser,
            sort: "updated",
            per_page: 100,
        });

        // Fetch recent events for activity analysis
        const { data: events } = await octokit.rest.activity.listPublicEventsForUser({
            username: cleanUser,
            per_page: 100,
        });

        // Analyze repositories
        let originalRepos = 0;
        let forks = 0;
        let totalStars = 0;
        let activeRepos = 0;
        const languages = new Map<string, number>();
        const reposByYear = new Map<string, number>();
        const languagesByYear = new Map<string, Set<string>>();
        const sixMonthsAgo = Date.now() - (1000 * 60 * 60 * 24 * 180);
        const oneYearAgo = Date.now() - (1000 * 60 * 60 * 24 * 365);

        repos.forEach(repo => {
            if (repo.fork) {
                forks++;
            } else {
                originalRepos++;
            }

            totalStars += repo.stargazers_count || 0;

            if (repo.language) {
                languages.set(repo.language, (languages.get(repo.language) || 0) + 1);
            }

            const lastUpdate = new Date(repo.updated_at || "").getTime();
            const createdYear = new Date(repo.created_at || "").getFullYear().toString();

            // Track repos by year
            reposByYear.set(createdYear, (reposByYear.get(createdYear) || 0) + 1);

            // Track languages by year for evolution
            if (repo.language) {
                if (!languagesByYear.has(createdYear)) {
                    languagesByYear.set(createdYear, new Set());
                }
                languagesByYear.get(createdYear)!.add(repo.language);
            }

            if (lastUpdate > sixMonthsAgo) {
                activeRepos++;
            }
        });

        // Analyze commit events
        const pushEvents = events.filter(e => e.type === "PushEvent");
        const totalCommits = pushEvents.reduce((sum, event: any) => {
            return sum + (event.payload?.commits?.length || 0);
        }, 0);

        // Calculate account age
        const accountCreated = new Date(user.created_at).getTime();
        const accountAgeMs = Date.now() - accountCreated;
        const accountAgeMonths = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24 * 30));

        // Calculate weekly commit average
        const weeksActive = Math.max(1, Math.floor(accountAgeMs / (1000 * 60 * 60 * 24 * 7)));
        const avgCommitsPerWeek = Math.round((totalCommits / Math.min(weeksActive, 52)) * 10) / 10;

        // Sort languages by usage
        const sortedLanguages = [...languages.entries()].sort((a, b) => b[1] - a[1]);
        const topLanguage = sortedLanguages.length > 0 ? sortedLanguages[0][0] : null;
        const languageDistribution: Record<string, number> = {};
        sortedLanguages.forEach(([lang, count]) => {
            languageDistribution[lang] = count;
        });

        // Skill Evolution Analysis
        const currentYear = new Date().getFullYear().toString();
        const lastYear = (new Date().getFullYear() - 1).toString();
        const olderLanguages = new Set<string>();
        const recentLanguages = new Set<string>();

        languagesByYear.forEach((langs, year) => {
            if (parseInt(year) >= parseInt(lastYear)) {
                langs.forEach(l => recentLanguages.add(l));
            } else {
                langs.forEach(l => olderLanguages.add(l));
            }
        });

        const newLanguagesLastYear = [...recentLanguages].filter(l => !olderLanguages.has(l));
        const consistentLanguages = [...recentLanguages].filter(l => olderLanguages.has(l));

        // Calculate velocity
        const recentPushEvents = pushEvents.filter(e => {
            const eventTime = new Date(e.created_at || "").getTime();
            return eventTime > sixMonthsAgo;
        });
        const recentCommits = recentPushEvents.reduce((sum, event: any) => {
            return sum + (event.payload?.commits?.length || 0);
        }, 0);

        const velocityScore = Math.min(100, Math.round(
            (recentCommits * 2) + (activeRepos * 10) + (newLanguagesLastYear.length * 15)
        ));

        const trend = recentCommits > totalCommits / 2 ? "increasing" :
            recentCommits < totalCommits / 4 ? "decreasing" : "stable";

        // Calculate GitHub Score
        let score = 0;
        score += Math.min(originalRepos * 5, 40); // Original repos (max 40)
        score += Math.min(activeRepos * 8, 30);   // Active repos (max 30)
        score += Math.min(totalStars * 2, 20);    // Stars (max 20)
        score += Math.min(sortedLanguages.length * 3, 15); // Language diversity (max 15)
        score += Math.min(velocityScore * 0.15, 15); // Velocity bonus (max 15)

        // Penalties
        if (forks > originalRepos * 2) score -= 15; // Tutorial hell penalty
        if (activeRepos === 0) score -= 20; // Inactive penalty
        if (accountAgeMonths < 6 && originalRepos < 3) score -= 10; // New account penalty

        score = Math.min(Math.max(Math.round(score), 0), 100);

        // Generate proof points
        const proof: string[] = [];
        if (originalRepos >= 5) proof.push("Consistent Project History");
        if (totalStars >= 10) proof.push("Community Recognition");
        if (activeRepos >= 3) proof.push("Recently Active");
        if (velocityScore >= 50) proof.push("High Coding Velocity");
        if (newLanguagesLastYear.length >= 2) proof.push("Active Learner");
        if (accountAgeMonths >= 24) proof.push("Experienced Developer");
        if (sortedLanguages.length >= 5) proof.push("Polyglot Developer");

        // Generate risks
        const risks: string[] = [];
        if (forks > originalRepos) risks.push("High fork ratio - possible tutorial dependency");
        if (activeRepos === 0) risks.push("No recent activity");
        if (accountAgeMonths < 6) risks.push("New GitHub account");
        if (originalRepos < 3) risks.push("Limited original work");

        return {
            github_score: score,
            proof,
            risks,
            stats: {
                originalRepos,
                forks,
                totalStars,
                languages: sortedLanguages.map(([lang]) => lang),
                activeRepos,
                totalCommits,
                avgCommitsPerWeek,
                accountAge: accountAgeMonths,
                contributionStreak: recentPushEvents.length,
                topLanguage,
                languageDistribution
            },
            velocity: {
                score: velocityScore,
                trend,
                recentActivity: activeRepos > 0 || recentCommits > 0
            },
            skillEvolution: {
                newLanguagesLastYear,
                consistentLanguages
            }
        };

    } catch (error: any) {
        console.error("[GitHub] Analysis Error:", error?.message || error);
        return getEmptyAnalysis(error?.status === 404 ? "Profile Not Found" : "API Error");
    }
}

function getEmptyAnalysis(reason: string): GitHubAnalysis {
    return {
        github_score: 0,
        proof: [],
        risks: [reason],
        stats: {
            originalRepos: 0,
            forks: 0,
            totalStars: 0,
            languages: [],
            activeRepos: 0,
            totalCommits: 0,
            avgCommitsPerWeek: 0,
            accountAge: 0,
            contributionStreak: 0,
            topLanguage: null,
            languageDistribution: {}
        },
        velocity: {
            score: 0,
            trend: "stable",
            recentActivity: false
        },
        skillEvolution: {
            newLanguagesLastYear: [],
            consistentLanguages: []
        }
    };
}

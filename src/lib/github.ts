import { Octokit } from "octokit";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export async function analyzeGitHub(username: string) {
    if (!username) return { github_score: 0, proof: [], risks: [] };

    // Clean username from URL if provided
    const cleanUser = username.split("/").pop() || username;

    try {
        const { data: user } = await octokit.rest.users.getByUsername({ username: cleanUser });
        const { data: repos } = await octokit.rest.repos.listForUser({
            username: cleanUser,
            sort: "updated",
            per_page: 20,
        });

        let originalRepos = 0;
        let forks = 0;
        let totalStars = 0;
        let activeRepos = 0;
        const languages = new Set<string>();

        repos.forEach(repo => {
            if (repo.fork) forks++;
            else originalRepos++;

            totalStars += repo.stargazers_count || 0;
            if (repo.language) languages.add(repo.language);

            // Check activity in last 6 months
            const lastUpdate = new Date(repo.updated_at || "").getTime();
            if (Date.now() - lastUpdate < 1000 * 60 * 60 * 24 * 180) {
                activeRepos++;
            }
        });

        // Scoring Heuristic
        let score = 0;
        score += (originalRepos * 5); // +5 per original repo
        score += (activeRepos * 10);  // +10 per active repo
        score += Math.min(totalStars * 2, 50); // Stars capped at 50 pts
        score += (languages.size * 5); // Breadth of languages

        if (forks > originalRepos * 2) score -= 15; // "Tutorial hell" penalty

        // Normalize to 0-100
        score = Math.min(Math.max(score, 0), 100);

        const proof = [];
        if (originalRepos > 5) proof.push("Consistent Project History");
        if (totalStars > 10) proof.push("Community Recognition");
        if (activeRepos > 3) proof.push("Recently Active");

        return {
            github_score: score,
            proof,
            risks: forks > originalRepos ? ["High fork ratio"] : [],
            stats: { originalRepos, totalStars, languages: Array.from(languages) }
        };

    } catch (error) {
        console.error("GitHub Analysis Error:", error);
        return { github_score: 0, proof: [], risks: ["GitHub Profile Not Found or Private"] };
    }
}

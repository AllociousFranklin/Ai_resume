export function verifySkills(claimedSkills: string[], githubStats: any) {
    const proven: string[] = [];
    const missing: string[] = [];

    const githubLanguages = new Set((githubStats?.stats?.languages || []).map((l: string) => l.toLowerCase()));

    claimedSkills.forEach(skill => {
        const s = skill.toLowerCase();
        // Direct Language Match
        if (githubLanguages.has(s)) {
            proven.push(skill);
            return;
        }

        // Heuristic inference (e.g. "React" proven if "JavaScript" or "TypeScript" is dominant)
        if (s === "react" || s === "next.js" || s === "vue") {
            if (githubLanguages.has("javascript") || githubLanguages.has("typescript")) {
                proven.push(skill);
                return;
            }
        }

        if (s === "django" || s === "flask" || s === "fastapi") {
            if (githubLanguages.has("python")) {
                proven.push(skill);
                return;
            }
        }

        missing.push(skill);
    });

    const proofScore = Math.round((proven.length / (claimedSkills.length || 1)) * 100);

    return {
        proof_score: proofScore,
        proven,
        missing
    };
}

export function analyzeGap(candidateSkills: string[], jdSkills: string[]) {
    const candidateSet = new Set(candidateSkills.map(s => s.toLowerCase()));
    const missing = jdSkills.filter(s => !candidateSet.has(s.toLowerCase()));

    return {
        missing,
        match_percentage: Math.round(((jdSkills.length - missing.length) / (jdSkills.length || 1)) * 100)
    };
}

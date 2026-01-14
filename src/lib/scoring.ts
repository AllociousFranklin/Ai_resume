interface Skills {
    technical: string[];
    tools: string[];
    soft: string[];
}

export function calculateATSScore(candidateSkills: Skills, jdSkills: Skills, experienceMatch: boolean) {
    let score = 0;
    let matches = 0;

    const allJDSkills = [...jdSkills.technical, ...jdSkills.tools];
    if (allJDSkills.length === 0) return 50; // Neutral score if no JD skills found

    const candidateFlat = new Set([...candidateSkills.technical, ...candidateSkills.tools].map(s => s.toLowerCase()));

    allJDSkills.forEach(skill => {
        if (candidateFlat.has(skill.toLowerCase())) {
            matches++;
        }
    });

    const matchRatio = matches / allJDSkills.length;

    // Scoring Weights
    score += (matchRatio * 50); // 50% for skill match
    score += experienceMatch ? 20 : 0; // 20% for experience alignment
    score += 10; // Base baseline for having a parsed resume

    // Keyword density (simplified)
    if (matchRatio > 0.8) score += 20;
    else if (matchRatio > 0.5) score += 10;

    return Math.min(Math.round(score), 100);
}

/**
 * Blind Screening Module
 * 
 * Implements PII redaction and bias mitigation for fair candidate evaluation.
 */

export interface RedactionOptions {
    redactName: boolean;
    redactEmail: boolean;
    redactPhone: boolean;
    redactAddress: boolean;
    redactAge: boolean;
    redactGender: boolean;
    redactPhoto: boolean;
    redactSchoolNames: boolean;
    redactCompanyNames: boolean;
}

export interface RedactedResume {
    text: string;
    redactions: {
        type: string;
        count: number;
    }[];
    originalLength: number;
    redactedLength: number;
}

const DEFAULT_OPTIONS: RedactionOptions = {
    redactName: true,
    redactEmail: true,
    redactPhone: true,
    redactAddress: true,
    redactAge: true,
    redactGender: true,
    redactPhoto: true,
    redactSchoolNames: false, // Optional - may affect skill assessment
    redactCompanyNames: false // Optional - may affect experience evaluation
};

// Patterns for PII detection
const PATTERNS = {
    // Email
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,

    // Phone numbers (various formats)
    phone: /(\+\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/g,

    // Addresses (simplified)
    address: /\d{1,5}\s+[\w\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|drive|dr|lane|ln|way|court|ct|place|pl)\.?\s*,?\s*[\w\s]+,?\s*[A-Z]{2}\s*\d{5}/gi,

    // Age/DOB patterns
    age: /\b(age[:\s]+\d{2}|\d{1,2}[\s/-]\d{1,2}[\s/-]\d{2,4}|born[:\s]+\d{4}|\b\d{2}\s*years?\s*old\b)/gi,

    // Gender pronouns and titles
    gender: /\b(mr\.?|mrs\.?|ms\.?|miss|he|she|his|her|him)\b/gi,

    // Common name patterns (first line, "Name:", etc.)
    namePatterns: /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/gm,

    // LinkedIn URLs (contain names)
    linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/gi,

    // Photo references
    photo: /\b(photo|headshot|picture|image)\b/gi,
};

// Top universities (for optional redaction)
const TOP_UNIVERSITIES = [
    "harvard", "stanford", "mit", "yale", "princeton", "columbia",
    "berkeley", "caltech", "oxford", "cambridge", "iit", "nit"
];

// Major companies (for optional redaction)
const MAJOR_COMPANIES = [
    "google", "amazon", "facebook", "meta", "apple", "microsoft",
    "netflix", "uber", "airbnb", "stripe", "twitter", "salesforce"
];

/**
 * Redact PII from resume text
 */
export function redactResume(
    text: string,
    options: Partial<RedactionOptions> = {}
): RedactedResume {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let redactedText = text;
    const redactions: { type: string; count: number }[] = [];

    // Email redaction
    if (opts.redactEmail) {
        const matches = redactedText.match(PATTERNS.email) || [];
        redactedText = redactedText.replace(PATTERNS.email, "[EMAIL]");
        if (matches.length) redactions.push({ type: "email", count: matches.length });
    }

    // Phone redaction
    if (opts.redactPhone) {
        const matches = redactedText.match(PATTERNS.phone) || [];
        redactedText = redactedText.replace(PATTERNS.phone, "[PHONE]");
        if (matches.length) redactions.push({ type: "phone", count: matches.length });
    }

    // Address redaction
    if (opts.redactAddress) {
        const matches = redactedText.match(PATTERNS.address) || [];
        redactedText = redactedText.replace(PATTERNS.address, "[ADDRESS]");
        if (matches.length) redactions.push({ type: "address", count: matches.length });
    }

    // Age/DOB redaction
    if (opts.redactAge) {
        const matches = redactedText.match(PATTERNS.age) || [];
        redactedText = redactedText.replace(PATTERNS.age, "[AGE]");
        if (matches.length) redactions.push({ type: "age", count: matches.length });
    }

    // Gender redaction
    if (opts.redactGender) {
        const matches = redactedText.match(PATTERNS.gender) || [];
        redactedText = redactedText.replace(PATTERNS.gender, "[REDACTED]");
        if (matches.length) redactions.push({ type: "gender", count: matches.length });
    }

    // LinkedIn URL redaction (contains name)
    const linkedinMatches = redactedText.match(PATTERNS.linkedin) || [];
    redactedText = redactedText.replace(PATTERNS.linkedin, "[LINKEDIN]");
    if (linkedinMatches.length) redactions.push({ type: "linkedin", count: linkedinMatches.length });

    // School name redaction (optional)
    if (opts.redactSchoolNames) {
        let schoolCount = 0;
        TOP_UNIVERSITIES.forEach(school => {
            const regex = new RegExp(`\\b${school}\\b`, "gi");
            const matches = redactedText.match(regex) || [];
            schoolCount += matches.length;
            redactedText = redactedText.replace(regex, "[UNIVERSITY]");
        });
        if (schoolCount) redactions.push({ type: "university", count: schoolCount });
    }

    // Company name redaction (optional)
    if (opts.redactCompanyNames) {
        let companyCount = 0;
        MAJOR_COMPANIES.forEach(company => {
            const regex = new RegExp(`\\b${company}\\b`, "gi");
            const matches = redactedText.match(regex) || [];
            companyCount += matches.length;
            redactedText = redactedText.replace(regex, "[COMPANY]");
        });
        if (companyCount) redactions.push({ type: "company", count: companyCount });
    }

    // Name redaction (first line heuristic)
    if (opts.redactName) {
        const lines = redactedText.split("\n");
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // If first line looks like a name (2-4 capitalized words, no special chars)
            if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,3}$/.test(firstLine)) {
                lines[0] = "[CANDIDATE NAME]";
                redactedText = lines.join("\n");
                redactions.push({ type: "name", count: 1 });
            }
        }
    }

    return {
        text: redactedText,
        redactions,
        originalLength: text.length,
        redactedLength: redactedText.length
    };
}

/**
 * Calculate bias risk score based on what was redacted
 */
export function calculateBiasRisk(redactions: { type: string; count: number }[]): {
    score: number; // 0-100 (higher = more potential bias sources were found)
    level: "low" | "medium" | "high";
    details: string;
} {
    const highRiskTypes = ["name", "gender", "age", "photo"];
    const mediumRiskTypes = ["email", "address", "linkedin"];

    let riskScore = 0;

    redactions.forEach(r => {
        if (highRiskTypes.includes(r.type)) {
            riskScore += 25 * r.count;
        } else if (mediumRiskTypes.includes(r.type)) {
            riskScore += 10 * r.count;
        } else {
            riskScore += 5 * r.count;
        }
    });

    riskScore = Math.min(100, riskScore);

    const level = riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";

    const details = level === "high"
        ? "Resume contained significant PII that could introduce bias"
        : level === "medium"
            ? "Resume contained some identifying information"
            : "Resume had minimal identifying information";

    return { score: riskScore, level, details };
}

/**
 * Generate fairness metrics
 */
export function generateFairnessReport(
    analyses: Array<{ score: number; cluster: string }>
): {
    totalAnalyzed: number;
    scoreDistribution: Record<string, number>;
    clusterDistribution: Record<string, number>;
    potentialBiasIndicators: string[];
} {
    const scoreDistribution: Record<string, number> = {
        "excellent": 0,
        "good": 0,
        "fair": 0,
        "poor": 0
    };

    const clusterDistribution: Record<string, number> = {};

    analyses.forEach(a => {
        // Score distribution
        if (a.score >= 80) scoreDistribution.excellent++;
        else if (a.score >= 60) scoreDistribution.good++;
        else if (a.score >= 40) scoreDistribution.fair++;
        else scoreDistribution.poor++;

        // Cluster distribution
        clusterDistribution[a.cluster] = (clusterDistribution[a.cluster] || 0) + 1;
    });

    // Check for potential bias indicators
    const potentialBiasIndicators: string[] = [];

    // Check if any cluster is underrepresented in high scores
    const totalExcellent = scoreDistribution.excellent;
    if (totalExcellent > 0) {
        Object.entries(clusterDistribution).forEach(([cluster, count]) => {
            const proportion = count / analyses.length;
            if (proportion > 0.3 && count > 5) {
                // This cluster is large enough to analyze
                const clusterExcellent = analyses.filter(
                    a => a.cluster === cluster && a.score >= 80
                ).length;
                const clusterExcellentRate = clusterExcellent / count;
                const overallExcellentRate = totalExcellent / analyses.length;

                if (clusterExcellentRate < overallExcellentRate * 0.5) {
                    potentialBiasIndicators.push(
                        `${cluster.replace(/_/g, " ")} candidates may be underrepresented in top scores`
                    );
                }
            }
        });
    }

    return {
        totalAnalyzed: analyses.length,
        scoreDistribution,
        clusterDistribution,
        potentialBiasIndicators
    };
}

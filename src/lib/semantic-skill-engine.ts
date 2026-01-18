/**
 * Unified Semantic Skill Engine (API-Efficient Version)
 * 
 * Strategy:
 * 1. Single mode: Use Gemini for deep semantic matching (1 call)
 * 2. Batch mode: Use local semantic map (0 calls)
 * 
 * Design Rule:
 * - AI interprets meaning (when available)
 * - Local map handles common synonyms
 * - Code decides logic (thresholds, classification)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { matchSkillsLocally } from "./local-semantic-map";
import { geminiRateLimiter } from "./rate-limiter";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Confidence thresholds
export const THRESHOLDS = {
    MATCHED: 0.8,
    PARTIAL: 0.5,
    MISSING: 0.0
};

export type MatchStatus = "matched" | "partial" | "missing";

export interface SkillMatchResult {
    jdSkill: string;
    resumeSkill: string | null;
    confidence: number;
    status: MatchStatus;
    category: "technical" | "tools" | "soft";
}

export interface SemanticEngineResult {
    matches: SkillMatchResult[];
    stats: {
        total: number;
        matched: number;
        partial: number;
        missing: number;
    };
    byCategory: {
        technical: SkillMatchResult[];
        tools: SkillMatchResult[];
        soft: SkillMatchResult[];
    };
    matchingType: "gemini" | "local" | "fallback";
}

/**
 * Main semantic matching function
 * Uses local matching first, Gemini only for single resume mode (useGemini=true)
 */
export async function matchSkillsSemantically(
    jdSkills: { technical: string[]; tools: string[]; soft: string[] },
    resumeSkills: { technical: string[]; tools: string[]; soft: string[] },
    useGemini: boolean = true // Set to false for batch mode
): Promise<SemanticEngineResult> {

    // For efficiency, try local matching first
    const localResult = matchSkillsLocally(jdSkills, resumeSkills);

    // Convert local result to SemanticEngineResult format
    const localAsResult: SemanticEngineResult = {
        matches: localResult.matches,
        stats: localResult.stats,
        byCategory: {
            technical: localResult.matches.filter(m => m.category === 'technical'),
            tools: localResult.matches.filter(m => m.category === 'tools'),
            soft: localResult.matches.filter(m => m.category === 'soft')
        },
        matchingType: "local"
    };

    // If local matching gives good results (>50% matched), use it
    if (localResult.stats.matched >= localResult.stats.total * 0.5 || !useGemini) {
        console.log(`[SemanticEngine] Using local matching: ${localResult.stats.matched}/${localResult.stats.total}`);
        return localAsResult;
    }

    // Otherwise, try Gemini for deeper matching (single resume mode only)
    try {
        console.log(`[SemanticEngine] Local match low (${localResult.stats.matched}/${localResult.stats.total}), trying Gemini...`);

        // Rate limit
        await geminiRateLimiter.waitIfNeeded();

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const allJdSkills = [
            ...jdSkills.technical.map(s => ({ skill: s, category: "technical" as const })),
            ...jdSkills.tools.map(s => ({ skill: s, category: "tools" as const })),
            ...jdSkills.soft.map(s => ({ skill: s, category: "soft" as const }))
        ];

        const allResumeSkills = [
            ...resumeSkills.technical,
            ...resumeSkills.tools,
            ...resumeSkills.soft
        ];

        if (allJdSkills.length === 0) {
            return { ...localAsResult, matchingType: "local" };
        }

        const prompt = `You are a strict skill-matching engine. Match JD skills to resume skills.

JD skills: ${JSON.stringify(allJdSkills.map(s => s.skill))}
Resume skills: ${JSON.stringify(allResumeSkills)}

Semantic examples: JS=JavaScript, TS=TypeScript, Node=Node.js, K8s=Kubernetes, CLI=Bash

Return ONLY JSON array:
[{"jdSkill":"X","resumeSkill":"Y","confidence":0.95}]

confidence: 0.9-1.0=exact, 0.8-0.89=synonym, 0.5-0.79=related, 0=none`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.log("[SemanticEngine] Gemini parse failed, using local");
            return localAsResult;
        }

        const rawMatches = JSON.parse(jsonMatch[0]);

        const matches: SkillMatchResult[] = rawMatches.map((m: any) => {
            const jdSkillInfo = allJdSkills.find(
                s => s.skill.toLowerCase() === m.jdSkill?.toLowerCase()
            );

            let status: MatchStatus;
            if (m.resumeSkill && m.confidence >= THRESHOLDS.MATCHED) {
                status = "matched";
            } else if (m.resumeSkill && m.confidence >= THRESHOLDS.PARTIAL) {
                status = "partial";
            } else {
                status = "missing";
            }

            return {
                jdSkill: m.jdSkill,
                resumeSkill: status === "missing" ? null : m.resumeSkill,
                confidence: m.confidence || 0,
                status,
                category: jdSkillInfo?.category || "technical"
            };
        });

        const stats = {
            total: matches.length,
            matched: matches.filter(m => m.status === "matched").length,
            partial: matches.filter(m => m.status === "partial").length,
            missing: matches.filter(m => m.status === "missing").length
        };

        console.log(`[SemanticEngine] Gemini results: ${stats.matched}/${stats.total} matched`);

        return {
            matches,
            stats,
            byCategory: {
                technical: matches.filter(m => m.category === "technical"),
                tools: matches.filter(m => m.category === "tools"),
                soft: matches.filter(m => m.category === "soft")
            },
            matchingType: "gemini"
        };

    } catch (error: any) {
        // Rate limit or other error - fall back to local
        if (error.message?.includes('429') || error.message?.includes('quota')) {
            console.log("[SemanticEngine] Rate limited, using local matching");
        } else {
            console.error("[SemanticEngine] Gemini error:", error.message);
        }
        return localAsResult;
    }
}

// ============================================================
// CONSUMER HELPER FUNCTIONS
// ============================================================

export function getMatchPercentages(result: SemanticEngineResult): {
    skillMatch: number;
    toolMatch: number;
    softMatch: number;
    overallMatch: number;
} {
    const calcPercent = (matches: SkillMatchResult[]): number => {
        if (matches.length === 0) return 100;
        const valid = matches.filter(m => m.status === "matched").length;
        return Math.round((valid / matches.length) * 100);
    };

    return {
        skillMatch: calcPercent(result.byCategory.technical),
        toolMatch: calcPercent(result.byCategory.tools),
        softMatch: calcPercent(result.byCategory.soft),
        overallMatch: result.stats.total > 0
            ? Math.round((result.stats.matched / result.stats.total) * 100)
            : 100
    };
}

export function getMatchedSkills(result: SemanticEngineResult): string[] {
    return result.matches
        .filter(m => m.status === "matched" && m.resumeSkill)
        .map(m => `${m.jdSkill} ≈ ${m.resumeSkill}`);
}

export function getMissingSkills(result: SemanticEngineResult): string[] {
    return result.matches
        .filter(m => m.status === "missing")
        .map(m => m.jdSkill);
}

export function getPartialMatches(result: SemanticEngineResult): string[] {
    return result.matches
        .filter(m => m.status === "partial" && m.resumeSkill)
        .map(m => `${m.jdSkill} ~ ${m.resumeSkill}`);
}

export function getCriticalGaps(result: SemanticEngineResult): string[] {
    return result.byCategory.technical
        .filter(m => m.status === "missing")
        .map(m => m.jdSkill);
}

export function getNiceToHaveGaps(result: SemanticEngineResult): string[] {
    return result.byCategory.soft
        .filter(m => m.status === "missing")
        .map(m => m.jdSkill);
}

export const CONFIDENCE_THRESHOLD = THRESHOLDS.MATCHED;

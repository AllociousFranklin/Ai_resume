import pdf from "pdf-parse";
import mammoth from "mammoth";

// Types
export interface ParsedResume {
    text: string;
    links: {
        github: string | null;
        linkedin: string | null;
        portfolio: string | null;
    };
    metadata: {
        format: "pdf" | "docx" | "unknown";
        pageCount?: number;
        wordCount: number;
    };
}

/**
 * Main resume parser - handles PDF and DOCX
 */
export async function parseResume(buffer: Buffer, filename?: string): Promise<ParsedResume> {
    const extension = filename?.toLowerCase().split(".").pop() || "";

    try {
        if (extension === "docx" || extension === "doc") {
            return await parseDocx(buffer);
        } else {
            // Default to PDF
            return await parsePdf(buffer);
        }
    } catch (error) {
        console.error("[Ingestion] Parse Error:", error);
        throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}

/**
 * PDF Parser
 */
async function parsePdf(buffer: Buffer): Promise<ParsedResume> {
    const data = await pdf(buffer);
    const text = sanitizeText(data.text);
    const links = extractLinks(data.text);

    return {
        text,
        links,
        metadata: {
            format: "pdf",
            pageCount: data.numpages,
            wordCount: text.split(/\s+/).length
        }
    };
}

/**
 * DOCX Parser using mammoth
 */
async function parseDocx(buffer: Buffer): Promise<ParsedResume> {
    const result = await mammoth.extractRawText({ buffer });
    const text = sanitizeText(result.value);
    const links = extractLinks(result.value);

    return {
        text,
        links,
        metadata: {
            format: "docx",
            wordCount: text.split(/\s+/).length
        }
    };
}

/**
 * Extract links from resume text
 */
function extractLinks(text: string) {
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
    const portfolioRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|com|me|tech|design|portfolio))/i;

    const githubMatch = text.match(githubRegex);
    const linkedinMatch = text.match(linkedinRegex);
    const portfolioMatch = text.match(portfolioRegex);

    return {
        github: githubMatch ? githubMatch[1] : null, // Return username only
        linkedin: linkedinMatch ? linkedinMatch[0] : null,
        portfolio: portfolioMatch ? portfolioMatch[0] : null
    };
}

/**
 * Sanitize text - remove PII and normalize
 */
function sanitizeText(text: string): string {
    let clean = text;

    // Remove email patterns
    clean = clean.replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, "[EMAIL]");

    // Remove phone patterns (various formats)
    clean = clean.replace(/(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g, "[PHONE]");

    // Normalize whitespace
    clean = clean.replace(/\s+/g, " ").trim();

    return clean;
}

/**
 * Extract candidate name (first line heuristic)
 */
export function extractCandidateName(text: string): string | null {
    const lines = text.split(/[\n\r]+/).filter(line => line.trim().length > 0);
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // Check if it looks like a name (2-4 words, no special chars except spaces)
        if (/^[A-Za-z\s]{2,50}$/.test(firstLine) && firstLine.split(/\s+/).length <= 4) {
            return firstLine;
        }
    }
    return null;
}

/**
 * Extract email for contact (before sanitization)
 */
export function extractEmail(rawText: string): string | null {
    const emailMatch = rawText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
    return emailMatch ? emailMatch[0] : null;
}

/**
 * Extract phone for contact (before sanitization)
 */
export function extractPhone(rawText: string): string | null {
    const phoneMatch = rawText.match(/(\+\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
    return phoneMatch ? phoneMatch[0] : null;
}

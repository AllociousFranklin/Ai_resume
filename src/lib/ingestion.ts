import pdf from "pdf-parse";
import mammoth from "mammoth";

// Types
export interface ParsedResume {
    text: string;
    links: {
        github: string | null;
        linkedin: string | null;
        portfolio: string | null;
        allLinks: string[]; // All extracted hyperlinks
    };
    metadata: {
        format: "pdf" | "docx" | "unknown";
        pageCount?: number;
        wordCount: number;
        hyperlinkCount: number;
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
 * Extract URLs from raw PDF binary data
 * This catches hyperlinks that aren't visible in the text but are clickable
 * PDFs store URIs in annotation dictionaries, often with /URI key
 */
function extractUrlsFromRawPdf(buffer: Buffer): string[] {
    const urls: string[] = [];

    try {
        // Convert buffer to string to search for URI patterns
        // PDFs encode URIs in various ways, we'll catch the common ones
        const pdfContent = buffer.toString('latin1');

        // Pattern 1: /URI (http://...)
        const uriParenPattern = /\/URI\s*\(([^)]+)\)/g;
        let match;
        while ((match = uriParenPattern.exec(pdfContent)) !== null) {
            const url = cleanPdfUrl(match[1]);
            if (url && isValidUrl(url)) {
                urls.push(url);
            }
        }

        // Pattern 2: /URI <http://...>
        const uriBracketPattern = /\/URI\s*<([^>]+)>/g;
        while ((match = uriBracketPattern.exec(pdfContent)) !== null) {
            const url = cleanPdfUrl(match[1]);
            if (url && isValidUrl(url)) {
                urls.push(url);
            }
        }

        // Pattern 3: Direct http URLs in PDF content
        const directUrlPattern = /https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+[-a-zA-Z0-9()@:%_\+.~#?&\/=]*/g;
        while ((match = directUrlPattern.exec(pdfContent)) !== null) {
            const url = cleanPdfUrl(match[0]);
            if (url && isValidUrl(url) && !urls.includes(url)) {
                urls.push(url);
            }
        }
    } catch (error) {
        console.log("[Ingestion] Raw PDF URL extraction error:", error);
    }

    // Remove duplicates
    return [...new Set(urls)];
}

/**
 * Clean PDF-encoded URL artifacts
 */
function cleanPdfUrl(url: string): string {
    return url
        .replace(/\\054/g, ',')   // PDF encoding for comma
        .replace(/\\057/g, '/')   // PDF encoding for slash
        .replace(/\\056/g, '.')   // PDF encoding for dot
        .replace(/\\/g, '')       // Remove remaining backslashes
        .replace(/[\x00-\x1F]/g, '') // Remove control characters
        .trim();
}

/**
 * Validate URL
 */
function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * PDF Parser - Enhanced with hyperlink extraction
 */
async function parsePdf(buffer: Buffer): Promise<ParsedResume> {
    // 1. Extract text content
    const data = await pdf(buffer);
    const rawText = data.text;
    const text = sanitizeText(rawText);

    // 2. Extract links from visible text
    const textLinks = extractLinks(rawText);

    // 3. Extract embedded hyperlinks from raw PDF data
    const embeddedLinks = extractUrlsFromRawPdf(buffer);

    console.log(`[Ingestion] Found ${embeddedLinks.length} embedded hyperlinks in PDF`);
    if (embeddedLinks.length > 0) {
        console.log(`[Ingestion] Hyperlinks found:`, embeddedLinks.slice(0, 5)); // Log first 5
    }

    // 4. Extract GitHub/LinkedIn from hyperlinks if not found in text
    let github = textLinks.github;
    let linkedin = textLinks.linkedin;
    let portfolio = textLinks.portfolio;

    for (const link of embeddedLinks) {
        // Extract GitHub username from hyperlink
        if (!github && link.includes('github.com/')) {
            const match = link.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
            if (match) {
                const username = match[1].toLowerCase();
                // Filter out common GitHub pages that aren't user profiles
                const nonUserPages = ['features', 'pricing', 'enterprise', 'login', 'signup', 'about', 'explore', 'topics', 'trending', 'collections', 'events', 'sponsors', 'customer-stories', 'security', 'team', 'readme'];
                if (!nonUserPages.includes(username)) {
                    github = match[1];
                    console.log(`[Ingestion] ✓ Found GitHub from embedded hyperlink: ${github}`);
                }
            }
        }

        // Extract LinkedIn from hyperlink
        if (!linkedin && link.includes('linkedin.com/in/')) {
            linkedin = link;
            console.log(`[Ingestion] ✓ Found LinkedIn from embedded hyperlink`);
        }

        // Extract portfolio
        if (!portfolio) {
            const portfolioMatch = link.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.(?:dev|io|me|tech|design|portfolio|vercel\.app|netlify\.app|github\.io))/i);
            if (portfolioMatch && !link.includes('github.com') && !link.includes('linkedin.com')) {
                portfolio = link;
            }
        }
    }

    return {
        text,
        links: {
            github,
            linkedin,
            portfolio,
            allLinks: embeddedLinks
        },
        metadata: {
            format: "pdf",
            pageCount: data.numpages,
            wordCount: text.split(/\s+/).length,
            hyperlinkCount: embeddedLinks.length
        }
    };
}

/**
 * DOCX Parser using mammoth - with hyperlink extraction
 */
async function parseDocx(buffer: Buffer): Promise<ParsedResume> {
    // Extract raw text
    const textResult = await mammoth.extractRawText({ buffer });
    const text = sanitizeText(textResult.value);

    // Extract HTML to get hyperlinks
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const htmlContent = htmlResult.value;

    // Extract links from both text and HTML
    const textLinks = extractLinks(textResult.value);
    const htmlLinks = extractLinksFromHtml(htmlContent);

    // Combine links - prefer hyperlink-extracted ones
    const github = htmlLinks.github || textLinks.github;
    const linkedin = htmlLinks.linkedin || textLinks.linkedin;
    const portfolio = htmlLinks.portfolio || textLinks.portfolio;
    const allLinks = htmlLinks.allLinks;

    return {
        text,
        links: {
            github,
            linkedin,
            portfolio,
            allLinks
        },
        metadata: {
            format: "docx",
            wordCount: text.split(/\s+/).length,
            hyperlinkCount: allLinks.length
        }
    };
}

/**
 * Extract links from HTML content (for DOCX)
 */
function extractLinksFromHtml(html: string): {
    github: string | null;
    linkedin: string | null;
    portfolio: string | null;
    allLinks: string[];
} {
    const allLinks: string[] = [];
    let github: string | null = null;
    let linkedin: string | null = null;
    let portfolio: string | null = null;

    // Match href attributes
    const hrefPattern = /href=["']([^"']+)["']/gi;
    let match;

    while ((match = hrefPattern.exec(html)) !== null) {
        const url = match[1];
        if (url && url.startsWith('http')) {
            allLinks.push(url);

            // Extract GitHub
            if (!github && url.includes('github.com/')) {
                const githubMatch = url.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
                if (githubMatch) {
                    const username = githubMatch[1].toLowerCase();
                    const nonUserPages = ['features', 'pricing', 'enterprise', 'login', 'signup', 'about'];
                    if (!nonUserPages.includes(username)) {
                        github = githubMatch[1];
                    }
                }
            }

            // Extract LinkedIn
            if (!linkedin && url.includes('linkedin.com/in/')) {
                linkedin = url;
            }

            // Extract portfolio
            if (!portfolio && url.match(/\.(dev|io|me|tech|design|portfolio)/i)) {
                if (!url.includes('github.com') && !url.includes('linkedin.com')) {
                    portfolio = url;
                }
            }
        }
    }

    return { github, linkedin, portfolio, allLinks };
}

/**
 * Extract links from resume text (fallback/additional)
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

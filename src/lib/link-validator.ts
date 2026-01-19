
export interface LinkValidationResult {
    isValid: boolean; // True if the link is reachable (even if auth wall)
    isPortfolio: boolean; // True if it looks like a personal site
    status: number;
    title?: string;
    description?: string;
    error?: string;
    qualityScore: number; // NEW: 0-100 quality score
}

// Keywords that indicate professional portfolio content
const PORTFOLIO_KEYWORDS = [
    'portfolio', 'projects', 'work', 'design', 'developer', 'engineer',
    'about', 'skills', 'experience', 'resume', 'cv', 'hire', 'freelance',
    'ux', 'ui', 'frontend', 'backend', 'fullstack', 'creative', 'studio'
];

const CONTACT_KEYWORDS = ['contact', 'email', 'mailto:', 'linkedin', 'twitter', 'github'];

/**
 * Calculate portfolio quality score based on page content
 */
function calculatePortfolioQuality(title: string, description: string, html: string): number {
    let score = 0;
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();
    const lowerHtml = html.toLowerCase().slice(0, 10000); // Check first 10KB

    // Professional branding (+15): Has a name or title
    if (lowerTitle.length > 3 && !lowerTitle.includes('untitled')) {
        score += 15;
    }

    // Role-relevant keywords (+20): Portfolio/Design/Engineer type words
    const hasRelevantKeywords = PORTFOLIO_KEYWORDS.some(kw =>
        lowerTitle.includes(kw) || lowerDesc.includes(kw)
    );
    if (hasRelevantKeywords) {
        score += 20;
    }

    // Has project links (+15): Contains project/work links
    if (lowerHtml.includes('project') || lowerHtml.includes('work') || lowerHtml.includes('case study')) {
        score += 15;
    }

    // Has contact info (+10)
    const hasContact = CONTACT_KEYWORDS.some(kw => lowerHtml.includes(kw));
    if (hasContact) {
        score += 10;
    }

    // Has description (+10)
    if (description.length > 20) {
        score += 10;
    }

    // Uses proper meta tags (+10)
    if (lowerHtml.includes('og:image') || lowerHtml.includes('og:title')) {
        score += 10;
    }

    // Has navigation structure (+10)
    if (lowerHtml.includes('<nav') || lowerHtml.includes('navigation')) {
        score += 10;
    }

    return Math.min(score, 100);
}

/**
 * Validates a URL by attempting to fetch it.
 * Designed to be lightweight and respect timeouts.
 */
export async function validateLink(url: string): Promise<LinkValidationResult> {
    // Ensure protocol
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout (LinkedIn can be slow)

    try {
        const res = await fetch(url, {
            method: "GET",
            signal: controller.signal,
            headers: {
                // Look like a real browser to avoid instant 403s
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
            }
        });

        clearTimeout(timeoutId);

        // Special handling for LinkedIn (often returns 999 or 403/401 for scrapers)
        // 404 is the only "Definite Failure" for LinkedIn
        const isLinkedIn = url.includes("linkedin.com");
        if (isLinkedIn) {
            if (res.status === 404) {
                return { isValid: false, isPortfolio: false, status: 404, error: "Profile Not Found", qualityScore: 0 };
            }
            // treat 200, 401, 403, 999 as valid - LinkedIn verification = 50 points baseline
            return { isValid: true, isPortfolio: false, status: res.status, title: "LinkedIn Profile", qualityScore: 50 };
        }

        if (!res.ok) {
            return { isValid: false, isPortfolio: false, status: res.status, error: `HTTP ${res.status}`, qualityScore: 0 };
        }

        // For generic sites (portfolios), extract title and calculate quality
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

        const title = titleMatch ? titleMatch[1].trim() : "";
        const description = descMatch ? descMatch[1].trim() : "";
        const isPersonalSite = !url.includes("github.com") && !url.includes("linkedin.com");

        const qualityScore = isPersonalSite
            ? calculatePortfolioQuality(title, description, html)
            : 30; // GitHub links get baseline 30

        return {
            isValid: true,
            isPortfolio: isPersonalSite,
            status: res.status,
            title: title,
            description: description,
            qualityScore: qualityScore
        };
    } catch (error: any) {
        // If we get here, it's likely a network error (DNS, Timeout)
        return { isValid: false, isPortfolio: false, status: 0, error: error.message, qualityScore: 0 };
    }
}

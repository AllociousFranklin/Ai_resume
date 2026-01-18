
export interface LinkValidationResult {
    isValid: boolean; // True if the link is reachable (even if auth wall)
    isPortfolio: boolean; // True if it looks like a personal site
    status: number;
    title?: string;
    description?: string;
    error?: string;
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
                return { isValid: false, isPortfolio: false, status: 404, error: "Profile Not Found" };
            }
            // treat 200, 401, 403, 999 as valid
            return { isValid: true, isPortfolio: false, status: res.status, title: "LinkedIn Profile" };
        }

        if (!res.ok) {
            return { isValid: false, isPortfolio: false, status: res.status, error: `HTTP ${res.status}` };
        }

        // For generic sites (portfolios), extract title
        const html = await res.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);

        // Heuristic: Is it a portfolio?
        // Checks keywords in title or checks specific domains
        const title = titleMatch ? titleMatch[1].trim() : "";
        const description = descMatch ? descMatch[1].trim() : "";

        const isPersonalSite = !url.includes("github.com") && !url.includes("linkedin.com");

        return {
            isValid: true,
            isPortfolio: isPersonalSite,
            status: res.status,
            title: title,
            description: description
        };
    } catch (error: any) {
        // If we get here, it's likely a network error (DNS, Timeout)
        return { isValid: false, isPortfolio: false, status: 0, error: error.message };
    }
}

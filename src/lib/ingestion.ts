import pdf from "pdf-parse";

export async function parseResume(buffer: Buffer) {
    try {
        const data = await pdf(buffer);
        const text = sanitizeText(data.text);
        const links = extractLinks(data.text);
        return { text, links };
    } catch (error) {
        console.error("PDF Parse Error:", error);
        throw new Error("Failed to parse PDF");
    }
}

function extractLinks(text: string) {
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/i;
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/i;

    const githubMatch = text.match(githubRegex);
    const linkedinMatch = text.match(linkedinRegex);

    return {
        github: githubMatch ? githubMatch[0] : null,
        linkedin: linkedinMatch ? linkedinMatch[0] : null
    };
}

function sanitizeText(text: string) {
    // Simple PII removal (Regex demo - in production this would be stricter)
    let clean = text;

    // Remove email patterns
    clean = clean.replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/g, "[EMAIL]");

    // Remove phone patterns (simple)
    clean = clean.replace(/(\+\d{1,3}[- ]?)?\d{10}/g, "[PHONE]");

    // Normalize whitespace
    clean = clean.replace(/\s+/g, " ").trim();

    return clean;
}

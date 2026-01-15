import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
console.log("[Gemini] Service Init. Key present:", !!apiKey);
const genAI = new GoogleGenerativeAI(apiKey!);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContentWithRetry(prompt: string, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        // Extract wait time if available, else use default backoff
        // API often sends `retryDelay` in body but difficult to parse here without robust logic
        const waitTime = (i + 1) * 10000;
        console.warn(`[Gemini] Rate limited (Attempt ${i + 1}/${retries}). Waiting ${waitTime / 1000}s...`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded for Gemini API");
}

// Combined extraction to save API calls
export async function extractCombinedData(resumeText: string, jdText: string) {
  const prompt = `
    Analyze the following CANDIDATE RESUME and JOB DESCRIPTION.
    Extract skills, tools, and soft skills for BOTH.
    
    Return ONLY a valid JSON object with this EXACT structure:
    {
      "resume": {
        "technical": ["string"],
        "tools": ["string"],
        "soft": ["string"],
        "experience_years": 0,
        "education_level": "string"
      },
      "jd": {
        "technical": ["string"],
        "tools": ["string"],
        "soft": ["string"]
      }
    }
    
    === RESUME TEXT ===
    ${resumeText.substring(0, 20000)}
    
    === JOB DESCRIPTION ===
    ${jdText.substring(0, 10000)}
  `;

  try {
    console.log(`[Gemini] Generating Combined Data... (R: ${resumeText.length} chars, JD: ${jdText.length} chars)`);
    const result = await generateContentWithRetry(prompt);
    const response = await result.response;
    const textResponse = response.text();
    console.log(`[Gemini] Response Received`);

    const jsonStr = textResponse.replace(/^```json\n|\n```$/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error(`[Gemini] Extraction Error:`, JSON.stringify(error, null, 2));
    // Return empty fallback
    return {
      resume: { technical: [], tools: [], soft: [], experience_years: 0 },
      jd: { technical: [], tools: [], soft: [] }
    };
  }
}

// Deprecated single extraction kept for signature compatibility if needed, but unused
export async function extractSkills(text: string, type: "resume" | "jd") {
  return { technical: [], tools: [], soft: [] };
}

export async function explainRanking(candidateStats: any, jdSkills: any) {
  const prompt = `
    Explain why this candidate scored the way they did for this job.
    Candidate Stats: ${JSON.stringify(candidateStats)}
    Job Requirements: ${JSON.stringify(jdSkills)}
    
    Provide a concise, professional, 2-sentence explanation highlighting strengths and missing proofs.
    Do not mention "Gemini" or "AI".
  `;

  try {
    const result = await generateContentWithRetry(prompt);
    return result.response.text();
  } catch (error) {
    console.error(`[Gemini] Explain Error:`, error);
    return "Analysis unavailable at this moment (Rate Limit or API Error).";
  }
}

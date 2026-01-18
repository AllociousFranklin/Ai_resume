import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
console.log("[Gemini] Service Init. Key present:", !!apiKey);
const genAI = new GoogleGenerativeAI(apiKey!);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Types
export interface ExtractedSkills {
  technical: string[];
  tools: string[];
  soft: string[];
  experience_years: number;
  education_level: string;
}

export interface ResumeQuality {
  score: number; // 0-100
  formatting: number;
  achievements: number;
  clarity: number;
  improvements: string[];
}

export interface CandidateCluster {
  type: "specialist" | "generalist" | "career_switcher" | "early_career" | "senior_leader";
  confidence: number;
  traits: string[];
}

export interface CombinedExtraction {
  resume: ExtractedSkills;
  jd: {
    technical: string[];
    tools: string[];
    soft: string[];
    required_experience: number;
  };
  quality: ResumeQuality;
  cluster: CandidateCluster;
  explanation: string;
  job_category: "technical" | "general" | "creative";
  matches: Array<{
    jdSkill: string;
    resumeSkill: string | null;
    confidence: number;
    category: "technical" | "tools" | "soft";
  }>;
}

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateContentWithRetry(prompt: string, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      if (error?.status === 429 || error?.message?.includes("429")) {
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

/**
 * Combined extraction - skills, quality, clustering AND explanation in one call
 */
export async function extractCombinedData(resumeText: string, jdText: string): Promise<CombinedExtraction> {
  const prompt = `
Analyze the following CANDIDATE RESUME and JOB DESCRIPTION.
Perform a comprehensive analysis including:
1. Extract skills (technical, tools, soft skills) from BOTH documents
2. Assess resume quality (formatting, achievements, clarity)
3. Classify candidate into a cluster type
4. Write a 2-3 sentence AI assessment explaining how well this candidate fits the role
5. Semantic Match: Map EVERY skill in the "jd" section to a matching skill in "resume" (or null if missing).
6. Job Classification: Classify the job into "technical", "creative", or "general".

Return ONLY a valid JSON object with this EXACT structure:
{
    "resume": {
        "technical": ["skill1", "skill2"],
        "tools": ["tool1", "tool2"],
        "soft": ["skill1", "skill2"],
        "experience_years": 0,
        "education_level": "bachelors"
    },
    "jd": {
        "technical": ["skill1", "skill2"],
        "tools": ["tool1", "tool2"],
        "soft": ["skill1", "skill2"],
        "required_experience": 0
    },
    "quality": {
        "score": 75,
        "formatting": 80,
        "achievements": 70,
        "clarity": 75,
        "improvements": ["suggestion1", "suggestion2"]
    },
    "cluster": {
        "type": "specialist",
        "confidence": 0.85,
        "traits": ["trait1", "trait2"]
    },
    "explanation": "This candidate demonstrates...",
    "job_category": "technical",
    "matches": [
        { "jdSkill": "React", "resumeSkill": "React.js", "confidence": 1.0, "category": "technical" },
        { "jdSkill": "AWS", "resumeSkill": null, "confidence": 0.0, "category": "technical" }
    ]
}

JOB CATEGORIES:
- "technical": Software Engineering, Data Science, DevOps, IT, Cybersecurity. (GitHub Critical)
- "creative": Design, UX/UI, Content Creation, Marketing. (Portfolio Critical)
- "general": Business, Sales, HR, Management, Operations. (LinkedIn/Experience Critical)

MATCHING GUIDELINES:
- For EACH JD skill, find the best matching skill in the resume.
- "resumeSkill": null if no match found.
- "confidence": 0.8-1.0 (Exact/Synonym), 0.5-0.79 (Related), 0.0 (Missing).
- Examples: JS=JavaScript (1.0), CLI=Bash (0.9), React=Vue (0.0 - different frameworks).

CLUSTER TYPES:
- "specialist": Deep expertise in one domain (e.g., "ML Engineer", "iOS Developer")
- "generalist": Broad skills across multiple areas (e.g., "Full Stack", "DevOps + Dev")
- "career_switcher": Transitioning from different field (watch for bootcamp, new tech stacks)
- "early_career": 0-2 years experience, recent graduate
- "senior_leader": 8+ years, management experience, architecture roles

QUALITY SCORING (0-100 each):
- formatting: Layout, structure, readability, proper sections
- achievements: Quantified results (numbers, percentages, impact)
- clarity: Clear descriptions, no jargon overload, concise

EXPLANATION GUIDELINES:
- Be specific about skill matches and gaps
- Mention experience level alignment
- Note any red flags or standout qualities
- Keep it professional and actionable (2-3 sentences max)
- IMPORTANT: Do not use double quotes within the explanation string. Use single quotes if needed.

=== RESUME TEXT ===
${resumeText.substring(0, 25000)}

=== JOB DESCRIPTION ===
${jdText.substring(0, 10000)}
`;

  try {
    console.log(`[Gemini] Extracting Combined Data... (R: ${resumeText.length} chars, JD: ${jdText.length} chars)`);
    const result = await generateContentWithRetry(prompt);
    const response = await result.response;
    const textResponse = response.text();
    console.log(`[Gemini] Response Received`);

    // Clean JSON from markdown code blocks and find the JSON object
    let jsonStr = textResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Find the first '{' and last '}'
    const firstOpen = jsonStr.indexOf('{');
    const lastClose = jsonStr.lastIndexOf('}');

    if (firstOpen !== -1 && lastClose !== -1) {
      jsonStr = jsonStr.substring(firstOpen, lastClose + 1);
    }

    const parsed = JSON.parse(jsonStr);

    // Validate and provide defaults
    return {
      resume: {
        technical: parsed.resume?.technical || [],
        tools: parsed.resume?.tools || [],
        soft: parsed.resume?.soft || [],
        experience_years: parsed.resume?.experience_years || 0,
        education_level: parsed.resume?.education_level || "unknown"
      },
      jd: {
        technical: parsed.jd?.technical || [],
        tools: parsed.jd?.tools || [],
        soft: parsed.jd?.soft || [],
        required_experience: parsed.jd?.required_experience || 0
      },
      quality: {
        score: parsed.quality?.score || 50,
        formatting: parsed.quality?.formatting || 50,
        achievements: parsed.quality?.achievements || 50,
        clarity: parsed.quality?.clarity || 50,
        improvements: parsed.quality?.improvements || []
      },
      cluster: {
        type: parsed.cluster?.type || "generalist",
        confidence: parsed.cluster?.confidence || 0.5,
        traits: parsed.cluster?.traits || []
      },
      explanation: parsed.explanation || "Analysis complete. Review the detailed scores for more information.",
      job_category: parsed.job_category || "general",
      matches: parsed.matches || []
    };
  } catch (error: any) {
    console.error(`[Gemini] Extraction Error:`, error?.message || error);
    return getDefaultExtraction();
  }
}

/**
 * Generate AI explanation for ranking
 */
export async function explainRanking(candidateStats: any, jdSkills: any): Promise<string> {
  const prompt = `
You are an expert recruiter AI. Explain why this candidate scored the way they did.

Candidate Stats: ${JSON.stringify(candidateStats)}
Job Requirements: ${JSON.stringify(jdSkills)}

Provide a professional, 2-3 sentence explanation highlighting:
1. Key strengths that match the role
2. Any gaps or areas needing verification
3. Overall recommendation

Be concise and professional. Do not mention "AI" or "Gemini".
`;

  try {
    const result = await generateContentWithRetry(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error(`[Gemini] Explain Error:`, error);
    return "Analysis unavailable at this moment (Rate Limit or API Error).";
  }
}

/**
 * Deep project analysis for a specific GitHub repository
 */
export async function analyzeProject(repoName: string, languages: string[], description: string): Promise<{
  complexity: number;
  relevance: string[];
  insights: string;
}> {
  const prompt = `
Analyze this GitHub project for technical depth:

Repository: ${repoName}
Languages: ${languages.join(", ")}
Description: ${description}

Return JSON only:
{
    "complexity": 75,
    "relevance": ["React", "Node.js"],
    "insights": "One sentence about project quality"
}
`;

  try {
    const result = await generateContentWithRetry(prompt);
    const jsonStr = result.response.text()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(jsonStr);
  } catch {
    return { complexity: 50, relevance: [], insights: "Unable to analyze" };
  }
}

function getDefaultExtraction(): CombinedExtraction {
  return {
    resume: { technical: [], tools: [], soft: [], experience_years: 0, education_level: "unknown" },
    jd: { technical: [], tools: [], soft: [], required_experience: 0 },
    quality: { score: 50, formatting: 50, achievements: 50, clarity: 50, improvements: [] },
    cluster: { type: "generalist", confidence: 0.5, traits: [] },
    explanation: "Unable to analyze. Please try again.",
    job_category: "general",
    matches: []
  };
}

// Deprecated - kept for backwards compatibility
export async function extractSkills(text: string, type: "resume" | "jd") {
  return { technical: [], tools: [], soft: [] };
}

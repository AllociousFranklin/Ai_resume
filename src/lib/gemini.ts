import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function extractSkills(text: string, type: "resume" | "jd") {
  const prompt = `
    Analyze the following ${type} text and extract skills, tools, and soft skills.
    Return ONLY a valid JSON object with this structure:
    {
      "technical": ["skill1", "skill2"],
      "tools": ["tool1", "tool2"],
      "soft": ["soft1", "soft2"],
      "experience_years": 0 (if detectable, else null),
      "education_level": "string" (if detectable)
    }
    
    TEXT:
    ${text.substring(0, 30000)}
  `;

  try {
    console.log(`[Gemini] Generating for ${type}...`);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    console.log(`[Gemini] Response for ${type}:`, textResponse.substring(0, 50) + "...");

    // Clean code blocks if present
    const jsonStr = textResponse.replace(/^```json\n|\n```$/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`[Gemini] Error extracting for ${type}:`, error);
    return { technical: [], tools: [], soft: [] };
  }
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
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(`[Gemini] Explain Error:`, error);
    return "Analysis unavailable at this moment.";
  }
}

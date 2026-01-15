const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
require('dotenv').config();

async function fullLoadTest() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API Key found");
        return;
    }

    // 1. Get Resume Text (From Parsed File)
    const resumePath = path.resolve(__dirname, 'parsed_resume.txt');
    let resumeText = "";
    try {
        resumeText = fs.readFileSync(resumePath, 'utf8');
        console.log(`✅ Loaded Resume Text from file (${resumeText.length} chars)`);
    } catch (e) {
        console.error("❌ Failed to load Resume Text file", e);
        return;
    }

    // 2. Mock JD
    const jdText = "We are looking for a Senior Software Engineer with expertise in React, Node.js, Next.js, and TypeScript. Experience with AWS and AI integration is a plus. Must have strong problem-solving skills and 5+ years of experience.";

    // 3. Construct Exact Prompt
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = "gemini-2.5-flash";
    console.log(`Testing Full Payload on: "${modelName}"...`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log("\n✅ SUCCESS! The model processed the full payload.");
        console.log("--- Response Preview ---");
        console.log(response.text().substring(0, 500));
        console.log("------------------------");
    } catch (error) {
        console.error("\n❌ FAILED.");
        if (error.response) {
            console.log(`Status: ${error.response.status} (${error.response.statusText})`);
            if (error.response.status === 429) {
                console.log("➡️ Reason: Rate Limit Exceeded (Too Many Requests)");
                console.log("   Wait 30-60 seconds and try again.");
            }
        } else {
            console.log("Error:", error.message);
        }
    }
}

fullLoadTest();

const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

// 1. Setup Environment
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
    } catch (e) {
        console.error("Could not read .env file", e);
    }
}
loadEnv();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
// STRICTLY using 2.5 flash as requested
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function stepByStepDebug() {
    console.log("🔹 STEP 1: PDF Extraction");
    const resumePath = path.resolve(__dirname, 'Allocious_Franklin_Resume.pdf');
    let resumeText = "";

    try {
        const dataBuffer = fs.readFileSync(resumePath);
        const data = await pdf(dataBuffer);
        resumeText = data.text;
        console.log(`✅ PDF Extracted (Length: ${resumeText.length} chars)`);
    } catch (e) {
        console.error("❌ PDF Extraction Failed", e);
        return;
    }

    console.log("\n🔹 STEP 2: Create Mock JD");
    const mockJD = "We are looking for a Software Engineer with experience in React, Node.js, and Cloud services. Must be a team player.";
    console.log("✅ Mock JD Created");

    console.log("\n🔹 STEP 3: Combined Gemini Request (The Real Test)");

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
    ${resumeText.substring(0, 15000)}
    
    === JOB DESCRIPTION ===
    ${mockJD}
  `;

    try {
        console.log("⏳ Sending request to Gemini 2.5 Flash...");
        const startTime = Date.now();

        // Direct call, no retry logic here to catch the raw error
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const duration = Date.now() - startTime;
        console.log(`✅ Success! (Took ${duration}ms)`);
        console.log("--- Payload Preview ---");
        console.log(text.substring(0, 500));

    } catch (error) {
        console.error("❌ Gemini Request Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Status Text:", error.response.statusText);
        }
        console.error("Full Error:", error);
    }
}

stepByStepDebug();

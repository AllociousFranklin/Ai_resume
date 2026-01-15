const fs = require('fs');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

// Load Env
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

async function debugPipeline() {
    console.log("--- Starting Debug Pipeline ---");

    const resumePath = path.resolve(__dirname, 'Allocious_Franklin_Resume.pdf');
    if (!fs.existsSync(resumePath)) {
        console.error("❌ Resume file not found at:", resumePath);
        return;
    }

    // 1. Test PDF Parsing
    console.log(`\n[1] Parsing PDF: ${resumePath}`);
    let resumeText = "";
    try {
        const dataBuffer = fs.readFileSync(resumePath);
        const data = await pdf(dataBuffer);
        resumeText = data.text;
        console.log("✅ PDF Parsed Successfully!");
        console.log("--- Text Preview (First 500 chars) ---");
        console.log(resumeText.substring(0, 500));
        console.log("--------------------------------------");
        console.log(`Total Length: ${resumeText.length} characters`);
    } catch (error) {
        console.error("❌ PDF Parse Failed:", error);
        return;
    }

    // 2. Test Gemini Extraction
    console.log("\n[2] Testing Gemini Extraction...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using the model the user insists on
    const modelName = "gemini-2.5-flash";
    console.log(`Using model: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
    Analyze the following resume text and extract skills, tools, and soft skills.
    Return ONLY a valid JSON object.
    
    TEXT:
    ${resumeText.substring(0, 30000)}
  `;

    try {
        console.log("Sending request to Gemini...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text();
        console.log("✅ Gemini Response Received!");
        console.log("--- Response Preview ---");
        console.log(textResponse.substring(0, 500));
    } catch (error) {
        console.error("❌ Gemini API Failed:", error);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

debugPipeline();

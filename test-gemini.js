const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

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

async function test() {
    loadEnv();
    console.log("Testing Gemini API Key...");
    const key = process.env.GEMINI_API_KEY;
    console.log("Key extracted:", key ? key.substring(0, 5) + "..." : "NONE");

    if (!key) {
        console.error("No API KEY found");
        return;
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
        const result = await model.generateContent("Say 'System Operational' if you work.");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
    } catch (error) {
        console.error("Gemini Error:", error.message);
    }
}

test();

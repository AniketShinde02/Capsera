const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY_2;
    if (!key) {
        console.error("❌ No API key found in .env.local");
        return;
    }

    console.log("🔑 Using API Key ending in:", key.slice(-4));

    const genAI = new GoogleGenerativeAI(key);

    try {
        console.log("📡 Fetching available models...");
        const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // The SDK doesn't have a direct listModels method exposed easily in all versions, 
        // but we can try to hit the REST endpoint directly to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error);
            return;
        }

        console.log("\n✅ AVAILABLE MODELS:");
        const models = data.models || [];
        const flashModels = models.filter(m => m.name.includes('flash'));

        flashModels.forEach(m => {
            console.log(`- ${m.name} (Supported methods: ${m.supportedGenerationMethods.join(', ')})`);
        });

        console.log("\n⚠️ If 'gemini-1.5-flash' is not in this list, that explains the 404!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

listModels();

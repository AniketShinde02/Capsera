import fs from 'fs';
import path from 'path';

// Simple .env parser since we can't rely on dotenv being installed/configured for ES modules easily in this context
function loadEnv() {
    try {
        const envPathLocal = path.resolve(process.cwd(), '.env.local');
        const envPath = path.resolve(process.cwd(), '.env');

        let content = '';
        if (fs.existsSync(envPathLocal)) {
            content += fs.readFileSync(envPathLocal, 'utf8') + '\n';
        }
        if (fs.existsSync(envPath)) {
            content += fs.readFileSync(envPath, 'utf8') + '\n';
        }

        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                env[key] = value;
            }
        });
        return env;
    } catch (e) {
        console.error("Error loading .env:", e);
    }
    return {};
}

const env = loadEnv();
const key = env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY_2;

if (!key) {
    console.error("❌ No GEMINI_API_KEY found in .env or .env.local");
    process.exit(1);
}

console.log("🔑 Testing with API Key ending in:", key.slice(-4));

async function checkModels() {
    try {
        console.log("📡 Fetching models from Google API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API returned error:", JSON.stringify(data.error, null, 2));
            return;
        }

        if (!data.models) {
            console.error("❌ No models found in response");
            return;
        }

        const output = [];
        output.push("\n✅ AVAILABLE FLASH MODELS:");
        const flashModels = data.models.filter(m => m.name.includes('flash'));

        if (flashModels.length === 0) {
            output.push("⚠️ No 'flash' models found! Listing ALL models:");
            data.models.forEach(m => output.push(`- ${m.name}`));
        } else {
            flashModels.forEach(m => {
                output.push(`- ${m.name}`);
                output.push(`  Methods: ${m.supportedGenerationMethods.join(', ')}`);
            });
        }

        console.log(output.join('\n'));
        fs.writeFileSync('models.txt', output.join('\n'));

    } catch (error) {
        console.error("❌ Network error:", error);
    }
}

checkModels();

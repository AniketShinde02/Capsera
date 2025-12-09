
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function testModel(modelName: string) {
    console.log(`🧪 Testing Model: ${modelName}`);
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Describe image' },
                        { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg' } }
                    ]
                }]
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(JSON.stringify(data.error));

        console.log(`✅ SUCCESS: ${modelName}`);
    } catch (error: any) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
    }
}

const candidates = [
    'google/gemini-2.0-pro-exp-02-05:free',
    'qwen/qwen-vl-plus:free',
    'nousresearch/hermes-3-llama-3.1-405b:free', // Often has vision capabilities
];

for (const m of candidates) testModel(m);


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
                        { type: 'text', text: 'Describe this image.' },
                        { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg' } }
                    ]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(JSON.stringify(data.error));

        console.log(`✅ SUCCESS: ${modelName}`);
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
        return false;
    }
}

async function runTests() {
    // List of candidates
    const candidates = [
        'meta-llama/llama-3.2-11b-vision-instruct:free',
        'google/gemini-2.0-flash-lite-preview-02-05:free',
        'qwen/qwen2.5-vl-72b-instruct:free',
        'microsoft/phi-3.5-vision-instruct' // Usually cheap/free
    ];

    for (const model of candidates) {
        await testModel(model);
    }
}

runTests();


import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not found in .env');
    process.exit(1);
}

async function testFallbackModel() {
    console.log('🧪 Testing Fallback Model: meta-llama/llama-3.2-11b-vision-instruct:free');
    console.log('-----------------------------------------------------------------------');

    const messages = [
        {
            role: 'user',
            content: [
                { type: 'text', text: 'What is in this image? Describe briefly.' },
                {
                    type: 'image_url',
                    image_url: {
                        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg'
                    }
                }
            ]
        }
    ];

    try {
        const startTime = Date.now();
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://capsera.com',
                'X-Title': 'Capsera Fallback Test',
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
                messages: messages,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`❌ Fallback Model Failed (HTTP ${response.status}):`, err);
            return;
        }

        const data = await response.json();
        const duration = Date.now() - startTime;
        const content = data.choices[0]?.message?.content;

        console.log(`✅ Success! Response received in ${duration}ms`);
        console.log('📝 Output:', content);

    } catch (error) {
        console.error('❌ Exception during fetch:', error);
    }
}

testFallbackModel();

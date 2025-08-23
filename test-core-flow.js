const BASE_URL = 'http://localhost:3000'; // Make sure this matches your dev server

async function fetchWrapper(url, options) {
  console.log(`\n▶️  ${options.method || 'GET'} ${url}`);
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ FAILED: ${response.status} ${response.statusText}`);
    console.error('   Response:', JSON.stringify(data, null, 2));
    throw new Error(`Request failed to ${url}`);
  }

  console.log(`✅ SUCCESS: ${response.status}`);
  // console.log('   Response:', JSON.stringify(data, null, 2));
  return { response, data };
}

async function runCoreFlowTest() {
  try {
    console.log('--- 🚀 Starting Capsera Core Flow Test ---');

    // 1. Health Check
    await fetchWrapper(`${BASE_URL}/api/health-check`, { method: 'GET' });

    // 2. Check Rate Limit for Anonymous User
    const ipAddress = '127.0.0.1'; // Simulate IP
    const { data: rateLimitInfo } = await fetchWrapper(`${BASE_URL}/api/rate-limit-info?ipAddress=${ipAddress}`, { method: 'GET' });
    console.log(`   Anonymous user has ${rateLimitInfo.remaining} generations remaining.`);
    if (rateLimitInfo.remaining <= 0) {
        console.warn('⚠️  Anonymous rate limit is zero. Skipping generation test for anonymous user.');
    } else {
        // 3. Generate a caption as an anonymous user
        await fetchWrapper(`${BASE_URL}/api/generate-captions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mood: '😎 Cool / Confident',
                imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', // A sample image
                publicId: 'sample',
                ipAddress: ipAddress,
            }),
        });
    }

    // 4. Test Admin Setup Status
    await fetchWrapper(`${BASE_URL}/api/admin/setup`, { method: 'GET' });

    // NOTE: Testing authenticated routes would require handling login and cookies,
    // which is more complex for a simple script. This is a good start for public endpoints.

    console.log('\n\n--- ✅ Core Flow Test Completed Successfully! ---');
    console.log('All tested public endpoints are responding correctly.');

  } catch (error) {
    console.error('\n\n--- ❌ Core Flow Test FAILED ---');
    console.error('An error occurred during the test:', error.message);
    process.exit(1);
  }
}

runCoreFlowTest();
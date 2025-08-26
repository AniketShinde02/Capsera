const { chromium } = require('playwright');

(async () => {
  // Use the NEXT_PUBLIC_URL from .env for flexibility, falling back to localhost for local dev.
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  console.log(`Testing hydration for URL: ${appUrl}`);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let hydrationError = null;

  // Listen for console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('Hydration failed')) {
      hydrationError = msg.text();
    }
  });

  try {
    await page.goto(appUrl, { waitUntil: 'networkidle' });
  } catch (error) {
    console.error(`Failed to navigate to ${appUrl}. Is the server running?`);
    console.error(error);
    process.exit(1);
  }

  await browser.close();

  if (hydrationError) {
    console.error('Hydration Error Detected:');
    console.error(hydrationError);
    process.exit(1); // Exit with an error code
  } else {
    console.log('No hydration errors detected.');
    process.exit(0);
  }
})();
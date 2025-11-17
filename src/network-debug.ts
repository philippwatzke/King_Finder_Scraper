// Monitor network requests to see how the real website calls the API
import { chromium } from 'playwright';

async function networkDebug() {
  console.log('🔍 Monitoring network requests...\n');

  const browser = await chromium.launch({
    headless: false,  // Run in non-headless to see what happens
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  // Monitor all GraphQL requests
  page.on('request', request => {
    if (request.url().includes('graphql')) {
      console.log('\n🌐 GraphQL Request:');
      console.log('URL:', request.url());
      console.log('Method:', request.method());
      console.log('Headers:', JSON.stringify(request.headers(), null, 2));
      const postData = request.postData();
      if (postData) {
        console.log('Body (first 500 chars):', postData.substring(0, 500));
      }
    }
  });

  page.on('response', async response => {
    if (response.url().includes('graphql')) {
      console.log('\n✅ GraphQL Response:');
      console.log('Status:', response.status());
      console.log('Headers:', JSON.stringify(response.headers(), null, 2));
      try {
        const text = await response.text();
        console.log('Body (first 500 chars):', text.substring(0, 500));
      } catch (e) {
        console.log('Could not read response body');
      }
    }
  });

  console.log('🌐 Loading Burger King store locator...');

  try {
    await page.goto('https://www.burgerking.de/store-locator', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded');

    // Handle cookie banner
    try {
      const cookieButton = page.locator('button:has-text("Alle akzeptieren")').first();
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click();
        console.log('✅ Accepted cookies');
        await page.waitForTimeout(2000);
      }
    } catch {}

    // Wait to see if any GraphQL requests are made
    console.log('\n⏳ Waiting 10 seconds to observe network traffic...');
    await page.waitForTimeout(10000);

    console.log('\n✅ Done monitoring. Check output above for GraphQL requests.');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }

  await browser.close();
}

networkDebug().catch(console.error);

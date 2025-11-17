// Simple test - load page and try API from browser context
import { chromium } from 'playwright';

async function simpleTest() {
  console.log('🧪 Simple test - checking if API works from browser...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  console.log('🌐 Loading page with longer timeout...');

  try {
    await page.goto('https://www.burgerking.de/store-locator', {
      waitUntil: 'load',
      timeout: 90000
    });
    console.log('✅ Page loaded successfully');
  } catch (error: any) {
    console.log('⚠️  Page load timeout/error:', error.message);
    console.log('Continuing anyway...');
  }

  await page.waitForTimeout(5000);

  // Try to accept cookies
  try {
    await page.locator('button:has-text("Alle akzeptieren")').first().click({ timeout: 3000 });
    console.log('✅ Cookies accepted');
    await page.waitForTimeout(2000);
  } catch {
    console.log('⚠️  No cookie banner found or already accepted');
  }

  console.log('\n📍 Testing API call for Berlin (52.52, 13.40)...\n');

  const result = await page.evaluate(async () => {
    const query = `
      query GetRestaurants($input: RestaurantsInput) {
        restaurants(input: $input) {
          totalCount
          nodes {
            storeId
            name
            latitude
            longitude
            physicalAddress {
              address1
              city
              postalCode
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        filter: "NEARBY",
        coordinates: {
          userLat: 52.52,
          userLng: 13.40,
          searchRadius: 50000
        },
        first: 10,
        status: "OPEN"
      }
    };

    try {
      const response = await fetch('https://euc1-prod-bk.rbictg.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify([{
          operationName: 'GetRestaurants',
          variables,
          query
        }])
      });

      const status = response.status;
      const statusText = response.statusText;
      const text = await response.text();

      return {
        status,
        statusText,
        bodyLength: text.length,
        body: text,
        success: response.ok
      };
    } catch (error: any) {
      return {
        error: error.message,
        stack: error.stack
      };
    }
  });

  console.log('=== Result ===');
  console.log('Status:', result.status || 'N/A');
  console.log('Success:', result.success);
  console.log('Body length:', result.bodyLength);

  if (result.body) {
    console.log('\n=== Response Body ===');
    console.log(result.body.substring(0, 1000));

    try {
      const data = JSON.parse(result.body);
      console.log('\n=== Parsed JSON ===');
      console.log(JSON.stringify(data, null, 2).substring(0, 1500));

      if (Array.isArray(data) && data[0]?.data?.restaurants) {
        const totalCount = data[0].data.restaurants.totalCount;
        const nodes = data[0].data.restaurants.nodes || [];
        console.log(`\n✅ SUCCESS! Found ${totalCount} total restaurants`);
        console.log(`   Returned ${nodes.length} in this query`);

        if (nodes.length > 0) {
          console.log('\n📋 First restaurant:');
          console.log(`   Name: ${nodes[0].name}`);
          console.log(`   Address: ${nodes[0].physicalAddress.address1}, ${nodes[0].physicalAddress.city}`);
          console.log(`   Coordinates: ${nodes[0].latitude}, ${nodes[0].longitude}`);
        }
      }
    } catch (e: any) {
      console.log('Could not parse as JSON:', e.message);
    }
  }

  if (result.error) {
    console.log('\n❌ Error:', result.error);
  }

  await browser.close();
}

simpleTest().catch(console.error);

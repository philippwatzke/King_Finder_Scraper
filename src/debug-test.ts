// Debug test to see what the API actually returns
import { chromium } from 'playwright';

async function debugTest() {
  console.log('🧪 Debug test - checking API responses...\n');

  const browser = await chromium.launch({
    headless: true,
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

  console.log('🌐 Loading Burger King store locator first...');
  await page.goto('https://www.burgerking.de/store-locator', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // Handle cookie banner
  try {
    const cookieButton = page.locator('button:has-text("Alle akzeptieren")').first();
    if (await cookieButton.isVisible({ timeout: 5000 })) {
      await cookieButton.click();
      console.log('✅ Accepted cookies');
      await page.waitForTimeout(2000);
    }
  } catch {}

  await page.waitForTimeout(3000);
  console.log('✅ Page loaded\n');

  console.log('📍 Testing Berlin coordinates: 52.52, 13.40');

  const result = await page.evaluate(async () => {
    const query = `
      query GetRestaurants($input: RestaurantsInput) {
        restaurants(input: $input) {
          totalCount
          nodes {
            _id
            storeId
            number
            name
            latitude
            longitude
            phoneNumber
            email
            physicalAddress {
              address1
              address2
              city
              country
              postalCode
              stateProvince
            }
            hasDelivery
            hasDineIn
            hasDriveThru
            hasMobileOrdering
            hasWifi
            hasPlayground
            hasParking
            franchiseGroupName
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
        first: 100,
        status: "OPEN"
      }
    };

    try {
      console.log('Sending request to API...');

      const response = await fetch('https://euc1-prod-bk.rbictg.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-ui-language': 'de',
          'x-ui-region': 'DE'
        },
        body: JSON.stringify([{
          operationName: 'GetRestaurants',
          variables,
          query
        }])
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        return { error: `HTTP ${response.status}`, responseText: text.substring(0, 500) };
      }

      const text = await response.text();
      console.log('Response body length:', text.length);
      console.log('Response body (first 500 chars):', text.substring(0, 500));

      let data;
      try {
        data = JSON.parse(text);
      } catch (e: any) {
        return { error: 'JSON parse error: ' + e.message, text: text.substring(0, 500) };
      }

      return { success: true, data, dataLength: text.length };
    } catch (error: any) {
      return { error: 'Fetch failed: ' + error.message, stack: error.stack };
    }
  });

  console.log('\n=== API Response ===');
  console.log(JSON.stringify(result, null, 2));

  if (result.success && result.data) {
    console.log('\n=== Parsed Data ===');
    if (Array.isArray(result.data) && result.data[0]?.data?.restaurants) {
      const restaurants = result.data[0].data.restaurants;
      console.log(`Total Count: ${restaurants.totalCount}`);
      console.log(`Nodes returned: ${restaurants.nodes?.length || 0}`);

      if (restaurants.nodes && restaurants.nodes.length > 0) {
        console.log('\n=== First Restaurant ===');
        console.log(JSON.stringify(restaurants.nodes[0], null, 2));
      }
    } else {
      console.log('Data structure:', Object.keys(result.data));
    }
  }

  await browser.close();
}

debugTest().catch(console.error);

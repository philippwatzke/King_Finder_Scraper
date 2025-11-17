// Direct API test without loading the website
import { chromium } from 'playwright';

async function directApiTest() {
  console.log('🧪 Direct API test with market headers...\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Don't load the website, just test the API directly
  console.log('📍 Testing API call for Berlin (52.52, 13.40)...\n');

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

      const status = response.status;
      const text = await response.text();

      return { status, text, success: response.ok };
    } catch (error: any) {
      return { error: error.message };
    }
  });

  console.log('=== Result ===');
  console.log('Status:', result.status);
  console.log('Success:', result.success);

  if (result.text) {
    console.log('\nResponse:', result.text.substring(0, 500));

    try {
      const data = JSON.parse(result.text);
      if (Array.isArray(data) && data[0]?.data?.restaurants) {
        const totalCount = data[0].data.restaurants.totalCount;
        const nodes = data[0].data.restaurants.nodes || [];
        console.log(`\n✅ SUCCESS! Found ${totalCount} total restaurants`);
        console.log(`   Returned ${nodes.length} in this query`);

        if (nodes.length > 0) {
          console.log('\n📋 First restaurant:');
          console.log(`   Name: ${nodes[0].name}`);
          console.log(`   Address: ${nodes[0].physicalAddress.address1}, ${nodes[0].physicalAddress.city}`);
        }
      } else if (data.errors) {
        console.log('\n❌ API Error:', data.errors[0].message);
      }
    } catch {}
  }

  if (result.error) {
    console.log('\n❌ Error:', result.error);
  }

  await browser.close();
}

directApiTest().catch(console.error);

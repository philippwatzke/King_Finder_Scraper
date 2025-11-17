// Quick test script to verify the scraper works with progress bar
import { KingFinderScraper } from './scraper';

async function quickTest() {
  console.log('🧪 Running improved test with better error handling...\n');

  const scraper = new KingFinderScraper();

  try {
    await scraper['initialize']();
    console.log('✅ Browser initialized\n');

    await scraper['navigateAndSetup']();
    console.log('✅ Page loaded and set up\n');

    const testLocations = [
      { lat: 52.52, lng: 13.40, name: 'Berlin' },
      { lat: 48.14, lng: 11.58, name: 'München' },
      { lat: 50.94, lng: 6.96, name: 'Köln' }
    ];

    console.log(`📍 Testing ${testLocations.length} locations:\n`);

    let totalFound = 0;

    for (const location of testLocations) {
      console.log(`🔍 Testing ${location.name} (${location.lat}, ${location.lng})...`);

      const restaurants = await scraper['fetchRestaurantsAtLocation'](
        location.lat,
        location.lng,
        50000
      );

      if (restaurants.length > 0) {
        console.log(`   ✅ Found ${restaurants.length} restaurants`);
        totalFound += restaurants.length;

        if (totalFound === restaurants.length) {
          // Only show sample for first successful location
          console.log(`   📋 Sample: ${restaurants[0].name}`);
          console.log(`      ${restaurants[0].physicalAddress.address1}, ${restaurants[0].physicalAddress.city}\n`);
        }
      } else {
        console.log(`   ⚠️  No restaurants found\n`);
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('━'.repeat(80));
    if (totalFound > 0) {
      console.log(`✅ TEST SUCCESSFUL! Found ${totalFound} total restaurants`);
    } else {
      console.log('❌ TEST FAILED: No restaurants found at any location');
      console.log('   This likely means the API is blocking requests or has changed');
    }
    console.log('━'.repeat(80) + '\n');

    await scraper['close']();

  } catch (error: any) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

quickTest();

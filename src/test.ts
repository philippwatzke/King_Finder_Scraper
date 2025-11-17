// Quick test script to verify the scraper works with progress bar
import { KingFinderScraper } from './scraper';

async function quickTest() {
  console.log('🧪 Running quick test...\n');

  const scraper = new KingFinderScraper();

  // Override generateGermanyGrid to only test 3 points
  const originalMethod = scraper['generateGermanyGrid'];
  scraper['generateGermanyGrid'] = function() {
    return [
      { lat: 52.52, lng: 13.40 },  // Berlin
      { lat: 48.14, lng: 11.58 },  // München
      { lat: 50.94, lng: 6.96 }    // Köln
    ];
  };

  try {
    await scraper['initialize']();
    await scraper['navigateAndSetup']();

    const grid = scraper['generateGermanyGrid']();
    console.log(`📍 Testing with ${grid.length} locations\n`);

    // Test one location
    const restaurants = await scraper['fetchRestaurantsAtLocation'](52.52, 13.40, 50000);
    console.log(`\n✅ Test successful! Found ${restaurants.length} restaurants near Berlin`);

    if (restaurants.length > 0) {
      console.log('\n📋 Sample restaurant:');
      const sample = restaurants[0];
      console.log(`   Name: ${sample.name}`);
      console.log(`   Address: ${sample.physicalAddress.address1}, ${sample.physicalAddress.city}`);
      console.log(`   Coordinates: ${sample.latitude}, ${sample.longitude}`);
    }

    await scraper['close']();

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

quickTest();

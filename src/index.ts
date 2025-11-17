import { KingFinderScraper } from './scraper';

async function main() {
  const scraper = new KingFinderScraper();
  await scraper.run();
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});

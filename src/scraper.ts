import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as cliProgress from 'cli-progress';

interface Restaurant {
  storeId: string;
  number?: string;
  name: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  email?: string;
  physicalAddress: {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    country: string;
    stateProvince?: string;
  };
  hasDelivery?: boolean;
  hasDineIn?: boolean;
  hasDriveThru?: boolean;
  hasMobileOrdering?: boolean;
  hasWifi?: boolean;
  hasPlayground?: boolean;
  hasParking?: boolean;
  franchiseGroupName?: string;
  [key: string]: any;
}

export class KingFinderScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly url = 'https://www.burgerking.de/store-locator';
  private allStores: Map<string, Restaurant> = new Map();
  private progressBar: cliProgress.SingleBar | null = null;

  async initialize(): Promise<void> {
    console.log('🍔 King Finder Scraper v1.0');
    console.log('━'.repeat(80));
    console.log('🚀 Initializing browser...');

    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'de-DE',
      timezoneId: 'Europe/Berlin'
    });

    this.page = await context.newPage();
    console.log('✅ Browser ready\n');
  }

  async navigateAndSetup(): Promise<void> {
    if (!this.page) throw new Error('Page not initialized');

    console.log('🌐 Loading Burger King store locator...');
    await this.page.goto(this.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Handle cookie banner
    try {
      const cookieButton = this.page.locator('button:has-text("Alle akzeptieren")').first();
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click();
        await this.page.waitForTimeout(2000);
      }
    } catch {}

    await this.page.waitForTimeout(3000);
    console.log('✅ Page loaded\n');
  }

  async fetchRestaurantsAtLocation(lat: number, lng: number, radius: number = 50000): Promise<Restaurant[]> {
    if (!this.page) throw new Error('Page not initialized');

    const result = await this.page.evaluate(async ({ lat, lng, radius }) => {
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
            userLat: lat,
            userLng: lng,
            searchRadius: radius
          },
          first: 100,
          status: "OPEN"
        }
      };

      try {
        const response = await fetch('https://euc1-prod-bk.rbictg.com/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify([{
            operationName: 'GetRestaurants',
            variables,
            query
          }])
        });

        if (!response.ok) {
          return { error: `HTTP ${response.status}`, restaurants: [] };
        }

        const data = await response.json();

        if (data && data.length > 0 && data[0].data && data[0].data.restaurants) {
          return {
            totalCount: data[0].data.restaurants.totalCount,
            restaurants: data[0].data.restaurants.nodes
          };
        }

        return { restaurants: [] };
      } catch (error: any) {
        return { error: error.message, restaurants: [] };
      }
    }, { lat, lng, radius });

    return result.restaurants as Restaurant[];
  }

  generateGermanyGrid(): Array<{ lat: number; lng: number }> {
    // Germany bounding box
    const latMin = 47.3, latMax = 55.0;
    const lngMin = 5.9, lngMax = 15.0;

    // Grid step sizes (~50km coverage)
    const latStep = 0.5;
    const lngStep = 0.7;

    const coordinates: Array<{ lat: number; lng: number }> = [];

    for (let lat = latMin; lat <= latMax; lat += latStep) {
      for (let lng = lngMin; lng <= lngMax; lng += lngStep) {
        coordinates.push({
          lat: Math.round(lat * 100) / 100,
          lng: Math.round(lng * 100) / 100
        });
      }
    }

    return coordinates;
  }

  async scrapeAll(): Promise<void> {
    await this.initialize();
    await this.navigateAndSetup();

    const coordinates = this.generateGermanyGrid();
    console.log(`📍 Generated ${coordinates.length} search points across Germany\n`);

    // Create progress bar
    this.progressBar = new cliProgress.SingleBar({
      format: 'Progress |{bar}| {percentage}% | {value}/{total} Points | Found: {stores} stores',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });

    this.progressBar.start(coordinates.length, 0, { stores: 0 });

    for (let i = 0; i < coordinates.length; i++) {
      const { lat, lng } = coordinates[i];

      const restaurants = await this.fetchRestaurantsAtLocation(lat, lng);

      let newCount = 0;
      restaurants.forEach(restaurant => {
        const storeId = restaurant.storeId || restaurant.number;
        if (storeId && !this.allStores.has(storeId)) {
          this.allStores.set(storeId, restaurant);
          newCount++;
        }
      });

      // Update progress bar
      this.progressBar.update(i + 1, { stores: this.allStores.size });

      // Save progress every 20 iterations
      if ((i + 1) % 20 === 0) {
        this.saveProgress();
      }

      // Rate limiting
      if (this.page) {
        await this.page.waitForTimeout(800);
      }
    }

    this.progressBar.stop();

    console.log('\n' + '━'.repeat(80));
    console.log(`✅ SCRAPING COMPLETE!`);
    console.log(`📊 Total unique stores found: ${this.allStores.size}`);
    console.log('━'.repeat(80) + '\n');
  }

  saveProgress(): void {
    const data = Array.from(this.allStores.values());
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output');
    }
    fs.writeFileSync(
      'output/progress.json',
      JSON.stringify(data, null, 2)
    );
  }

  exportToJSON(filename: string = 'output/burger-king-stores-germany.json'): void {
    const data = Array.from(this.allStores.values());

    if (!fs.existsSync('output')) {
      fs.mkdirSync('output');
    }

    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`✅ Exported ${data.length} stores to ${filename}`);
  }

  exportToCSV(filename: string = 'output/burger-king-stores-germany.csv'): void {
    const data = Array.from(this.allStores.values());

    if (!fs.existsSync('output')) {
      fs.mkdirSync('output');
    }

    const headers = [
      'storeId', 'number', 'name', 'latitude', 'longitude',
      'address1', 'address2', 'city', 'postalCode', 'country',
      'phoneNumber', 'email', 'hasDelivery', 'hasDineIn', 'hasDriveThru',
      'hasMobileOrdering', 'hasWifi', 'hasPlayground', 'hasParking', 'franchiseGroupName'
    ];

    const csvRows = [headers.join(',')];

    data.forEach(store => {
      const row = [
        store.storeId || '',
        store.number || '',
        `"${(store.name || '').replace(/"/g, '""')}"`,
        store.latitude || '',
        store.longitude || '',
        `"${(store.physicalAddress?.address1 || '').replace(/"/g, '""')}"`,
        `"${(store.physicalAddress?.address2 || '').replace(/"/g, '""')}"`,
        `"${(store.physicalAddress?.city || '').replace(/"/g, '""')}"`,
        store.physicalAddress?.postalCode || '',
        store.physicalAddress?.country || '',
        store.phoneNumber || '',
        store.email || '',
        store.hasDelivery || false,
        store.hasDineIn || false,
        store.hasDriveThru || false,
        store.hasMobileOrdering || false,
        store.hasWifi || false,
        store.hasPlayground || false,
        store.hasParking || false,
        `"${(store.franchiseGroupName || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    fs.writeFileSync(filename, csvRows.join('\n'));
    console.log(`✅ Exported ${data.length} stores to ${filename}`);
  }

  printSummary(count: number = 5): void {
    const data = Array.from(this.allStores.values()).slice(0, count);

    console.log(`\n📋 Sample of ${Math.min(count, data.length)} stores:`);
    console.log('━'.repeat(80));

    data.forEach((store, idx) => {
      console.log(`\n${idx + 1}. ${store.name}`);
      console.log(`   📍 ${store.physicalAddress.address1}, ${store.physicalAddress.postalCode} ${store.physicalAddress.city}`);
      console.log(`   🗺️  ${store.latitude}, ${store.longitude}`);
      console.log(`   📞 ${store.phoneNumber || 'N/A'}`);
      console.log(`   🍔 Delivery: ${store.hasDelivery ? '✓' : '✗'} | Dine-In: ${store.hasDineIn ? '✓' : '✗'} | Drive-Thru: ${store.hasDriveThru ? '✓' : '✗'}`);
    });
    console.log();
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run(): Promise<void> {
    try {
      await this.scrapeAll();
      this.printSummary(5);
      this.exportToJSON();
      this.exportToCSV();
      console.log('━'.repeat(80));
      console.log('✅ All done! Check the output folder for results.');
      console.log('━'.repeat(80) + '\n');
    } finally {
      await this.close();
    }
  }
}

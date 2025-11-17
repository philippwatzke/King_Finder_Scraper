# 🍔 King Finder Scraper

> A powerful web scraper to extract all Burger King restaurant locations in Germany with coordinates and detailed information.

## ✨ Features

- 🗺️ Scrapes **all Burger King locations** in Germany
- 📍 Extracts **GPS coordinates** (latitude/longitude)
- 📊 Exports to **JSON** and **CSV** formats
- 🎯 Uses official Burger King GraphQL API
- 🚀 Built with **Playwright** for reliable browser automation
- 📈 Real-time **progress bar** with live statistics
- 💾 Auto-saves progress every 20 iterations
- 🔄 Automatic **duplicate detection**

## 📋 Data Fields

Each location includes:

- Store ID & Name
- Full Address (street, city, postal code, country)
- GPS Coordinates (latitude, longitude)
- Contact Information (phone, email)
- Features:
  - Delivery availability
  - Dine-in option
  - Drive-thru presence
  - Mobile ordering
  - WiFi availability
  - Playground
  - Parking
- Franchise group information

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/philippwatzke/King_Finder_Scraper.git
cd King_Finder_Scraper

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

## 💻 Usage

### Run the scraper

```bash
# Using npm scripts (recommended)
npm run scrape

# Or directly with ts-node
npm run dev

# Or build and run
npm run build
npm start
```

### Output

The scraper generates two files in the `output/` directory:

- `burger-king-stores-germany.json` - Complete data in JSON format
- `burger-king-stores-germany.csv` - Data in CSV format for Excel/Sheets

### Progress Tracking

During execution, you'll see a real-time progress bar:

```
Progress |████████████████░░░░| 75% | 168/224 Points | Found: 487 stores
```

## 📊 How it Works

1. **Grid Generation**: Creates a grid of 224 coordinate points covering all of Germany
2. **API Queries**: For each point, queries the Burger King GraphQL API with a 50km radius
3. **Data Collection**: Collects restaurant data from API responses
4. **Deduplication**: Removes duplicate stores based on Store ID
5. **Export**: Saves all unique stores to JSON and CSV files

## 🛠️ Technical Details

### Technology Stack

- **TypeScript** - Type-safe code
- **Playwright** - Browser automation
- **cli-progress** - Progress bar visualization
- **Burger King GraphQL API** - Data source

### API Endpoint

```
POST https://euc1-prod-bk.rbictg.com/graphql
Query: GetRestaurants
```

### Coverage

- **Area**: All of Germany
- **Grid Points**: 224 locations
- **Search Radius**: 50km per point
- **Expected Stores**: ~700 locations

## 📝 Example Output

### JSON

```json
{
  "storeId": "15557",
  "name": "Europaplatz 1, Berlin Berlin 10557 - Germany",
  "latitude": 52.5249,
  "longitude": 13.369,
  "phoneNumber": "030-403674663",
  "physicalAddress": {
    "address1": "Europaplatz 1, Berlin",
    "city": "Berlin",
    "postalCode": "10557",
    "country": "Germany"
  },
  "hasDelivery": true,
  "hasDineIn": true,
  "hasDriveThru": false
}
```

### CSV

```csv
storeId,number,name,latitude,longitude,address1,city,postalCode,country,phoneNumber,...
15557,15557,"Europaplatz 1, Berlin Berlin 10557 - Germany",52.5249,13.369,"Europaplatz 1, Berlin","Berlin",10557,Germany,030-403674663,...
```

## ⚙️ Configuration

You can adjust the scraping parameters in `src/scraper.ts`:

```typescript
// Grid coverage
const latStep = 0.5;  // Latitude step (~55km)
const lngStep = 0.7;  // Longitude step (~50km)

// API search radius
const radius = 50000; // 50km in meters

// Rate limiting
await this.page.waitForTimeout(800); // Delay between requests (ms)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Disclaimer

This tool is for educational and research purposes only. Please respect Burger King's terms of service and use responsibly. Consider implementing rate limiting and caching to minimize server load.

## 🐛 Troubleshooting

### Timeout Errors

If you experience timeout errors:
- Increase the timeout in `navigateAndSetup()` method
- Check your internet connection
- Try running with `headless: false` to see what's happening

### Missing Stores

The scraper uses a grid-based approach. To increase coverage:
- Reduce `latStep` and `lngStep` values for more grid points
- Increase the `radius` parameter for larger search areas

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions

---

Made with ❤️ by [philippwatzke](https://github.com/philippwatzke)

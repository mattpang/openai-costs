const fs = require('fs');

// Playwright-extra allows plugin support — needed for stealth
const { chromium } = require('playwright-extra');

// Load the stealth plugin and use defaults (all tricks to hide playwright usage)
// Note: playwright-extra is compatible with most puppeteer-extra plugins
const stealth = require('puppeteer-extra-plugin-stealth')()


// Important: this step must happen BEFORE launching the browser
chromium.use(stealth); // Without this, Cloudflare will likely detect automation and serve a challenge

(async () => {
  const browser = await chromium.launch({headless:true});


  const context = await browser.newContext({
    // Real users don’t have consistent viewports — this helps avoid fingerprint mismatches
    viewport: {
      width: 1280 + Math.floor(Math.random() * 100), // Randomize a bit
      height: 720 + Math.floor(Math.random() * 100)
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...', // Use a real user-agent, ideally from your proxy location
    locale: 'en-US',                    // Match browser locale to IP region
    timezoneId: 'America/New_York',     // Timezone mismatches are a red flag in Cloudflare fingerprinting
  });


  const page = await browser.newPage();
  await page.goto('https://platform.openai.com/docs/pricing', { waitUntil: 'networkidle' });

  const pricingData = await page.evaluate(() => {

  const tables = Array.from(document.getElementsByTagName('table'));
  const prices = [];

  for (const table of tables) {
    const headers = Array.from(table.querySelectorAll('thead th')).map(th =>
      th.innerText.trim().toLowerCase().replace(/\s+/g, '_') // normalize key names
    );

    const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
      const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim().split('\n\n').at(0));
      const entry = {};

      headers.forEach((header, index) => {
        entry[header] = cells[index] ?? null;
      });

      return entry;
    });

    prices.push(rows);
  }

    return prices.flat();
  });
  console.log(JSON.stringify(pricingData))
  await browser.close();

  fs.writeFileSync('openai-prices.json', JSON.stringify(pricingData, null, 2));
})();
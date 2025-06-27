const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://platform.openai.com/docs/pricing', { waitUntil: 'domcontentloaded' });

  // You may need to tweak selectors if the DOM changes
  const pricingData = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('h2, h3'));
    const prices = [];

    let currentModel = null;
    for (const section of sections) {
      const text = section.textContent.trim();

      if (/gpt|embedding|moderation|image|audio|vision/i.test(text)) {
        currentModel = text;
      }

      const table = section.nextElementSibling;
      if (table && table.tagName === 'TABLE') {
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
          const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
          return { type: cells[0], price: cells[1] };
        });

        prices.push({ model: currentModel, pricing: rows });
      }
    }

    return prices;
  });

  await browser.close();

  fs.writeFileSync('openai-prices.json', JSON.stringify(pricingData, null, 2));
})();
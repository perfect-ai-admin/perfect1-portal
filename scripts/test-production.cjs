/**
 * Quick production test — checks critical routes on the live site.
 */
const puppeteer = require('puppeteer-core');

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'https://www.perfect1.co.il';
const ROUTES = ['/login', '/CRM', '/CRM/dashboard', '/'];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const t = msg.text();
        if (!/google-analytics|doubleclick|facebook|gtag|ERR_BLOCKED|favicon|blocked/.test(t))
          errors.push(t);
      }
    });

    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForFunction(() => {
        const root = document.getElementById('root');
        return root && root.children.length > 0;
      }, { timeout: 10000 });

      await new Promise(r => setTimeout(r, 5000));

      const finalUrl = page.url();
      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body?.innerText?.substring(0, 300) || '');
      const hasSpinner = await page.evaluate(() => !!document.querySelector('.animate-spin'));
      const hasError = bodyText.includes('משהו השתבש');

      console.log(`--- ${route} ---`);
      console.log(`  Final URL: ${finalUrl}`);
      console.log(`  Title: ${title}`);
      console.log(`  Spinner stuck: ${hasSpinner}`);
      console.log(`  Error boundary: ${hasError}`);
      console.log(`  JS errors: ${errors.length ? errors.join('; ') : 'none'}`);
      console.log(`  Body (100ch): ${bodyText.substring(0, 100).replace(/\n/g, ' ')}`);
      if (hasSpinner || hasError || errors.length) console.log(`  ❌ ISSUE DETECTED`);
      else console.log(`  ✅ OK`);
    } catch (err) {
      console.log(`--- ${route} --- FAILED: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();
})();

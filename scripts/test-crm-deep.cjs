const puppeteer = require('puppeteer-core');
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const routes = ['/CRM', '/CRM/dashboard', '/CRM/tasks', '/CRM/settings'];

  for (const route of routes) {
    const page = await browser.newPage();
    const errors = [];
    const networkErrors = [];

    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      const t = msg.text();
      if (msg.type() === 'error' && !/google-analytics|doubleclick|facebook|gtag|ERR_BLOCKED|favicon/.test(t))
        errors.push(t);
      if (msg.type() === 'warning' && t.includes('CRMLayout'))
        console.log(`  [console.warn] ${t}`);
    });
    page.on('requestfailed', req => {
      networkErrors.push(`${req.url()} - ${req.failure()?.errorText || 'unknown'}`);
    });

    try {
      const response = await page.goto('https://www.perfect1.co.il' + route, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait a bit for React hydration + auth check + redirect
      await new Promise(r => setTimeout(r, 7000));

      const finalUrl = page.url();
      const rootHTML = await page.evaluate(() => {
        const root = document.getElementById('root');
        return root ? root.innerHTML.substring(0, 500) : 'NO ROOT';
      });
      const hasSpinner = await page.evaluate(() => !!document.querySelector('.animate-spin'));

      console.log(`\n=== ${route} ===`);
      console.log(`  HTTP: ${response.status()}`);
      console.log(`  Final URL: ${finalUrl}`);
      console.log(`  Root empty: ${rootHTML.length < 10}`);
      console.log(`  Spinner: ${hasSpinner}`);
      console.log(`  JS errors (${errors.length}): ${errors.slice(0,3).join('; ') || 'none'}`);
      console.log(`  Network errors (${networkErrors.length}): ${networkErrors.slice(0,3).join('; ') || 'none'}`);
      if (rootHTML.length < 10) console.log(`  Root HTML: "${rootHTML}"`);
      else console.log(`  Root preview: ${rootHTML.substring(0, 200).replace(/\n/g, ' ')}`);
    } catch (err) {
      console.log(`\n=== ${route} === ERROR: ${err.message}`);
    }
    await page.close();
  }

  await browser.close();
})();

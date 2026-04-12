/**
 * Smoke test for critical routes — runs after `vite build`, BEFORE deploy.
 * Boots a local static server against dist/ and uses Puppeteer+Chrome to visit
 * each route, failing if:
 *   1. An uncaught JS error fires (`pageerror`)
 *   2. The GeneralErrorBoundary fallback ("משהו השתבש") renders
 *   3. The route is still stuck in a loading spinner after 8s
 *      (e.g. CRMLayout "מתחבר למערכת..." — the exact class of bug we just fixed)
 *
 * Usage: node scripts/smoke-test-routes.js
 * Runs in CI via .github/workflows/deploy.yml before `vercel deploy`.
 *
 * Why this exists: static analysis and `vite build` succeeding do NOT guarantee
 * a route renders at runtime. Things like missing env vars, broken module
 * side-effects, unhandled promise rejections, or a corrupt localStorage token
 * only surface when JS actually runs. This script catches them pre-deploy so
 * the live site never shows a white screen / spinner-forever to real users.
 */

import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = resolve(__dirname, '../dist');

// Routes that MUST render successfully for the site to be considered healthy.
// Keep this list short and targeted at historically fragile routes.
const CRITICAL_ROUTES = [
  '/',
  '/osek-patur',
  '/osek-murshe',
  '/hevra-bam',
  '/guides',
  '/calculators',
  '/compare/osek-patur-vs-murshe',
  '/login',
  '/CRM',           // ← redirects to /login when unauthenticated; must not hang
  '/CRM/dashboard',
  '/CRM/tasks',
  '/CRM/settings',
  '/open-osek-patur-online',
  '/patur-vs-murshe',
  '/ThankYou',
];

const ERROR_BOUNDARY_MARKER = 'משהו השתבש';
const CRM_SPINNER_MARKER = 'מתחבר למערכת';

function startServer(port) {
  return new Promise((resolvePromise) => {
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
    };

    const server = createServer((req, res) => {
      const urlPath = req.url.split('?')[0];
      let filePath = join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
      if (!extname(filePath) || !existsSync(filePath)) {
        filePath = join(DIST_DIR, 'index.html');
      }
      try {
        const content = readFileSync(filePath);
        const ext = extname(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, () => resolvePromise(server));
  });
}

async function smokeTest() {
  if (!existsSync(DIST_DIR)) {
    console.error('\n❌ dist/ not found. Run `npm run build` first.\n');
    process.exit(1);
  }

  const PORT = 4174;
  const server = await startServer(PORT);
  console.log(`\n🌐 Local server on port ${PORT}`);

  const executablePath = process.env.CHROME_PATH
    || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const failures = [];

  for (const route of CRITICAL_ROUTES) {
    const page = await browser.newPage();
    const jsErrors = [];

    page.on('pageerror', (err) => jsErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known noisy third-party errors (GA, ads pixels blocked locally)
        if (/google-analytics|doubleclick|facebook|gtag|ERR_BLOCKED/.test(text)) return;
        jsErrors.push(`console.error: ${text}`);
      }
    });

    try {
      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for React to mount content into #root.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.children.length > 0;
        },
        { timeout: 15000 }
      );

      // Give the app 3s to either render a real page or redirect.
      // Longer than that means a hang (e.g. auth spinner frozen).
      await new Promise((r) => setTimeout(r, 3000));

      const html = await page.content();

      if (html.includes(ERROR_BOUNDARY_MARKER)) {
        failures.push(`${route} — GeneralErrorBoundary triggered ("${ERROR_BOUNDARY_MARKER}")`);
      } else if (html.includes(CRM_SPINNER_MARKER)) {
        // CRM spinner should have resolved (either rendered dashboard or redirected to /login).
        // If it's still visible after 3s, the auth guard is hanging.
        failures.push(`${route} — CRMLayout auth spinner is stuck (never redirected or authed)`);
      } else if (jsErrors.length > 0) {
        failures.push(`${route} — JS errors:\n      ${jsErrors.join('\n      ')}`);
      } else {
        console.log(`  ✅ ${route}`);
      }
    } catch (err) {
      failures.push(`${route} — ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();

  if (failures.length > 0) {
    console.error(`\n❌ Smoke test failed on ${failures.length} route(s):\n`);
    failures.forEach((f) => console.error(`  ✗ ${f}`));
    console.error('\nFix these before deploying — they would produce broken pages in production.\n');
    process.exit(1);
  }

  console.log(`\n✅ All ${CRITICAL_ROUTES.length} critical routes rendered successfully.\n`);
}

smokeTest().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});

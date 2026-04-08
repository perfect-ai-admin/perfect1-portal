/**
 * Pre-render script for SEO
 * Generates static HTML for portal pages so Google can index them.
 *
 * Usage: node scripts/prerender.js
 * Runs after `vite build` — opens each route in Puppeteer,
 * waits for React to render, then saves the full HTML.
 */

import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = resolve(__dirname, '../dist');
const CONTENT_DIR = resolve(__dirname, '../src/content');
const BASE_URL = 'https://www.perfect1.co.il';

// Discover all portal routes dynamically from content JSON files
function discoverRoutes() {
  const routes = [
    '/',
    '/opening-business-israel',
  ];

  const categories = ['osek-patur', 'osek-murshe', 'hevra-bam', 'sgirat-tikim', 'guides'];

  for (const cat of categories) {
    routes.push(`/${cat}`);
    const catDir = join(CONTENT_DIR, cat);
    if (existsSync(catDir)) {
      for (const file of readdirSync(catDir)) {
        if (file.startsWith('_') || extname(file) !== '.json') continue;
        const slug = file.replace('.json', '');
        routes.push(`/${cat}/${slug}`);
      }
    }
  }

  // Comparisons
  const compDir = join(CONTENT_DIR, 'comparisons');
  if (existsSync(compDir)) {
    for (const file of readdirSync(compDir)) {
      if (extname(file) !== '.json') continue;
      routes.push(`/compare/${file.replace('.json', '')}`);
    }
  }

  // Public pages — only indexable pages (skip Disallow'd pages from robots.txt)
  const publicPages = [
    '/About', '/Privacy', '/Terms', '/Accessibility',
    '/patur-vs-murshe', '/open-osek-patur',
    '/blog/logo-leasek', '/blog/kartis-bikur-digitali', '/blog/daf-nchita',
    '/blog/matzget-iskit', '/blog/matzget-mashkiim', '/blog/sticker-leasek',
  ];
  routes.push(...publicPages);

  return routes;
}

// Simple static file server for the dist directory
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
      let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

      // SPA fallback — serve index.html for any route without a file extension
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

async function prerender() {
  const routes = discoverRoutes();
  console.log(`\n🔍 Found ${routes.length} routes to prerender:\n`);
  routes.forEach(r => console.log(`  ${r}`));

  // Check dist exists
  if (!existsSync(DIST_DIR)) {
    console.error('\n❌ dist/ directory not found. Run `npm run build` first.\n');
    process.exit(1);
  }

  const PORT = 4173;
  const server = await startServer(PORT);
  console.log(`\n🌐 Local server running on port ${PORT}`);

  // Use locally installed Chrome/Edge
  const executablePath = process.env.CHROME_PATH
    || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  let successCount = 0;
  let failCount = 0;

  for (const route of routes) {
    try {
      const page = await browser.newPage();

      // Block unnecessary resources for speed
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const type = req.resourceType();
        if (['image', 'media', 'font'].includes(type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      const url = `http://localhost:${PORT}${route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

      // Wait for React content to render
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.children.length > 0;
        },
        { timeout: 30000 }
      );

      // Give extra time for Helmet to update meta tags and content to load
      await new Promise(r => setTimeout(r, 3000));

      // Get the full rendered HTML
      let html = await page.content();

      // Add prerender meta tag so we know this page was prerendered
      html = html.replace('<head>', '<head>\n    <meta name="prerender-status" content="200">');

      // Fix canonical URL to be page-specific
      const canonicalUrl = `${BASE_URL}${route === '/' ? '' : route}`;
      html = html.replace(
        /<link[^>]*rel="canonical"[^>]*>/,
        `<link rel="canonical" href="${canonicalUrl}" />`
      );

      // Ensure og:url matches the page
      html = html.replace(
        /<meta[^>]*property="og:url"[^>]*>/,
        `<meta property="og:url" content="${canonicalUrl}" />`
      );

      // Write the prerendered HTML
      const outputDir = route === '/'
        ? DIST_DIR
        : join(DIST_DIR, ...route.split('/').filter(Boolean));

      mkdirSync(outputDir, { recursive: true });
      const outputFile = join(outputDir, 'index.html');
      writeFileSync(outputFile, html, 'utf-8');

      successCount++;
      console.log(`  ✅ ${route} → ${outputFile.replace(DIST_DIR, 'dist')}`);

      await page.close();
    } catch (err) {
      failCount++;
      console.error(`  ❌ ${route} — ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  console.log(`\n📊 Prerender complete: ${successCount} succeeded, ${failCount} failed`);
  console.log(`📁 Output: ${DIST_DIR}\n`);

  if (failCount > 0) process.exit(1);
}

prerender().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});

/**
 * Static HTML Generator for SEO
 * Generates static HTML pages from JSON content — NO browser needed.
 * Works on Vercel, Netlify, GitHub Actions — anywhere Node.js runs.
 *
 * Each generated page includes:
 * - Unique <title>, <meta description>, <canonical>
 * - Open Graph + Twitter Card tags
 * - JSON-LD Schema (Article, FAQ, BreadcrumbList, Organization)
 * - The actual article content as readable HTML
 * - React app script that hydrates on top for interactivity
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST_DIR = resolve(__dirname, '../dist');
const CONTENT_DIR = resolve(__dirname, '../src/content');
const BASE_URL = 'https://perfect-dashboard.com';
const BRAND = 'פרפקט וואן';

// Read the base index.html from dist
function getBaseHtml() {
  return readFileSync(join(DIST_DIR, 'index.html'), 'utf-8');
}

// Discover all portal routes from content JSON files
function discoverRoutes() {
  const routes = [];
  const categories = ['osek-patur', 'osek-murshe', 'hevra-bam', 'sgirat-tikim', 'guides'];

  for (const cat of categories) {
    // Category hub page
    const catFile = join(CONTENT_DIR, cat, '_category.json');
    if (existsSync(catFile)) {
      const catData = JSON.parse(readFileSync(catFile, 'utf-8'));
      routes.push({
        path: `/${cat}`,
        type: 'category',
        data: catData,
        category: cat
      });
    }

    // Article pages
    const catDir = join(CONTENT_DIR, cat);
    if (existsSync(catDir)) {
      for (const file of readdirSync(catDir)) {
        if (file.startsWith('_') || extname(file) !== '.json') continue;
        const slug = file.replace('.json', '');
        const data = JSON.parse(readFileSync(join(catDir, file), 'utf-8'));
        routes.push({
          path: `/${cat}/${slug}`,
          type: 'article',
          data,
          category: cat
        });
      }
    }
  }

  // Comparison pages
  const compDir = join(CONTENT_DIR, 'comparisons');
  if (existsSync(compDir)) {
    for (const file of readdirSync(compDir)) {
      if (extname(file) !== '.json') continue;
      const data = JSON.parse(readFileSync(join(compDir, file), 'utf-8'));
      routes.push({
        path: `/compare/${file.replace('.json', '')}`,
        type: 'comparison',
        data,
        category: 'comparisons'
      });
    }
  }

  return routes;
}

// Generate SEO meta tags
function generateMetaTags(route) {
  const { data, path } = route;
  const url = `${BASE_URL}${path}`;

  const title = data.metaTitle || data.heroTitle || data.title || BRAND;
  const description = data.metaDescription || data.description || '';
  const keywords = (data.keywords || []).join(', ');

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="he_IL" />
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:image" content="${BASE_URL}/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
  `;
}

// Generate JSON-LD Schema
function generateSchema(route) {
  const { data, path, type } = route;
  const url = `${BASE_URL}${path}`;
  const schemas = [];

  // BreadcrumbList
  const breadcrumbs = [{ name: 'דף הבית', url: BASE_URL }];
  if (route.category && route.category !== 'comparisons') {
    const catNames = {
      'osek-patur': 'עוסק פטור',
      'osek-murshe': 'עוסק מורשה',
      'hevra-bam': 'חברה בע"מ',
      'sgirat-tikim': 'סגירת תיקים',
      'guides': 'מדריכים'
    };
    breadcrumbs.push({ name: catNames[route.category] || route.category, url: `${BASE_URL}/${route.category}` });
  }
  if (type === 'article' || type === 'comparison') {
    breadcrumbs.push({ name: data.heroTitle || data.title || '', url });
  }

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((bc, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: bc.name,
      item: bc.url
    }))
  });

  // Article schema
  if (type === 'article' && data.sections) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data.heroTitle || data.metaTitle || '',
      description: data.metaDescription || '',
      datePublished: data.publishDate || '',
      dateModified: data.updatedDate || data.publishDate || '',
      author: {
        '@type': 'Person',
        name: data.author?.name || BRAND
      },
      publisher: {
        '@type': 'Organization',
        name: BRAND,
        url: BASE_URL
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url }
    });
  }

  // FAQ schema
  const faqSection = data.sections?.find(s => s.type === 'faq');
  const faqItems = faqSection?.items || data.faq;
  if (faqItems?.length) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    });
  }

  return schemas.map(s =>
    `<script type="application/ld+json">${JSON.stringify(s)}</script>`
  ).join('\n    ');
}

// Generate readable HTML content from article sections
function generateContent(route) {
  const { data, type } = route;
  if (type === 'category') {
    return generateCategoryContent(data);
  }

  const sections = data.sections || [];
  let html = '';

  if (data.heroTitle) {
    html += `<h1>${escapeHtml(data.heroTitle)}</h1>\n`;
  }
  if (data.heroSubtitle) {
    html += `<p>${escapeHtml(data.heroSubtitle)}</p>\n`;
  }

  for (const section of sections) {
    switch (section.type) {
      case 'text':
        html += `<h2>${escapeHtml(section.title || '')}</h2>\n`;
        html += `<div>${formatContent(section.content || '')}</div>\n`;
        break;

      case 'list':
        html += `<h2>${escapeHtml(section.title || '')}</h2>\n`;
        if (section.description) html += `<p>${escapeHtml(section.description)}</p>\n`;
        html += '<ul>\n';
        for (const item of (section.items || [])) {
          html += `  <li><strong>${escapeHtml(item.title || '')}</strong>: ${escapeHtml(item.description || '')}</li>\n`;
        }
        html += '</ul>\n';
        break;

      case 'steps':
        html += `<h2>${escapeHtml(section.title || '')}</h2>\n`;
        html += '<ol>\n';
        for (const step of (section.steps || [])) {
          html += `  <li><strong>${escapeHtml(step.title || '')}</strong>: ${escapeHtml(step.description || '')}</li>\n`;
        }
        html += '</ol>\n';
        break;

      case 'faq':
        html += `<h2>${escapeHtml(section.title || '')}</h2>\n`;
        for (const item of (section.items || [])) {
          html += `<h3>${escapeHtml(item.question)}</h3>\n`;
          html += `<p>${escapeHtml(item.answer)}</p>\n`;
        }
        break;

      case 'callout':
        html += `<aside><strong>${escapeHtml(section.title || '')}</strong>: ${escapeHtml(section.content || '')}</aside>\n`;
        break;

      case 'cta-inline':
        html += `<div><strong>${escapeHtml(section.title || '')}</strong> — ${escapeHtml(section.description || '')}</div>\n`;
        break;
    }
  }

  return html;
}

function generateCategoryContent(data) {
  let html = `<h1>${escapeHtml(data.title || '')}</h1>\n`;
  html += `<p>${escapeHtml(data.description || '')}</p>\n`;

  if (data.subcategories?.length) {
    html += '<h2>נושאים</h2>\n<ul>\n';
    for (const sub of data.subcategories) {
      html += `  <li>${escapeHtml(sub.title)}</li>\n`;
    }
    html += '</ul>\n';
  }

  if (data.articles?.length) {
    html += '<h2>מאמרים</h2>\n<ul>\n';
    for (const article of data.articles) {
      html += `  <li>${escapeHtml(article.title)}</li>\n`;
    }
    html += '</ul>\n';
  }

  if (data.faq?.length) {
    html += '<h2>שאלות נפוצות</h2>\n';
    for (const item of data.faq) {
      html += `<h3>${escapeHtml(item.question)}</h3>\n`;
      html += `<p>${escapeHtml(item.answer)}</p>\n`;
    }
  }

  return html;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatContent(text) {
  return escapeHtml(text).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
}

// Main: inject SEO content into each page's HTML
function generate() {
  const routes = discoverRoutes();
  console.log(`\n📄 Generating static HTML for ${routes.length} portal pages:\n`);

  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ not found. Run `vite build` first.');
    process.exit(1);
  }

  const baseHtml = getBaseHtml();
  let count = 0;

  for (const route of routes) {
    const metaTags = generateMetaTags(route);
    const schemas = generateSchema(route);
    const content = generateContent(route);

    // Start with base HTML
    let html = baseHtml;

    // Replace <title> and meta tags in <head>
    html = html.replace(/<title>.*?<\/title>/, '');
    html = html.replace(/<meta name="description"[^>]*>/, '');
    html = html.replace(/<meta name="keywords"[^>]*>/, '');
    html = html.replace(/<link rel="canonical"[^>]*>/, '');
    html = html.replace(/<meta property="og:title"[^>]*>/, '');
    html = html.replace(/<meta property="og:description"[^>]*>/, '');
    html = html.replace(/<meta property="og:url"[^>]*>/, '');
    html = html.replace(/<meta property="og:site_name"[^>]*>/, '');
    html = html.replace(/<meta name="twitter:title"[^>]*>/, '');
    html = html.replace(/<meta name="twitter:description"[^>]*>/, '');

    // Inject new meta tags after <head>
    html = html.replace('<head>', `<head>\n    <meta name="prerender-status" content="200">\n    ${metaTags}`);

    // Inject schemas before </head>
    html = html.replace('</head>', `    ${schemas}\n  </head>`);

    // Inject content inside #root for SEO (React will hydrate over this)
    html = html.replace(
      '<div id="root"></div>',
      `<div id="root"><div dir="rtl" class="portal-root" style="font-family:Heebo,sans-serif">\n${content}\n</div></div>`
    );

    // Write the file
    const outputDir = join(DIST_DIR, ...route.path.split('/').filter(Boolean));
    mkdirSync(outputDir, { recursive: true });
    const outputFile = join(outputDir, 'index.html');
    writeFileSync(outputFile, html, 'utf-8');

    count++;
    console.log(`  ✅ ${route.path}`);
  }

  console.log(`\n📊 Generated ${count} static HTML pages`);
  console.log(`📁 Output: ${DIST_DIR}\n`);
}

generate();

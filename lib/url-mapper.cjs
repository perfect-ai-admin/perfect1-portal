/**
 * URL/path mapping helpers — single source for category→URL conversion logic.
 * Replaces 3+ duplicated copies that were in scripts/.
 */
const path = require('path');
const { CATEGORY_URL_MAP, SITE_URL, CONTENT_DIR_REL } = require('../config/site.config.cjs');

function isValidCategory(cat) {
  return !!CATEGORY_URL_MAP[cat];
}

function slugFromPath(filePath) {
  // Accepts both 'src/content/cat/slug.json' and absolute paths.
  // Returns { category, slug } or null.
  const norm = filePath.replace(/\\/g, '/');
  const idx = norm.indexOf(CONTENT_DIR_REL);
  const trimmed = idx >= 0 ? norm.slice(idx + CONTENT_DIR_REL.length) : norm;
  const noExt = trimmed.replace(/\.json$/, '');
  const parts = noExt.split('/').filter(Boolean);
  if (parts.length !== 2) return null;
  const [category, slug] = parts;
  if (!isValidCategory(category)) return null;
  return { category, slug };
}

function fileToUrl(filePath) {
  const parts = slugFromPath(filePath);
  if (!parts) return null;
  const prefix = CATEGORY_URL_MAP[parts.category];
  return `${SITE_URL}${prefix}/${parts.slug}`;
}

function categorySlugToUrl(category, slug) {
  const prefix = CATEGORY_URL_MAP[category];
  if (!prefix) return null;
  return `${SITE_URL}${prefix}/${slug}`;
}

function listAllArticles(rootContentDir) {
  // Filesystem scan for all article files, mapping to {category, slug, url}.
  // Caller passes absolute path to src/content.
  const fs = require('fs');
  const out = [];
  for (const cat of fs.readdirSync(rootContentDir)) {
    const dir = path.join(rootContentDir, cat);
    let stat;
    try { stat = fs.statSync(dir); } catch { continue; }
    if (!stat.isDirectory()) continue;
    if (!isValidCategory(cat)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith('_') || !f.endsWith('.json')) continue;
      const slug = f.replace('.json', '');
      const url = categorySlugToUrl(cat, slug);
      if (url) out.push({ category: cat, slug, url });
    }
  }
  return out;
}

module.exports = {
  isValidCategory,
  slugFromPath,
  fileToUrl,
  categorySlugToUrl,
  listAllArticles,
};

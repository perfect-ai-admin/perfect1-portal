/**
 * One-shot: backfill FAQ for all articles missing the `faq` field.
 *
 * Reads each article missing FAQ, calls AI provider for 5 Q&A,
 * writes back to JSON, then commits everything via GitHub API tree.
 *
 * Refactored to use lib/* and config/site.config.cjs.
 *
 * Run: ANTHROPIC_API_KEY=... GH_TOKEN=... node scripts/backfill-faq.cjs
 */
const fs = require('fs');
const path = require('path');

const { generateArticle } = require('../lib/ai-provider.cjs');
const gh = require('../lib/github-client.cjs');
const { RATE_LIMIT_MS } = require('../config/site.config.cjs');
const log = require('../lib/logger.cjs').create('backfill-faq');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src/content');

if (!process.env.ANTHROPIC_API_KEY) { log.error('Set ANTHROPIC_API_KEY'); process.exit(1); }
if (!process.env.GH_TOKEN) { log.error('Set GH_TOKEN'); process.exit(1); }

function buildPrompt(article) {
  const title = article.heroTitle || article.metaTitle || '';
  const desc = article.metaDescription || article.heroSubtitle || '';
  const cat = article.category || '';
  const sectionsPreview = (article.sections || [])
    .slice(0, 3)
    .map(s => `${s.title}: ${(s.content||'').slice(0,200)}`)
    .join('\n');

  return `אתה כותב SEO לפורטל עוסקים ועסקים בישראל.

המאמר:
כותרת: ${title}
תיאור: ${desc}
קטגוריה: ${cat}

תוכן (פתיחה):
${sectionsPreview}

צור 5 שאלות FAQ שאנשים מחפשים בגוגל בנושא הזה. התשובות יהיו 50-70 מילים בעברית, ברורות וישירות.

החזר ONLY JSON array (ללא markdown, ללא הסבר):
[
  {"question": "כמה עולה ...?", "answer": "..."},
  {"question": "האם צריך ...?", "answer": "..."},
  {"question": "כמה זמן לוקח ...?", "answer": "..."},
  {"question": "מה קורה אם ...?", "answer": "..."},
  {"question": "האם אפשר לבד ...?", "answer": "..."}
]`;
}

async function main() {
  // Find articles without FAQ
  const targets = [];
  for (const cat of fs.readdirSync(CONTENT_DIR)) {
    const dir = path.join(CONTENT_DIR, cat);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.startsWith('_') || !f.endsWith('.json')) continue;
      const p = path.join(dir, f);
      try {
        const a = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (!a.faq || a.faq.length === 0) {
          targets.push({ category: cat, file: p, slug: f.replace('.json','') });
        }
      } catch {}
    }
  }
  log.info('targets', { count: targets.length });
  if (targets.length === 0) return;

  const updated = [];
  let i = 0;
  for (const t of targets) {
    i++;
    try {
      const article = JSON.parse(fs.readFileSync(t.file, 'utf-8'));
      const prompt = buildPrompt(article);
      const text = await generateArticle({
        prompt,
        maxTokens: 1500,
        model: 'claude-haiku-4-5-20251001', // cheap for FAQ generation
      });
      const jsonMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const faq = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(faq) || faq.length < 3) throw new Error('FAQ too short');

      article.faq = faq;
      fs.writeFileSync(t.file, JSON.stringify(article, null, 2) + '\n', 'utf-8');
      updated.push({
        path: `src/content/${t.category}/${t.slug}.json`,
        content: JSON.stringify(article, null, 2) + '\n',
      });
      log.info('faq added', { i, total: targets.length, cat: t.category, slug: t.slug, q: faq.length });
    } catch (e) {
      log.error('faq failed', { i, total: targets.length, cat: t.category, slug: t.slug, msg: e.message.slice(0,80) });
    }
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS.anthropic));
  }

  log.info('updated articles', { count: updated.length });
  if (updated.length === 0) return;

  log.info('committing batch...');
  const sha = await gh.commitBatch({
    files: updated,
    message: `SEO: backfill FAQ for ${updated.length} articles — FAQPage schema + AEO optimization`,
  });
  log.info('committed', { sha: sha.slice(0,10) });
}

main().catch(e => {
  log.error('fatal', { msg: e.message });
  process.exit(1);
});

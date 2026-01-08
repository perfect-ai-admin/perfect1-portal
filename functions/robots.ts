
/**
 * Robots.txt דינמי - מותאם לקידום SEO ותמיכה ב-AI Bots
 * מאפשר סריקה מלאה לכל הבוטים כולל GPTBot, Claude-Web וכו'
 */
export default async function robots(event, context) {
  const robotsTxt = `# Robots.txt - Perfect One
# מעודכן לתמיכה ב-SEO, GEO, AEO ו-LLM-readiness

# הרשאה כללית לכל הבוטים
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /*.json$

# הרשאות מיוחדות לבוטים של AI/LLM
# OpenAI GPTBot - ChatGPT
User-agent: GPTBot
Allow: /

# OpenAI SearchBot - ChatGPT Search
User-agent: OAI-SearchBot
Allow: /

# Anthropic Claude
User-agent: Claude-Web
Allow: /

# Google Bard/Gemini
User-agent: Google-Extended
Allow: /

# Common Crawl (used by many AI models)
User-agent: CCBot
Allow: /

# Perplexity AI
User-agent: PerplexityBot
Allow: /

# Bing AI
User-agent: Bingbot
Allow: /

# הרשאות למנועי חיפוש עיקריים
User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Mobile
Allow: /

# Sitemap locations
Sitemap: https://perfect1.co.il/sitemap-index
Sitemap: https://perfect1.co.il/sitemap-pages
Sitemap: https://perfect1.co.il/sitemap-articles
Sitemap: https://perfect1.co.il/sitemap-faq

# Crawl-delay (אופציונלי - רק אם יש בעיות עומס)
# User-agent: *
# Crawl-delay: 1

# הערות:
# - כל התוכן הציבורי פתוח לסריקה
# - תמיכה מלאה ב-AI bots לשיפור נראות ב-LLMs
# - API ודפי אדמין חסומים
`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    },
    body: robotsTxt
  };
}

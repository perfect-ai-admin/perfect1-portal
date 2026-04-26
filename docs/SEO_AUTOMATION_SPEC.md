# אפיון מערכת SEO אוטומטית מקצה לקצה

> **מסמך זה הוא prompt/אפיון מלא להעתקת המערכת שנבנתה ב-perfect1.co.il לאתר חדש.**
> תן את כולו ל-Claude Code / מפתח / agent — והם יבנו לך את אותה מערכת בדיוק.

---

## 🎯 המטרה העסקית

לבנות מערכת SEO אוטומטית לאתר תוכן (בלוג / פורטל / מגזין) שעושה את הדברים הבאים **לבד, יומיומית, ללא התערבות אנושית:**

1. מזהה הזדמנויות SEO מ-Google Search Console (עמודים שכמעט בעמוד 1, ביטויים עם תנועה אבל CTR נמוך)
2. מייצר רעיונות למאמרים חדשים שיחזקו את האתר
3. כותב מאמרים שלמים ב-Claude Opus לפי תבנית קבועה (1500-2000 מילים, 8-10 sections, FAQ, schema)
4. מסנן איכות (Quality Gate ≥85/100) — מאמר חלש לא עולה
5. מפרסם אוטומטית ל-GitHub (commit) → Vercel deploy → Live
6. מאמת שהדף עלה לאתר (Live URL Verify)
7. שולח לבעלים מייל סיכום יומי עם המאמר שעלה
8. מודיע ל-Google + Bing + Yandex על המאמר החדש (IndexNow + Indexing API)
9. עוקב יומית מי באינדקס Google, ומתריע במייל אם משהו לא נכנס תוך 48 שעות
10. אופציה ל-bulk push של כל המאמרים הקיימים שעוד לא באינדקס

---

## 🏗️ ארכיטקטורה — מה צריך

### תשתית

| רכיב | שירות | תפקיד |
|---|---|---|
| **Frontend** | React + Vite (SPA) | האתר עצמו |
| **Hosting** | Vercel | Static hosting + serverless |
| **Repo** | GitHub | מקור קוד + trigger ל-deploys |
| **Database** | Supabase Postgres | מעקב SEO data + ideas + published articles |
| **AI Writer** | Claude Opus (`claude-opus-4-7`) | כתיבת מאמרים |
| **AI Helper** | Claude Haiku | משימות זולות (FAQ generation, summaries) |
| **Workflow Engine** | n8n (cloud או self-hosted) | תזמון יומי + orchestration |
| **Email** | Supabase Edge Function `sendEmail` (פנימי) או Resend | שליחת מיילים |
| **GSC** | Google Search Console + Indexing API + URL Inspection API | אינדקס + נתונים |

### Environment & Secrets נדרשים

**ב-GitHub Secrets:**
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON של service account עם הרשאות Indexing + Webmasters
- `SUPABASE_SERVICE_KEY` — service_role key (לא anon)
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
- (אופציונלי) `RESEND_API_KEY` אם לא משתמשים ב-Supabase Edge Function

**ב-n8n credentials:**
- `Anthropic API` — `x-api-key` של Claude
- `Postgres` — חיבור ל-Supabase
- `GitHub API` — Bearer token עם scope `repo` + `workflow`

---

## 📂 מבנה תוכן

```
src/content/
  {category}/
    _category.json       # meta של הקטגוריה
    {slug}.json          # כל מאמר = JSON אחד
```

### תבנית JSON של מאמר (קבועה!):

```json
{
  "slug": "my-article",
  "category": "category-name",
  "metaTitle": "כותרת SEO עד 60 תווים | מותג",
  "metaDescription": "תיאור עם CTA, 140-155 תווים",
  "keywords": ["20-30 וריאציות", "ביטויים ראשי + משני + long-tail"],
  "heroTitle": "H1",
  "heroSubtitle": "משפט תומך",
  "publishDate": "2026-04-25",
  "updatedDate": "2026-04-25",
  "author": { "name": "צוות [המותג שלך]", "role": "מומחי תחום" },
  "readTime": 10,
  "toc": [{"id": "section-id", "title": "..."}],
  "sections": [
    {
      "id": "section-id",
      "type": "text|list|steps|callout|comparison|cta-inline",
      "title": "H2",
      "answerBlock": "תשובה ישירה 40-70 מילים (Featured Snippet)",
      "content": "180-250 מילים בעברית טבעית"
    }
  ],
  "faq": [{"question": "...", "answer": "40-80 מילים"}],
  "relatedArticles": [{"category": "...", "slug": "...", "title": "..."}]
}
```

**סוגי sections חובה:**
- `what-is` (מה זה)
- `how-to-steps` (איך עושים)
- `cost` (עלות)
- `timing` (זמנים)
- `pros-cons` (יתרונות/חסרונות)
- `common-mistakes` (טעויות נפוצות)
- `who-is-it-for` (למי מתאים)
- `tips` (טיפים)

---

## 🗄️ סכמת DB (Supabase)

### טבלאות

```sql
-- 1. Search Console daily snapshots
CREATE TABLE seo_pages_daily (
  id BIGSERIAL PRIMARY KEY,
  page_url TEXT, date DATE,
  clicks INT, impressions INT, ctr FLOAT, avg_position FLOAT,
  CONSTRAINT seo_pages_daily_unique UNIQUE (page_url, date)
);

CREATE TABLE seo_queries_daily (
  id BIGSERIAL PRIMARY KEY,
  page_url TEXT, query TEXT, date DATE,
  clicks INT, impressions INT, ctr FLOAT, avg_position FLOAT,
  CONSTRAINT seo_queries_daily_unique UNIQUE (page_url, query, date)
);

-- 2. SEO opportunities (auto-detected from GSC data)
CREATE TABLE seo_opportunities (
  id BIGSERIAL PRIMARY KEY,
  opportunity_type TEXT,  -- 'rising_page'|'near_page_one'|'high_imp_low_ctr'|'commercial_intent'
  page_url TEXT, query TEXT,
  avg_position FLOAT, impressions INT, ctr FLOAT,
  priority_score INT,
  status TEXT DEFAULT 'new',  -- 'new'|'reviewed'|'dismissed'
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Article ideas (Claude-generated from opportunities)
CREATE TABLE seo_content_ideas (
  id BIGSERIAL PRIMARY KEY,
  opportunity_id INT REFERENCES seo_opportunities(id),
  parent_page_url TEXT,
  source_page_url TEXT,
  target_query TEXT,
  suggested_article_title TEXT,
  search_intent TEXT,  -- 'informational'|'commercial'|'transactional'
  suggested_angle TEXT,
  why_it_matters TEXT,
  internal_links_json JSONB,
  priority_score INT,
  status TEXT DEFAULT 'new',  -- 'new'|'published'|'dismissed'|'needs_revision'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Published articles tracking
CREATE TABLE seo_published_articles (
  id BIGSERIAL PRIMARY KEY,
  idea_id BIGINT REFERENCES seo_content_ideas(id),
  category TEXT, slug TEXT, title TEXT,
  file_path TEXT, git_commit_sha TEXT,
  word_count INT,
  indexed_at TIMESTAMPTZ,                -- מתי GSC אישר אינדקס
  last_indexation_check TIMESTAMPTZ,
  coverage_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, slug)
);

-- 5. Workflow runs log
CREATE TABLE seo_runs (
  id BIGSERIAL PRIMARY KEY,
  run_type TEXT,  -- 'gsc_sync'|'opportunities'|'content_ideas'|'article_writer'|'indexation_check'
  status TEXT DEFAULT 'running',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  notes TEXT
);
```

### RPC חובה

```sql
-- Pick top N unpublished ideas (respecting daily limit)
CREATE FUNCTION get_seo_ideas_to_publish(max_per_day INT DEFAULT 3)
RETURNS JSONB AS $$
DECLARE published_today INT; available_slots INT; result JSONB;
BEGIN
  SELECT COUNT(*) INTO published_today FROM seo_published_articles
    WHERE created_at >= CURRENT_DATE;
  available_slots := max_per_day - published_today;
  IF available_slots <= 0 THEN
    RETURN jsonb_build_object('available_slots', 0, 'ideas', '[]'::jsonb);
  END IF;
  WITH picked AS (
    SELECT i.* FROM seo_content_ideas i
    WHERE i.status = 'new'
      AND NOT EXISTS (SELECT 1 FROM seo_published_articles pa WHERE pa.idea_id = i.id)
    ORDER BY i.priority_score DESC, i.created_at DESC
    LIMIT available_slots
  )
  SELECT jsonb_build_object('available_slots', available_slots, 'ideas',
    COALESCE(jsonb_agg(row_to_json(picked)), '[]'::jsonb)) INTO result FROM picked;
  RETURN result;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark idea as published
CREATE FUNCTION mark_seo_idea_published(p_idea_id BIGINT, p_category TEXT, p_slug TEXT,
  p_title TEXT, p_file_path TEXT, p_git_sha TEXT, p_word_count INT) RETURNS BIGINT AS $$
DECLARE new_id BIGINT;
BEGIN
  INSERT INTO seo_published_articles (idea_id, category, slug, title, file_path, git_commit_sha, word_count)
  VALUES (p_idea_id, p_category, p_slug, p_title, p_file_path, p_git_sha, p_word_count)
  RETURNING id INTO new_id;
  UPDATE seo_content_ideas SET status='published' WHERE id = p_idea_id;
  RETURN new_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔄 n8n Workflows (5 workflows)

### WF1 — GSC Daily Sync (cron `0 0 5 * * *` = 08:00 ישראל)
1. OAuth ל-Google Search Console
2. שאילתה: top 100 pages + top 1000 queries מ-28 הימים האחרונים
3. UPSERT ל-`seo_pages_daily` + `seo_queries_daily`
4. Log run

### WF2 — Opportunities Detection (cron `0 0 6 * * *`)
מזהה 5 סוגי הזדמנויות:
- `rising_page` — עמודים שעלו 30%+ ב-impressions/clicks
- `near_page_one` — עמודים בעמדות 11-20 (כמעט עמוד 1)
- `high_imp_low_ctr` — >100 impressions + CTR < 2%
- `cluster_traction` — מילות מפתח שמתאגדות סביב נושא
- `commercial_intent` — שאילתות עם "מחיר", "עלות", "השוואה"

לכל הזדמנות: priority_score 0-100. הוספה ל-`seo_opportunities`.

### WF3 — Content Ideas Generator (cron `0 0 8 * * *` = 10:00 ישראל)
1. SELECT 10 הזדמנויות עם priority_score הגבוה ביותר (status=new)
2. לכל אחת — שולח ל-Claude prompt בערבית לייצור 2-3 רעיונות (target_query, suggested_title, suggested_angle, why_it_matters)
3. INSERT ל-`seo_content_ideas` (status=new)
4. עדכון `seo_opportunities` ל-status=reviewed
5. בסוף — מפעיל WF4

### WF4 — Article Writer & Publisher (מופעל מ-WF3 או cron `0 0 9 * * *` = 11:00 ישראל)
**זה הלב של המערכת.** 11+ nodes:

1. **Schedule** או **Webhook** trigger
2. **Log Run Start** → Postgres INSERT seo_runs
3. **Fetch Ideas to Publish** → POST ל-RPC `get_seo_ideas_to_publish` (מחזיר עד 3)
4. **Has Slots?** → IF available_slots > 0
5. **Split Ideas** → split out
6. **Build Article Prompt** → Code node שבונה prompt מלא בעברית עם:
   - תבנית מלאה של JSON
   - דרישות חובה (8-10 sections, 1200-2000 מילים, 5-10 FAQ, 20+ keywords)
   - **Priority hubs חובה** (2+ קישורים מתוך רשימה קבועה — flagship pages)
   - Author קבוע, publishDate=TODAY
7. **Call Claude (Opus)** → httpRequest POST `https://api.anthropic.com/v1/messages` עם cred Anthropic API
8. **Parse Article JSON** → Code node שמחלץ JSON, אוכף author + dates בקוד
9. **Quality Gate** → Code node שמחשב ציון 0-100:
   - SEO (40 נק'): meta lengths, word count ≥1200, ≥8 sections, TOC
   - AEO (30 נק'): ≥5 FAQ, answer length 30-120, answerBlock present
   - GEO (30 נק'): entities mentioned, ≥8 numbers, author exact match
10. **Gate Switch** (Switch node — לא IF! IF נוטה להיות באגי בn8n) → output 0=passed (≥85), output 1=failed
    - **failed** → Log Gate Failure, status=needs_revision
11. **GitHub Create File** → PUT ל-`api.github.com/repos/{owner}/{repo}/contents/{path}` עם base64 content + GitHub token
12. **Wait for Deploy** → Wait node, 4 minutes (Vercel build time)
13. **Verify Live URL** → httpRequest GET עם browser User-Agent
14. **QA Result** → Code node שמחשב: `live = (size > 20000)`
15. **Mark as Published** → POST ל-RPC `mark_seo_idea_published`
16. **Log Run Success** → Postgres UPDATE seo_runs

### WF5 — Daily Email Summary (cron `0 30 8 * * *` = 11:30 ישראל)
1. SELECT מאמרים שפורסמו היום מ-`seo_published_articles`
2. אופציונלי: GA4 metrics לאתמול
3. בנה HTML עם:
   - מאמרים שעלו היום (כותרת + URL חי)
   - Quality Gate scores
   - GSC summary (כניסות, ביטויים חדשים)
4. שלח דרך Supabase Edge Function `sendEmail` או Resend

---

## 📜 GitHub Actions Workflows

### `.github/workflows/deploy.yml` — On push to main
```yaml
- Build (Vite)
- Generate static HTML for each article (prerender)
  - Inject Article schema (BlogPosting + author + dates)
  - Inject FAQPage schema from article.faq[]
  - Inject BreadcrumbList
  - Inject Organization schema (every page)
  - Strip duplicate title/description from index.html
- Generate sitemap.xml from src/content/
- Deploy to Vercel
- Notify Google Indexing API (URL_UPDATED for changed files)
- Notify IndexNow (Bing/Yandex)
- Submit Sitemap to GSC
```

### `.github/workflows/check-indexation.yml` — Cron `0 9 * * *`
- מריץ `scripts/check-indexation-status.cjs`
- בודק כל מאמר 14 ימים אחרונים מול GSC URL Inspection
- אם 48+ שעות ועדיין לא באינדקס → שולח מייל אלרט

### `.github/workflows/bulk-indexing.yml` — workflow_dispatch
- Manual trigger
- מריץ `scripts/bulk-request-indexing.cjs`
- שולח את כל המאמרים שעוד לא באינדקס לכל ה-APIs

---

## 🔧 Scripts נדרשים

### `scripts/notify-google-indexing.cjs`
- קורא git diff HEAD~1 HEAD
- מסנן רק `src/content/*.json` שהשתנה
- ממפה לURL לפי category mapping
- POST ל-`indexing.googleapis.com/v3/urlNotifications:publish` עם `URL_UPDATED`

### `scripts/notify-indexnow.cjs`
- אותו עיקרון
- POST ל-`api.indexnow.org/indexnow` עם key + urlList
- צריך key file ב-`public/{key}.txt` לאימות

### `scripts/submit-sitemap-gsc.cjs`
- PUT ל-`webmasters.googleapis.com/sites/{siteUrl}/sitemaps/{feedpath}`
- אומר לGoogle לרענן sitemap

### `scripts/check-indexation-status.cjs`
- SELECT מאמרים שנוצרו ב-14 ימים אחרונים
- לכל אחד: POST ל-`searchconsole.googleapis.com/v1/urlInspection/index:inspect`
- UPDATE ב-DB: `indexed_at`, `coverage_state`, `last_indexation_check`
- אם 48+ שעות + לא indexed → אוסף לרשימת אלרט
- שולח HTML email דרך sendEmail edge function

### `scripts/bulk-request-indexing.cjs`
- One-shot: סורק את כל src/content/
- מסנן את אלה שכבר indexed_at != null
- שולח לGoogle Indexing API + IndexNow + Sitemap submit
- שולח מייל סיכום

### `scripts/generate-sitemap.js` (build-time, prebuild)
- סורק src/content/{category}/*.json
- בונה sitemap.xml עם <lastmod> מ-updatedDate
- כותב ל-public/sitemap.xml

### `scripts/generate-static.js` (build-time)
- סורק src/content/
- לכל מאמר: generate HTML עם schema מלא + meta tags + hero image
- מזריק את ה-HTML לתוך index.html template
- שומר ב-dist/{category}/{slug}/index.html

### `scripts/backfill-faq.cjs` (one-shot)
- סורק את כל המאמרים
- אם אין `faq` → שולח לClaude Haiku עם prompt קצר
- מקבל 5 Q&A
- מעדכן את ה-JSON
- Commit batch ל-GitHub

### `scripts/fix-broken-internal-links.cjs` (one-shot)
- סורק את כל ה-relatedArticles
- אם target לא קיים → ממפה ל-priority hub או למאמר קיים בקטגוריה
- מתקן `//path` ל-`/path`
- Commit batch

---

## 🎨 SEO/AEO/GEO Best Practices להטמיע

### SEO (Google)
- ✅ metaTitle ≤60 תווים, metaDescription 140-155
- ✅ H1 יחיד = heroTitle
- ✅ ≥1200 מילים, 8+ sections
- ✅ Internal links: 3-4 relatedArticles, **חובה 2+ priority hubs**
- ✅ Schema: Article + Organization + Person + FAQPage + BreadcrumbList
- ✅ Sitemap עם <lastmod>, robots.txt clean
- ✅ Canonical URL ב-meta
- ✅ Cache headers: `immutable` על assets, `stale-while-revalidate` על תמונות

### AEO (Answer Engines — voice, featured snippets)
- ✅ `answerBlock` בכל section (40-70 מילים, תשובה ישירה)
- ✅ FAQ בסגנון "כמה עולה...", "האם צריך...", "כמה זמן..."
- ✅ FAQ answers 40-80 מילים
- ✅ TOC ברור עם ids אמיתיים
- ✅ Speakable schema (אופציונלי)

### GEO (Generative AI — ChatGPT, Perplexity, AI Overviews)
- ✅ Entity mentions (לפחות 3 פעמים): רשויות מדינה, מותגים מוכרים, מספרים קונקרטיים
- ✅ Concrete numbers: שנים, סכומים, אחוזים, ימים — ≥8 במאמר
- ✅ E-E-A-T: Organization-as-Author עם sameAs (LinkedIn, Facebook), foundingDate, knowsAbout
- ✅ דף /authors/{slug} עם bio + credentials
- ✅ updatedDate מתעדכן
- ✅ author.@type=Organization עם @id משותף בכל הסכמות

### ביצועים
- ✅ WebP על כל התמונות (96% חיסכון)
- ✅ Hero image עם `loading="eager" fetchpriority="high"` בHTML הסטטי (לא רק אחרי React hydration)
- ✅ Cache headers ב-vercel.json
- ✅ Lazy load על תמונות אחרות

### Vercel.json — חובה!
```json
{
  "cleanUrls": true,
  "redirects": [
    // SPECIFIC redirects קודם
    { "source": "/old-path", "destination": "/new-path", "permanent": true },
    // ⚠️ קריטי: הCATCHALL non-www → www חייב להיות אחרון!
    { "source": "/:path*", "has": [{"type":"host","value":"example.co.il"}], "destination": "https://www.example.co.il/:path*", "permanent": true }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    { "source": "/assets/(.*)", "headers": [{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}] },
    { "source": "/(.*\\.(?:js|css|woff2?|ttf|otf))", "headers": [{"key":"Cache-Control","value":"public, max-age=31536000, immutable"}] },
    { "source": "/(.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico))", "headers": [{"key":"Cache-Control","value":"public, max-age=604800, stale-while-revalidate=86400"}] }
  ]
}
```

---

## ⚠️ Gotchas שלמדנו בדם

1. **Vercel redirects order:** ה-catchall non-www → www חייב להיות **אחרון**. אם הוא ראשון עם regex `/(.*)`, הוא חוסם את כל ה-redirects הספציפיים שאחריו ל-www requests.

2. **SPA static gen:** מחיקת JSON ידנית מGitHub = עמוד ריק 0 בייטים באתר (לא 404!). תמיד עדכן, אל תמחק.

3. **n8n IF node לא יציב עם boolean** מ-typeVersion 2+. השתמש ב-Switch node במקום, או ב-Code node עם 2 outputs.

4. **GitHub secrets ב-CI** עלולים להכיל trailing newline. תמיד `.trim()` env vars שמכילים tokens.

5. **Google Indexing API** רשמית תומך רק ב-JobPosting/BroadcastEvent. למאמרים רגילים מחזיר OK אבל לא תמיד מטפל. **IndexNow ל-Bing הרבה יותר אמין.**

6. **GitHub token עם `repo` scope לא מספיק** לעדכון `.github/workflows/*`. צריך גם `workflow` scope.

7. **Supabase secrets ב-GitHub** מצריכים encryption עם libsodium sealed box (PyNaCl) דרך API.

8. **Claude עצלן** עם תוכן ארוך — אם תבקש 1800 מילים סתם, יחזיר 500. Prompt חייב להיות תקיף ולכלול דוגמה ל-section של 180 מילים.

9. **בלי Quality Gate אמיתי** המערכת תוציא זבל. Gate חייב לחסום דברים כמו: word count, FAQ count, author exact match.

10. **Live URL Verify הכרחי** — אחרת אתה מסתמך על ה-deploy שעובד. תמיד curl את ה-URL החי 4 דקות אחרי commit.

---

## 📦 Deliverables — מה צריך לעשות, צעד אחר צעד

### שלב 1 — תשתית (יום 1-2)
1. הקם Supabase project
2. הרץ migrations של 5 הטבלאות + RPCs
3. הקם n8n (cloud או self-hosted)
4. צור credentials: Anthropic, GitHub, Postgres, GSC
5. הקם GitHub repo + Vercel project
6. צור OAuth Google service account עם scopes: `webmasters`, `indexing`

### שלב 2 — תוכן ראשוני (יום 3-5)
7. הגדר 5-10 קטגוריות
8. כתוב 5-10 מאמרים ידנית לפי התבנית כדי שיהיה ל-AI על מה להתבסס
9. הגדר sitemap auto-generator + generate-static.js
10. בדוק שהמאמרים עולים לאוויר עם schema מלא

### שלב 3 — אוטומציה (יום 6-10)
11. בנה WF1 (GSC sync)
12. בנה WF2 (opportunities)
13. בנה WF3 (ideas) — קושר ל-Claude API
14. בנה WF4 (writer + Quality Gate + GitHub commit + Live verify)
15. בנה WF5 (daily email)
16. הוסף Indexing API + IndexNow scripts ל-deploy.yml
17. בנה check-indexation cron

### שלב 4 — אופטימיזציה (יום 11-14)
18. SEO Audit מלא: meta tags, schema, internal links
19. Cache headers ב-vercel.json
20. WebP conversion לתמונות
21. /authors/{org} page + Organization schema
22. Bulk indexing push לכל המאמרים הקיימים
23. הירשם ל-Bing Webmaster Tools

### שלב 5 — מעקב (יום 15+)
24. Daily check rolling — מי באינדקס
25. Weekly report — איזה ביטויים עלו, איפה צריך לחזק
26. תקציב Anthropic: ~$0.50/מאמר (Opus) + $0.02 (Haiku for FAQ)

---

## 💰 עלות תפעולית חודשית (הערכה)

| שירות | עלות חודשית |
|---|---|
| Vercel Pro | $20 |
| Supabase Pro | $25 |
| n8n Cloud (Starter) | $20 |
| Anthropic Claude (1 article/day) | $15-30 |
| Google Cloud (Indexing API quota) | חינם |
| Bing/IndexNow | חינם |
| **סה"כ** | **~$80-100/חודש** |

לעומת **שכר SEO writer** = $2000-5000/חודש שעושה פחות.

---

## 🚀 הוראה ל-Claude / מפתח

**אל תיצור מבנה שונה.** זה הקוד שעובד בייצור. תעקוב אחר הספק הזה צעד צעד.

**אל תמציא כללים.** ה-Quality Gate, ה-prompt structure, ה-priority hubs — הכל למוד מ-A/B שעלה כסף.

**אל תקצר.** Live URL Verify, daily indexation check, sitemap auto-gen — כל אחד מהם תופס בעיה אמיתית.

**תבנה אותו דבר. בדיוק.** ואז תתקדם 100-1000+ ביטויים בגוגל בשנה הראשונה.

---

**מקור:** מערכת זו רצה בייצור ב-perfect1.co.il מאז אפריל 2026. בנויה ע"י Claude Code + מומחי SEO.

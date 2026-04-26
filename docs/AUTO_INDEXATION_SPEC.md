# אפיון: אוטומציית אינדקס Google — שכל עמוד ייכנס לאינדקס ולא ייתקע

> מסמך זה הוא אפיון ממוקד **רק** למערכת אינדקס אוטומטית. תן אותו ל-Claude Code או למפתח והם יבנו לך את אותה מערכת לאתר חדש.

---

## 🎯 מה המערכת עושה

על כל עמוד חדש שעולה לאתר, או על כל עמוד קיים שלא נכנס לאינדקס:

1. **מודיעה לכל מנועי החיפוש מיד אחרי deploy:**
   - Google Indexing API (URL_UPDATED)
   - IndexNow (Bing + Yandex + Naver + Seznam) — **תוך שעות באינדקס**
   - GSC Sitemap submit — מאלץ rescan

2. **עוקבת יומית מי באינדקס:**
   - בודקת כל עמוד דרך GSC URL Inspection API
   - שומרת `indexed_at` ב-DB
   - **שולחת מייל אלרט אם 48+ שעות עברו ועדיין לא באינדקס**

3. **Bulk push למאמרים ישנים שלא באינדקס:**
   - Workflow ידני שאפשר להפעיל בלחיצת כפתור
   - שולח את כל המאמרים שעדיין לא indexed לכל ה-APIs בבת אחת

---

## 🏗️ ארכיטקטורה

### תשתית מינימלית

| רכיב | שירות | תפקיד |
|---|---|---|
| Hosting | Vercel / Netlify / Cloudflare Pages | האתר |
| Repo | GitHub | מקור + trigger |
| CI | GitHub Actions | מריץ את ה-scripts |
| DB | Supabase Postgres | מעקב `indexed_at` של כל עמוד |
| Email | Supabase Edge Function או Resend | אלרטים |
| GSC | Google Search Console + Indexing API + URL Inspection API | האינדקס |

### Secrets נדרשים ב-GitHub

```
GOOGLE_SERVICE_ACCOUNT_KEY    # JSON של service account
SUPABASE_SERVICE_KEY          # service_role key
SUPABASE_URL                  # https://xxx.supabase.co (אופציונלי)
ALERT_EMAIL                   # למי לשלוח אלרטים
```

---

## 🔑 הקמת Google Service Account

צריך service account אחד עם 2 הרשאות:

### צעד 1 — Google Cloud Console
1. https://console.cloud.google.com/ → Create New Project (או בחר קיים)
2. APIs & Services → Library → הפעל את:
   - **Indexing API** (`indexing.googleapis.com`)
   - **Search Console API** (`searchconsole.googleapis.com`)
3. APIs & Services → Credentials → **Create Service Account**
4. תן שם (`seo-indexing-bot`)
5. Skip role assignment
6. אחרי יצירה: Keys → **Add Key → Create new key → JSON** → הורד את הקובץ

### צעד 2 — הרשאות ב-Search Console
1. https://search.google.com/search-console
2. Settings → Users and permissions → **Add user**
3. הדבק את ה-`client_email` מתוך ה-JSON (נראה כמו `seo-indexing-bot@project.iam.gserviceaccount.com`)
4. Permission: **Owner** (חובה — בלי זה Indexing API יחזיר 403)

### צעד 3 — שמירה ב-GitHub
1. תוכן ה-JSON המלא → GitHub Secrets → `GOOGLE_SERVICE_ACCOUNT_KEY`
2. ⚠️ **חשוב:** הדבק את ה-JSON בלי שום whitespace מסביב, במיוחד לא newlines בסוף

---

## 🗄️ DB Schema (Supabase)

טבלה אחת מספיקה לעקוב אחר כל עמוד:

```sql
CREATE TABLE seo_published_articles (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT,
  file_path TEXT,
  git_commit_sha TEXT,
  word_count INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Indexation tracking columns
  indexed_at TIMESTAMPTZ,                 -- מתי GSC אישר אינדקס
  last_indexation_check TIMESTAMPTZ,
  coverage_state TEXT,                    -- e.g. "Submitted and indexed"
  UNIQUE(category, slug)
);

CREATE INDEX idx_seo_indexed_at ON seo_published_articles(indexed_at);
CREATE INDEX idx_seo_check ON seo_published_articles(last_indexation_check DESC);
```

לכל פרסום של עמוד חדש, INSERT ל-DB עם `indexed_at = NULL`.

---

## 🔧 Scripts (4 קבצים)

### 1. `scripts/notify-google-indexing.cjs`

מופעל ב-CI אחרי deploy. שולח לGoogle Indexing API URL_UPDATED על כל קובץ תוכן שהשתנה ב-commit האחרון.

```javascript
const { execSync } = require('child_process');
const { google } = require('googleapis');

const SITE_URL = 'https://www.YOUR-SITE.com';
const CONTENT_DIR = 'src/content/';
const CATEGORY_URL_MAP = {
  // map your category folder names → URL prefixes
  'blog': '/blog',
  'guides': '/guides',
  // ...
};

function getChangedContentFiles() {
  try {
    const diff = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf-8' });
    return diff.split('\n')
      .filter(f => f.startsWith(CONTENT_DIR) && f.endsWith('.json'))
      .filter(f => !f.includes('_category.json'));
  } catch { return []; }
}

function fileToUrl(filePath) {
  const rel = filePath.replace(CONTENT_DIR, '').replace('.json', '');
  const [category, slug] = rel.split('/');
  const prefix = CATEGORY_URL_MAP[category];
  return prefix ? `${SITE_URL}${prefix}/${slug}` : null;
}

async function main() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });
  const client = await auth.getClient();

  const urls = getChangedContentFiles().map(fileToUrl).filter(Boolean);
  if (urls.length === 0) { console.log('No content changes'); return; }

  for (const url of urls) {
    try {
      await client.request({
        url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
        method: 'POST',
        data: { url, type: 'URL_UPDATED' },
      });
      console.log(`✓ ${url}`);
    } catch (e) {
      console.error(`✗ ${url} → ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 350)); // rate limit
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(0); });
```

### 2. `scripts/notify-indexnow.cjs`

מודיע לBing/Yandex דרך IndexNow protocol. **זה הכי מהיר** (אינדקס תוך שעות).

**צעד 1:** ייצור IndexNow key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# העתק את ה-output
```

**צעד 2:** צור קובץ verification ב-`public/{key}.txt` שמכיל את ה-key (אותו תוכן):
```
public/abc123...xyz.txt   # filename = key, content = key
```

**צעד 3:** הסקריפט עצמו:

```javascript
const { execSync } = require('child_process');
const https = require('https');

const SITE_HOST = 'www.YOUR-SITE.com';
const SITE_URL = `https://${SITE_HOST}`;
const INDEXNOW_KEY = 'YOUR_KEY_HERE'; // 32-byte hex
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const CONTENT_DIR = 'src/content/';
const CATEGORY_URL_MAP = { /* same as above */ };

function getChangedContentFiles() { /* same as above */ }
function fileToUrl(filePath) { /* same as above */ }

function postIndexNow(urls) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      host: SITE_HOST, key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION, urlList: urls,
    });
    const req = https.request({
      hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8',
                 'Content-Length': Buffer.byteLength(payload) },
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}

async function main() {
  const urls = getChangedContentFiles().map(fileToUrl).filter(Boolean);
  if (urls.length === 0) return;
  const r = await postIndexNow(urls);
  console.log(`IndexNow ${r.status} for ${urls.length} URLs`);
}

main().catch(e => { console.error(e.message); process.exit(0); });
```

### 3. `scripts/submit-sitemap-gsc.cjs`

מאלץ Google לרענן את ה-sitemap.xml אחרי deploy (אופציונלי אבל מומלץ).

```javascript
const { google } = require('googleapis');
const SITE_URL_OPTIONS = ['sc-domain:YOUR-SITE.com', 'https://www.YOUR-SITE.com/'];
const SITEMAP = 'https://www.YOUR-SITE.com/sitemap.xml';

async function main() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters'],
  });
  const webmasters = google.webmasters({ version: 'v3', auth });

  for (const siteUrl of SITE_URL_OPTIONS) {
    try {
      await webmasters.sitemaps.submit({ siteUrl, feedpath: SITEMAP });
      console.log(`✓ Sitemap submitted to ${siteUrl}`);
      return;
    } catch (e) { console.log(`  ${siteUrl} → ${e.message}`); }
  }
}

main().catch(e => { console.error(e.message); process.exit(0); });
```

### 4. `scripts/check-indexation-status.cjs`

הסקריפט הקריטי. רץ יומית (cron). בודק כל עמוד דרך GSC URL Inspection ושולח אלרט אם 48+ שעות עברו ועדיין לא באינדקס.

```javascript
const { google } = require('googleapis');
const https = require('https');

const SITE_PROPERTY = 'sc-domain:YOUR-SITE.com';
const SITE_URL = 'https://www.YOUR-SITE.com';
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://xxx.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_SERVICE_KEY || '').trim();
const ALERT_EMAIL = (process.env.ALERT_EMAIL || 'you@example.com').trim();
const ALERT_AGE_HOURS = 48;

function supabaseApi(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const u = new URL(`${SUPABASE_URL}/rest/v1${path}`);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method,
      headers: {
        apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: method === 'PATCH' ? 'return=minimal' : '',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => { try { resolve({status: res.statusCode, body: d ? JSON.parse(d) : null}); }
                            catch (e) { resolve({status: res.statusCode, body: d}); } });
    });
    req.on('error', reject); if (data) req.write(data); req.end();
  });
}

async function fetchRecentArticles() {
  const since = new Date(); since.setDate(since.getDate() - 14);
  const { body } = await supabaseApi('GET',
    `/seo_published_articles?select=id,category,slug,title,created_at,indexed_at&created_at=gte.${since.toISOString()}&order=created_at.desc`);
  return Array.isArray(body) ? body : [];
}

async function inspectUrl(searchconsole, url) {
  const r = await searchconsole.urlInspection.index.inspect({
    requestBody: { inspectionUrl: url, siteUrl: SITE_PROPERTY },
  });
  return r.data?.inspectionResult?.indexStatusResult || {};
}

async function updateArticle(id, fields) {
  await supabaseApi('PATCH', `/seo_published_articles?id=eq.${id}`, fields);
}

async function sendAlert(unindexed) {
  if (unindexed.length === 0) return;
  const html = `<div dir="rtl" style="font-family:Arial;max-width:600px;">
    <h2>⚠️ ${unindexed.length} עמודים לא באינדקס Google</h2>
    <p>פורסמו לפני 48+ שעות אך עדיין לא באינדקס:</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f5f5f5;"><th>כותרת</th><th>URL</th><th>סטטוס</th></tr>
      ${unindexed.map(u => `<tr><td>${u.title}</td><td><a href="${u.url}">${u.url}</a></td><td>${u.coverageState}</td></tr>`).join('')}
    </table>
    <p>פעולה: GSC → URL Inspection → Request Indexing</p></div>`;
  const payload = JSON.stringify({
    to: ALERT_EMAIL,
    subject: `⚠️ ${unindexed.length} עמודים לא באינדקס`,
    html, from: 'SEO Bot <no-reply@your-site.com>',
  });
  return new Promise(resolve => {
    const u = new URL(`${SUPABASE_URL}/functions/v1/sendEmail`);
    const req = https.request({
      hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload) },
    }, res => res.on('end', resolve));
    req.on('error', () => resolve());
    req.write(payload); req.end();
  });
}

async function main() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const articles = await fetchRecentArticles();
  console.log(`Checking ${articles.length} recent articles`);

  const unindexed = [];
  for (const a of articles) {
    if (a.indexed_at) continue;
    const url = `${SITE_URL}/${a.category}/${a.slug}`;
    try {
      const r = await inspectUrl(searchconsole, url);
      const isIndexed = r.verdict === 'PASS' || /indexed/i.test(r.coverageState || '');
      const ageHours = (Date.now() - new Date(a.created_at).getTime()) / 3.6e6;

      const updates = {
        last_indexation_check: new Date().toISOString(),
        coverage_state: r.coverageState || '',
      };
      if (isIndexed) updates.indexed_at = new Date().toISOString();
      else if (ageHours > ALERT_AGE_HOURS)
        unindexed.push({ ...a, url, coverageState: r.coverageState });

      await updateArticle(a.id, updates);
      console.log(`  ${isIndexed ? '✓' : '·'} ${url} | ${r.coverageState}`);
    } catch (e) {
      console.log(`  ✗ ${url} | ${e.message?.slice(0,80)}`);
    }
    await new Promise(r => setTimeout(r, 1100)); // GSC rate limit
  }

  if (unindexed.length > 0) {
    console.log(`Sending alert for ${unindexed.length} unindexed URLs`);
    await sendAlert(unindexed);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
```

### 5. (אופציונלי) `scripts/bulk-request-indexing.cjs`

One-shot script לדחוף את **כל** המאמרים שעוד לא באינדקס. שימושי אחרי הקמה ראשונית או אם נכשלו הרבה.

```javascript
// קוד דומה לcheck-indexation-status, אבל:
// 1. סורק את src/content/ (לא רק DB)
// 2. שולח לGoogle Indexing + IndexNow + Sitemap
// 3. שולח מייל סיכום
```

(תראה את הגרסה המלאה ב-`perfect1-portal/scripts/bulk-request-indexing.cjs`)

---

## 📜 GitHub Actions Workflows

### 1. `.github/workflows/deploy.yml`

הוסף את ה-3 steps הבאים בסוף קיים deploy.yml (אחרי הdeploy לVercel):

```yaml
- name: Notify Google Indexing API
  if: success()
  run: |
    npm install googleapis@latest --no-save
    node scripts/notify-google-indexing.cjs
  env:
    GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
  continue-on-error: true

- name: Notify IndexNow (Bing/Yandex)
  if: success()
  run: node scripts/notify-indexnow.cjs
  continue-on-error: true

- name: Submit Sitemap to GSC
  if: success()
  run: node scripts/submit-sitemap-gsc.cjs
  env:
    GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
  continue-on-error: true
```

### 2. `.github/workflows/check-indexation.yml` — Daily cron

```yaml
name: Daily Indexation Check

on:
  schedule:
    - cron: '0 9 * * *'  # 09:00 UTC
  workflow_dispatch:

permissions:
  contents: read

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Install
        run: npm install googleapis@latest --no-save
      - name: Check
        run: node scripts/check-indexation-status.cjs
        env:
          GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ALERT_EMAIL: you@example.com
```

### 3. `.github/workflows/bulk-indexing.yml` — Manual trigger

```yaml
name: Bulk Indexing Push (Manual)

on:
  workflow_dispatch:

jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - name: Install
        run: npm install googleapis@latest --no-save
      - name: Bulk push
        run: node scripts/bulk-request-indexing.cjs
        env:
          GOOGLE_SERVICE_ACCOUNT_KEY: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_KEY }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
          ALERT_EMAIL: you@example.com
```

---

## ⚠️ Gotchas שלמדנו בדם

1. **GitHub secrets ב-CI עלולים להכיל trailing newline** — תמיד `.trim()` env vars שמכילים tokens. אחרת `Invalid character in header content`.

2. **Google Indexing API רשמית תומך רק ב-JobPosting/BroadcastEvent.** למאמרים רגילים מחזיר OK אבל לא תמיד מטפל. לכן **חובה IndexNow במקביל** — Bing מאנדקס תוך שעות בכל מקרה.

3. **Service account חייב להיות Owner** ב-Search Console (לא Restricted ולא Full). בלי זה: 403.

4. **GitHub token עם `repo` scope לא מספיק** לעדכון `.github/workflows/*`. צריך גם **`workflow` scope**.

5. **Quota של Google Indexing API**: 200/יום default. אם יש לך הרבה מאמרים, בקש quota increase ב-Google Cloud Console.

6. **GSC URL Inspection rate limit**: 600/דקה. השתמש ב-`setTimeout(1100ms)` בין בקשות.

7. **Vercel CDN cache**: שינויי vercel.json (redirects) לא תמיד מתעדכנים מיד ב-edge. דחוף trivial commit כדי לטריגר rebuild + cache purge.

8. **Supabase secrets ב-GitHub** מצריכים encryption עם **libsodium sealed box**. השתמש ב-Python PyNaCl או npm `tweetsodium`. דוגמה:
   ```python
   from nacl import encoding, public
   pk = public.PublicKey(public_key_b64.encode(), encoding.Base64Encoder())
   sealed = public.SealedBox(pk)
   encrypted = base64.b64encode(sealed.encrypt(secret_value.encode())).decode()
   ```

9. **Indexing API לא עובד על URL שכבר נשלח היום** — מחזיר שגיאה. אל תפנק אותו ביותר משליחה אחת ליום.

10. **Bing Webmaster Tools** — תוסיף את האתר ל-https://www.bing.com/webmasters אחרי הקמה. IndexNow יעבוד גם בלי, אבל תקבל data על האינדקס.

---

## 🚀 צעדי הקמה מסודרים

### יום 1 — חשבונות + Secrets (30 דק')
1. ⬜ צור Google Cloud project + הפעל Indexing API + Search Console API
2. ⬜ צור service account → JSON key
3. ⬜ הוסף את service email כ-Owner ב-GSC
4. ⬜ ייצור IndexNow key (32 bytes hex) → צור `public/{key}.txt`
5. ⬜ הוסף ל-GitHub Secrets: `GOOGLE_SERVICE_ACCOUNT_KEY`, `SUPABASE_SERVICE_KEY`, `SUPABASE_URL`

### יום 1 — DB (10 דק')
6. ⬜ הרץ ב-Supabase: `CREATE TABLE seo_published_articles ...`
7. ⬜ ודא 3 indexes נוצרו

### יום 2 — Scripts (1-2 שעות)
8. ⬜ צור 4 scripts ב-`scripts/`
9. ⬜ עדכן `SITE_URL`, `CATEGORY_URL_MAP`, `INDEXNOW_KEY` בכולם
10. ⬜ צור 3 GitHub Actions workflows

### יום 2 — בדיקה (15 דק')
11. ⬜ Push commit עם תוכן חדש → ראה ב-Actions שה-3 steps רצו ✓
12. ⬜ הפעל ידנית `check-indexation` → ראה ב-DB עדכון `last_indexation_check`
13. ⬜ הפעל ידנית `bulk-indexing` → ראה מייל סיכום

### יום 3 — שימוש שוטף
14. ⬜ כל push ל-main = אינדקס תוך שעות (IndexNow) + 1-7 ימים (Google)
15. ⬜ כל יום ב-09:00 UTC = check + אלרט אם יש בעיות
16. ⬜ אם משהו תקוע — הפעל `bulk-indexing` ידנית מ-Actions UI

---

## 💰 עלות חודשית

| שירות | עלות |
|---|---|
| Google Cloud (Indexing API) | חינם (200 req/day quota) |
| GSC URL Inspection | חינם |
| IndexNow / Bing | חינם |
| Supabase Free tier | חינם (לעד 500MB) |
| GitHub Actions | חינם (2000 min/חודש על public repo) |
| **סה"כ** | **$0** |

המערכת בנויה רק מ-APIs חינמיים.

---

## 📊 מה תקבל

**אחרי 24 שעות:**
- כל עמוד חדש שעולה → Bing/Yandex תוך שעות
- מייל יומי על מאמרים שלא נכנסו עדיין

**אחרי שבוע:**
- 70-90% מהמאמרים החדשים באינדקס Google
- בעיות נחשפות מיד דרך המייל היומי

**אחרי חודש:**
- אינדקס יציב של ~95% מהאתר
- אם משהו לא נכנס — אתה יודע למה (coverage_state ב-DB)

---

**מקור:** מערכת זו רצה בייצור ב-perfect1.co.il מאז אפריל 2026.

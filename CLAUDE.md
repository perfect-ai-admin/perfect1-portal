# פרפקט וואן — פורטל עסקי ישראלי

> **Snapshot date:** 2026-04-26 — לרענון, הריצו `npm run health` והעתיקו את המספרים לחלק "מצב נוכחי".

## מטרה

500–1,000 ביטויי חיפוש מדורגים בגוגל. נכון להיום (מ-GSC): 17 דפים מאונדקסים, 101 לא — אחרי תיקוני sprint זה אנו צופים 55–70 indexed תוך 4–6 שבועות.

---

## מצב נוכחי

| | מספר |
|---|---:|
| מאמרים פעילים | **97** |
| URLs ב-sitemap | **120** |
| Hard QA failures | **0** |
| מאמרים מתחת ל-1,200 מילים (thin) | 79 |
| מאמרים עם פחות מ-3 שאלות FAQ | 16 |
| Broken `relatedArticles` references | 0 |

### מאמרים לפי קטגוריה (auto-refreshable דרך `npm run health`)

```
osek-murshe  18    osek-zeir   6
guides       15    miktzoa     4
osek-patur   14    cities      3
amuta        10    services    3
hevra-bam     9    comparisons 1
sgirat-tikim  7    maam        1
misui         6
```

---

## ארכיטקטורה — מה אמיתי, מה לא לגעת

### Build & deploy chain

```
GitHub push (main)
   ↓
.github/workflows/deploy.yml
   ↓
npm ci  →  npm run build:no-prerender
              ↓ (npm lifecycle pre-hook)
              prebuild:no-prerender:
                node scripts/generate-sitemap.js
                npm test                              ← vitest, 28 tests / 5 suites
                node scripts/qa-content-scan.cjs      ← exit 1 on hard failures
                node scripts/qa-sitemap-audit.cjs     ← exit 1 on broken sitemap
              ↓ (only if all gates pass)
              vite build
   ↓
node scripts/generate-static.js     (SPA fallbacks + SEO pages)
   ↓
node scripts/prerender.js           (Puppeteer)
   ↓
node scripts/smoke-test-routes.js   (no white-screen check)
   ↓
vercel deploy --prod
   ↓ (post-deploy, all `continue-on-error: true`)
node scripts/notify-google-indexing.cjs   (Google Indexing API)
node scripts/notify-indexnow.cjs          (Bing/Yandex)
node scripts/submit-sitemap-gsc.cjs       (GSC submit + cleanup)
```

### Production scripts (do not delete — referenced by CI)

```
scripts/generate-sitemap.js          prebuild
scripts/generate-static.js           build step
scripts/prerender.js                 deploy step
scripts/smoke-test-routes.js         deploy step
scripts/notify-google-indexing.cjs   post-deploy
scripts/notify-indexnow.cjs          post-deploy
scripts/submit-sitemap-gsc.cjs       post-deploy
scripts/bulk-request-indexing.cjs    bulk-indexing.yml (manual + planned weekly)
scripts/check-indexation-status.cjs  check-indexation.yml (daily 09:00 UTC)
scripts/submit-all-urls.cjs          submit-all-to-google.yml (manual)
scripts/qa-content-scan.cjs          npm run qa:content
scripts/qa-sitemap-audit.cjs         npm run qa:sitemap
scripts/report-health.cjs            npm run health
scripts/add-cross-category-links.cjs idempotent re-run helper
```

### GitHub workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | push to main / manual | full build → deploy → notify |
| `bulk-indexing.yml` | manual | force-push every URL to Google Indexing API + IndexNow + sitemap submit |
| `check-indexation.yml` | cron `0 9 * * *` (daily 12:00 Israel) | poll GSC URL Inspection for every URL |
| `submit-all-to-google.yml` | manual | one-shot bulk URL submit |

### Cron / scheduled jobs

| איפה | תדירות | מה |
|---|---|---|
| GitHub Actions | יומי 12:00 IST | `check-indexation.yml` → status sync ל-`seo_published_articles` |
| Supabase pg_cron | כל 5 דקות | FollowUp Bot dispatch (לא לגעת) |
| Supabase pg_cron | יומי | gmail inbox poller (לא לגעת) |
| n8n | מגוון | F33 article writer, FollowUp Bot, social publisher (לא לגעת ב-UI חי) |

---

## איך SEO publishing עובד

1. **n8n F33** מייצר מאמר חדש (Claude Opus + QA gate) → דוחף PR ל-GitHub עם קובץ JSON ב-`src/content/<category>/<slug>.json`.
2. **המאמר חייב לעבור 3 שערים** לפני merge:
   - F33 quality gate ב-n8n (score ≥ 85, word count ≥ 1200, FAQ ≥ 3, author whitelist)
   - `npm test` בעת merge (28 tests — מבני ולא קוסמטי)
   - `npm run qa:content` (placeholder detection, broken stubs, broken relatedArticles)
3. אחרי merge ל-main → deploy.yml רץ אוטומטית → המאמר עולה ל-perfect1.co.il.
4. ב-deploy.yml: `notify-google-indexing.cjs` מקבל את הקובץ החדש מ-`git diff HEAD~1 HEAD` ושולח `URL_UPDATED` ל-Google Indexing API + IndexNow.
5. Google מבקר ב-URL תוך 24-72 שעות. החלטת אינדוקס תוך 1-4 שבועות נוספים, תלוי באיכות.

### Quality gate config (`config/site.config.cjs`)

```js
QUALITY_THRESHOLD     = 85    // F33 score gate (0-100)
MIN_WORD_COUNT        = 1200  // CI gate
MAX_ARTICLES_PER_DAY  = 3
RATE_LIMIT_MS.google  = 350   // ~170 req/min, under quota
```

---

## איך אינדוקס עובד

| ערוץ | מי משתמש | תדירות | רץ מ |
|---|---|---|---|
| Google Indexing API | scripts/notify-google-indexing.cjs | בכל deploy, רק על קבצים שהשתנו | deploy.yml |
| Google Indexing API (bulk) | scripts/bulk-request-indexing.cjs | manual / שבועי | bulk-indexing.yml |
| IndexNow (Bing + Yandex) | scripts/notify-indexnow.cjs | בכל deploy | deploy.yml |
| GSC Sitemap submit | scripts/submit-sitemap-gsc.cjs | בכל deploy | deploy.yml |
| GSC URL Inspection (status) | scripts/check-indexation-status.cjs | יומי 12:00 IST | check-indexation.yml |

`submit-sitemap-gsc.cjs` גם **מוחק** את ה-bogus `/sitemap` entry (ללא .xml) שגרם ל-GSC להציג שגיאת parse — מבצע cleanup אוטומטי בכל deploy. Idempotent.

---

## QA — איך מריצים לפני deploy

```bash
# הסט המלא (זה מה שה-CI ירוץ אוטומטית)
npm run qa:full

# או רכיבים בנפרד:
npm test                    # vitest — 28 tests
npm run qa:content          # תוכן: hard failures + thin/FAQ stats
npm run qa:sitemap          # sitemap structure
npm run qa:sitemap -- --probe   # + 20 critical URLs HTTP probe

# סטטוס מהיר של הפרויקט
npm run health
```

`qa:full` מתבצע אוטומטית בכל `npm run build:no-prerender` (כלומר בכל deploy). אם משהו נכשל — ה-deploy לא יוצא.

---

## ⛔ מה לא לגעת

הצגה ברורה — קוד שהפועל בפרודקשן ושינוי שלו מסכן הכנסות / לקוחות / SEO equity:

| | למה |
|---|---|
| `supabase/functions/tranzilaConfirmPayment/`, `tranzilaCreatePayment/`, `stripeWebhook/`, `fulfillPayment/` | תשלומים. שינוי = איבוד עסקאות. |
| `supabase/functions/botStartFlow/`, `botHandleReply/`, `smartMentorEngine/` | WhatsApp Bot — מקבל לידים. |
| `supabase/functions/crm*` | 26 פונקציות CRM. |
| n8n workflows חיים (FollowUp Bot, F33, post-purchase, social-publisher) | live automation. עורכים דרך n8n UI, לא דרך JSON exports. |
| `vercel.json` headers/CSP | Content-Security-Policy. שגיאה = שבירת iframes של Tranzila/Stripe. |
| `public/sitemap.xml` ידנית | ה-prebuild מייצר אותו אוטומטית. עריכה ידנית עלולה לשבור את הצהרת ה-XML. |
| `pg_cron` jobs קיימים ב-Supabase | למשל ה-followup tick כל 5 דקות. שינוי = הודעות חוזרות / עיכובים אצל לידים. |

לפני שינוי בכל אחד מהדברים האלה — `git checkout -b safe-experiment` ובדיקה מקומית.

---

## Emergency rollback

### תרחיש 1 — deploy חדש שובר את האתר

```bash
# מצא את ה-commit שעבד אחרון
git log --oneline -10

# החזר את main לאותו commit וpush --force-with-lease
git reset --hard <good-sha>
git push --force-with-lease origin main
```

Vercel ירוץ deploy אוטומטי על הdesha המוחזר (תוך ~5-9 דקות). זה נכון רק אם אף אחד אחר לא דחף בינתיים.

### תרחיש 2 — Vercel deploy עצמו תקין אבל ה-content לא נכון

```bash
# Vercel UI → Deployments → בחר deploy ירוק קודם → "Promote to Production"
# או דרך CLI:
vercel rollback <previous-deployment-url> --token=$VERCEL_TOKEN
```

### תרחיש 3 — Sitemap שבור / GSC parse error

```bash
# Backup branch קיים מהsprint הזה:
git diff backup/pre-cleanup-20260426 -- public/sitemap.xml

# אם צריך, החזר רק את הsitemap:
git checkout backup/pre-cleanup-20260426 -- public/sitemap.xml
git commit -m "rollback: restore sitemap.xml from backup branch"
git push
```

### תרחיש 4 — n8n workflow נשבר

לא נוגעים ב-JSON exports שב-`/docs/`. n8n UI הוא source of truth — תיקון ב-UI, ייצוא חדש ל-`/docs/` בעת הצורך כדי לעדכן backup.

### Backup branches

- `backup/pre-cleanup-20260426` — מצב לפני sprint הניקיון של 26/4/2026
- כשנעשה sprint גדול הבא — `backup/pre-<topic>-YYYYMMDD`

---

## כללי כתיבה לתוכן (סיכום מתומצת)

תקפים מ-CLAUDE.md הקודם, עדיין רלוונטיים:

- **שפת תוכן:** עברית בלבד, RTL.
- **כל מאמר** — meta title ≤ 60 תווים, meta description 120-160 תווים, ≥ 5 sections, ≥ 3 FAQ entries, 1200+ מילים (יעד 1500+).
- **TOC** — מספר ה-entries ב-TOC לא יכול לעלות על מספר ה-sections בפועל ביותר מ-2 (אחרת soft 404 בעיני Google).
- **relatedArticles** — לפחות 3 entries, כולן צריכות להפנות לקבצים קיימים (CI ייכשל אחרת).
- **Schema markup** — אוטומטי (Article + FAQ + BreadcrumbList).
- **Internal linking** — כל מאמר חדש צריך לקבל לפחות 2-3 קישורים נכנסים ממאמרים בקטגוריות סמכות (osek-patur, osek-murshe, guides).

---

## Roadmap מקוצר (התוכנית הארוכה ב-`docs/quality-baseline.md`)

1. **2 שבועות הקרובים** — הרחבת 10 thin הקצרים ביותר ל-1,200+ מילים. רשימה מוכנה ב-`docs/quality-baseline.md`.
2. **חודש הקרוב** — שכתוב ייחודי של `cities/tel-aviv`, `cities/jerusalem`, `cities/haifa` (כיום template duplicates).
3. **רבעון הקרוב** — הורדת thin count מ-79 ל-<40, ואז ל-0.
4. **בדיקה שבועית** — `npm run health`. אם דגל אדום — לטפל לפני שעולה.

---

## קבצים חשובים — איפה הם

```
.github/workflows/        ← deploy.yml + 3 indexing workflows
config/site.config.cjs    ← single source of truth ל-thresholds
lib/url-mapper.cjs        ← category → URL mapping
src/content/              ← כל המאמרים, JSON
src/portal/config/navigation.js   ← תפריט ראשי + sub-categories
public/sitemap.xml        ← regenerated automatically by prebuild hook
public/robots.txt         ← static, includes Sitemap reference
vercel.json               ← redirects, headers, CSP
tests/                    ← vitest suites
docs/CI-HARDENING.md      ← workflow patches awaiting manual apply
docs/quality-baseline.md  ← starting state for content metrics
docs/_archive/            ← versioned n8n payload snapshots (history only)
```

---

## ⚠️ מקור הקוד הנכון

עבוד רק עם: **`perfect-ai-admin/perfect1-portal`**

אל תתקשר עם: ~~`perfect-ai-admin/5bisnes`~~ (repo אחר לחלוטין למרות ש-package.json עדיין רושם name=`5bisnes`)

- GitHub Actions: https://github.com/perfect-ai-admin/perfect1-portal/actions
- Live site: https://www.perfect1.co.il

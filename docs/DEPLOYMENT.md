# Deployment

This is the only deploy path. There is no manual `vercel deploy` from
laptops. There is no FTP. There is no SSH. Everything goes through
GitHub Actions and Vercel.

## Standard deploy

```bash
git push origin main
```

That's it. The rest is automatic:

```
push to main
  ↓
.github/workflows/deploy.yml fires automatically
  ↓
~5-10 minutes later:
  - new version live on https://www.perfect1.co.il
  - sitemap submitted to Google Search Console
  - changed URLs pinged to Google Indexing API
  - changed URLs pinged to IndexNow (Bing/Yandex)
```

## What happens behind the scenes

```
1. checkout
2. setup node 22
3. validate vercel.json
4. npm ci
5. install Chrome (for prerender step)
6. npm run build:no-prerender
   └──> npm lifecycle: prebuild:no-prerender (CI gates) ↓ all of these must pass
        ├── node scripts/generate-sitemap.js
        ├── npm test                               # 32 tests / 6 suites
        ├── node scripts/qa/qa-content-scan.cjs    # exit 1 on hard content failure
        ├── node scripts/qa/qa-sitemap-audit.cjs   # exit 1 on broken sitemap
        └── node scripts/qa/qa-seo-tech.cjs        # exit 1 on broken links/redirects
   └──> vite build (only if prebuild passed)
7. node scripts/generate-static.js                 # SPA fallback HTML + canonicals
8. node scripts/prerender.js                       # Puppeteer prerender of pages
9. node scripts/smoke-test-routes.js               # white-screen detector on critical routes
10. install Vercel CLI
11. prepare .vercel/output/ (security headers + CSP applied)
12. vercel deploy --prod                           # ← live for users
13. node scripts/notify-google-indexing.cjs        # continue-on-error: true
14. node scripts/notify-indexnow.cjs               # continue-on-error: true
15. node scripts/submit-sitemap-gsc.cjs            # continue-on-error: true
```

Steps 13-15 run with `continue-on-error: true` because indexing API
hiccups (rate limits, transient 5xx) shouldn't block a deploy from
going live. As of Phase 4 of the stabilization sprint, those scripts
exit 1 on real failures so the step turns red in the workflow UI even
though the deploy itself succeeds.

## How long does it take?

Typical: 5-10 minutes from push to live. Bottlenecks:
  - `npm ci`: 90s-120s
  - `vite build`: 60s-90s
  - `generate-static.js`: 30s-60s
  - `prerender.js`: 60s-120s (Puppeteer rendering)
  - `vercel deploy`: 30s-90s

## Manual workflow triggers

```bash
# Push every URL to Google Indexing API + IndexNow + sitemap re-submit
gh workflow run bulk-indexing.yml

# One-shot bulk URL submission
gh workflow run submit-all-to-google.yml

# Re-trigger deploy (no code change — useful after changing Vercel env vars)
gh workflow run deploy.yml
```

## Pre-deploy QA — run locally first

Before pushing, run the same gates the CI will run:

```bash
npm run qa:full
```

If that's green, your push will deploy. If it's not, fix locally first.

## After-deploy verification

```bash
# Wait for the run to finish
gh run watch

# Quick smoke
curl -s -o /dev/null -w "%{http_code}\n" https://www.perfect1.co.il/

# Check sitemap is valid + just refreshed
curl -s https://www.perfect1.co.il/sitemap.xml | head -c 60

# Optional: probe canonicals on 15 sample URLs
npm run qa:seo:probe
```

## Where to look when something goes wrong

| Symptom | Where to look |
|---|---|
| Deploy step failing | `gh run view <id> --log` |
| Sitemap missing or broken | `gh run view <id> --log \| grep -A5 sitemap` |
| Vercel deployed but site is white | smoke-test step ran AFTER vercel deploy in old runs (fixed); re-check `prerender` step output |
| Indexing didn't fire | Check post-deploy steps — they continue-on-error but exit 1 on real failure now (Phase 4) |
| GSC errors | https://search.google.com/search-console — Sitemaps tab |

## Required environment

- GitHub Secrets:
  - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - `GOOGLE_SERVICE_ACCOUNT_KEY` (with Search Console + Indexing scopes)
  - `SUPABASE_SERVICE_KEY`
- Vercel project: `perfect1-portal` (under `yosi5919-8785s-projects`)
- DNS: `www.perfect1.co.il` → Vercel
- Domain redirect: `perfect1.co.il` → `www.perfect1.co.il` (in `vercel.json`)
- robots.txt + IndexNow key file: served from `public/`

## The 3 patches that still need manual application

`docs/CI-HARDENING.md` documents three deploy.yml improvements that
need a human with `workflow` OAuth scope to push:

1. Add a `Deploy summary` step that surfaces which post-deploy step
   failed (visible at top of every run)
2. Promote `Submit Sitemap to GSC` to blocking (remove
   continue-on-error)
3. Add a weekly cron to `bulk-indexing.yml`

5 minutes of editing in the GitHub UI.

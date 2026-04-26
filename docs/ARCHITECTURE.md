# System Architecture — perfect1.co.il

> **Snapshot:** 2026-04-26. Refresh by running `npm run health` and
> updating the numbers below.

## What this system is

A Hebrew-language SEO content portal (97 articles, 13 categories) +
attached commercial layer (lead capture, CRM, payments, WhatsApp bot).
The two halves are deliberately separated — the SEO half should never
touch payments / CRM auth / customer data.

## Layers (top to bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  www.perfect1.co.il                                             │
│  Vercel (CDN + static + SPA shell)                              │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │  build artifact
                            │
┌─────────────────────────────────────────────────────────────────┐
│  GitHub Actions                                                  │
│    deploy.yml          push to main                              │
│    bulk-indexing.yml   workflow_dispatch                         │
│    check-indexation.yml cron 0 9 * * *                           │
│    submit-all-to-google.yml workflow_dispatch                    │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │  npm run build:no-prerender
                            │  (preceded by prebuild:no-prerender CI gate)
                            │
┌─────────────────────────────────────────────────────────────────┐
│  Source                                                          │
│    src/portal/         React SPA                                 │
│    src/content/<cat>/<slug>.json   97 articles, 13 categories    │
│    public/sitemap.xml  generated                                 │
│    config/site.config.cjs   single source of truth               │
│    scripts/             10 production + qa/ + setup/             │
└─────────────────────────────────────────────────────────────────┘
                            ▲
                            │
┌──────────────────────┐  ┌──────────────────────────────────────┐
│  n8n (live workflows) │  │ Supabase (rtlpqjqdmomyptcdkmrq)     │
│   F33 article writer  │  │   130+ edge functions               │
│   FollowUp Bot        │  │   pg_cron jobs (followup, gmail)    │
│   social publisher    │  │   tables: leads, articles, payments │
│   post-purchase       │  │   RLS-protected                     │
└──────────────────────┘  └──────────────────────────────────────┘
```

## Data flow — content publish

```
Topic idea (n8n or human)
  ↓
F33 (n8n)  ← Claude Opus generation + quality gate (score≥85, ≥1200w, ≥3 FAQ)
  ↓
Pull request to perfect-ai-admin/perfect1-portal
  ↓
Merge to main (after human review)
  ↓
deploy.yml triggered
  │
  ├── npm ci
  ├── npm run build:no-prerender
  │     └── prebuild:no-prerender (CI GATE)
  │           ├── generate-sitemap.js
  │           ├── npm test                  (32 tests, 6 suites)
  │           ├── qa-content-scan.cjs       (hard failures → fail)
  │           ├── qa-sitemap-audit.cjs      (broken sitemap → fail)
  │           └── qa-seo-tech.cjs           (broken links/redirects → fail)
  │     └── vite build (only if all gates pass)
  ├── generate-static.js                    (SPA fallbacks + canonical injection)
  ├── prerender.js                          (Puppeteer)
  ├── smoke-test-routes.js                  (white-screen detector)
  ├── vercel deploy --prod                  ← live for users at this point
  ├── notify-google-indexing.cjs            (continue-on-error true, exit 1 on real fail)
  ├── notify-indexnow.cjs                   (continue-on-error true, exit 1 on real fail)
  └── submit-sitemap-gsc.cjs                (continue-on-error true, exit 1 on real fail)
```

## Data flow — lead → CRM → bot

```
User fills form on www.perfect1.co.il
  ↓
submitLead edge function           (Supabase, RLS-protected)
  ↓
leads table inserted               (RLS: only service_role writes)
  ↓
botStartFlow trigger               (WhatsApp Bot via GreenAPI)
  ↓
crmCreateLead webhook              (CRM auto-assignment)
  ↓
followupDispatch (pg_cron, every 5 min)
  ↓
n8n FollowUp Bot                   (multi-touch sequence)
```

This pipeline is OUT OF SCOPE for SEO/content automation work. See
docs/DO-NOT-TOUCH.md.

## Data flow — payments

```
User → /Checkout (SPA route)
  ↓
tranzilaCreatePayment              (Supabase edge function)
  ↓
Tranzila iframe (CSP-allowed)
  ↓
tranzilaConfirmPayment             (webhook)
  ↓
fulfillPayment                     (creates subscription, grants credits)
  ↓
crmCreateLead                      (lead enriched)
```

OUT OF SCOPE for SEO work. See docs/DO-NOT-TOUCH.md.

## Quality gates (CI-enforced)

| Gate | Source | Blocks deploy on |
|---|---|---|
| Build | `vite build` | TypeScript / build error |
| Tests | `vitest run` (6 files / 32 tests) | any failing test |
| Content | `qa-content-scan.cjs` | hard failures (placeholder, broken stub, etc.) |
| Sitemap | `qa-sitemap-audit.cjs` | structural break (XML decl, dupes, host) |
| SEO tech | `qa-seo-tech.cjs` | broken inline links, broken redirects |
| Smoke | `smoke-test-routes.js` | white-screen / spinner-hang on critical routes |

All gates run on **every** push to `main`.

## Why separated SEO/commercial layers matter

The SEO automation pipeline (F33, content scanner, sitemap, indexing)
runs over public content. If a quality gate accidentally hooked into
payment data, an indexing run could expose customer info. Keeping the
SEO scripts in `scripts/qa/` and `scripts/setup/` with no Supabase
service-key access prevents that risk by design.

## Where to find what

```
README.md                         basic project info
CLAUDE.md                         AI-agent instructions, content rules
docs/
  ARCHITECTURE.md                 (this file)
  DO-NOT-TOUCH.md                 production boundaries
  DEPLOYMENT.md                   how to deploy step-by-step
  ROLLBACK.md                     emergency rollback playbook
  QA-CHECKLIST.md                 pre-deploy checklist
  CI-HARDENING.md                 workflow patches awaiting manual apply
  quality-baseline.md             content metrics baseline
  _archive/                       historical n8n payload snapshots
.github/workflows/                4 active workflows
config/site.config.cjs            constants, thresholds
lib/                              5 helper modules
scripts/
  README.md                       layout + rules
  qa/                             read-only audits (CI gates)
  setup/                          one-shot helpers
src/                              React SPA + content JSONs
supabase/                         migrations + edge functions
public/                           static assets + sitemap.xml
vercel.json                       redirects, headers, CSP
```

# scripts/qa/ — Quality Audits

Read-only audit + validation scripts. None of these mutate data; they
just scan + report. Wired into the `prebuild:no-prerender` npm hook
so they run on every deploy.

| Script | npm command | What |
|---|---|---|
| `qa-content-scan.cjs` | `npm run qa:content` | Article shape, word count, FAQ presence, broken refs. Exit 1 on hard failures. |
| `qa-sitemap-audit.cjs` | `npm run qa:sitemap` | Sitemap structure (XML decl, host, dupes). `--probe` adds HTTP probe of 20 critical URLs. |
| `qa-seo-tech.cjs` | `npm run qa:seo` | Inline-link integrity, redirect destinations, canonical (with `--probe`). |
| `report-health.cjs` | `npm run health` | Single-screen project health snapshot — git/sitemap/content/CI/Supabase. |

All four scripts are pure CommonJS (no devDeps required at runtime
beyond Node stdlib). Add new audits here, not at the `scripts/` root.

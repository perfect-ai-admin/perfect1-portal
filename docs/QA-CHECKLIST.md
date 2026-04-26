# Pre-Deploy QA Checklist

Run this before every push to `main`. Total time: 30 seconds.

## The five-second version

```bash
npm run qa:full
```

If green → push. If red → fix locally first.

## What `qa:full` actually runs

1. `node scripts/generate-sitemap.js` — regenerates sitemap from `src/content/`
2. `npm test` — vitest suite (32 tests / 6 suites)
3. `node scripts/qa/qa-content-scan.cjs` — content hard-failure scan
4. `node scripts/qa/qa-sitemap-audit.cjs` — sitemap structure audit
5. `node scripts/qa/qa-seo-tech.cjs` — internal links + redirects audit

If any step exits non-zero, the deploy will refuse to build. The CI
runs these same five checks via the `prebuild:no-prerender` npm hook,
so what you see locally is what CI sees.

## When `qa:full` is too coarse

Each gate has its own command for fast iteration:

```bash
# Specific test files
npx vitest run tests/sitemap-integrity.test.js
npx vitest run tests/content-shape.test.js
npx vitest run tests/related-articles-integrity.test.js

# Just the content scan
npm run qa:content

# Just the sitemap audit (offline only)
npm run qa:sitemap

# Sitemap audit + HTTP probe of 20 critical URLs (~10s)
npm run qa:sitemap -- --probe

# Just the SEO tech audit (offline only)
npm run qa:seo

# SEO tech audit + canonical HTTP probe of 15 sample URLs (~10s)
npm run qa:seo:probe

# Health snapshot (one-screen project status)
npm run health
```

## Manual checks for content changes

When adding or significantly editing an article:

- [ ] `metaTitle` ≤ 60 chars (CI gate enforces this hard)
- [ ] `metaDescription` 120-160 chars (soft warning if outside)
- [ ] At least 5 sections (hard gate: TOC ≤ sections+2)
- [ ] At least 3 FAQ entries (soft warning under 3)
- [ ] At least 1200 words combined (soft warning under 1200; CLAUDE.md
      target is 1500)
- [ ] At least 3 `relatedArticles` entries (soft warning under 3)
- [ ] All `relatedArticles` reference real files (CI gate hard-enforces)
- [ ] No placeholder tokens (`test query`, `lorem ipsum`, `TODO`, etc.)
- [ ] Slug matches filename + folder matches `category` field

The CI gates catch most of these — but checking locally first saves a
deploy round-trip.

## Manual checks for redirect changes

When adding entries to `vercel.json.redirects[]`:

- [ ] `source` starts with `/`
- [ ] `destination` starts with `/` and resolves to a real article OR
      another redirect source (chains are caught by the test suite —
      avoid them)
- [ ] `permanent: true` is set (304/301 vs 307/302)
- [ ] Run `npm run qa:seo` to verify the new redirect is healthy

## Manual checks for new tests

When adding to `tests/`:

- [ ] File name ends in `.test.js`
- [ ] Uses `import { describe, it, expect } from 'vitest'`
- [ ] Run `npx vitest run` locally — must pass before push
- [ ] If the test reads from `src/content/` or `vercel.json`, also
      run the test against the working tree (don't hardcode paths
      that only resolve in CI)

## Manual checks for changes to scripts

When editing scripts in `scripts/`:

- [ ] If it's a workflow-referenced script (see scripts/README.md),
      do NOT rename or move it
- [ ] If it's at `scripts/qa/` or `scripts/setup/`, run it locally
      before commit and verify exit code
- [ ] If it logs errors via `console.error`, also `process.exit(1)`
      or `throw` — do not silently exit 0 on real failure

## When skipping the checklist is acceptable

Never. Even for a one-line README change, `npm run qa:full` is fast
enough. The cost of a broken deploy is much higher than 30s of QA.

## When the gates seem to be wrong

The gates can have bugs. If you're sure your change is safe and a gate
is reporting a false positive:

1. Read the failing test/audit's source — they're all in `tests/` and
   `scripts/qa/` and ~100 lines each
2. If the gate has a bug, fix the gate (commit separately)
3. If the gate is wrong about the rule, change the rule deliberately
   (and document the change)
4. **Never** disable a gate or add `// eslint-disable` to bypass it

## Emergency: deploy past the gates

There is no emergency path that bypasses the gates. If the gates fail,
the build fails. The right response to a gate failure under pressure is
to fix the underlying issue, not to bypass.

If the SITE is down (production outage) and you need to roll back, see
`docs/ROLLBACK.md` — the gates run on the rollback commit too, so
rollback is safe.

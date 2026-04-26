# Content Quality Baseline — 2026-04-26

Output of `npm run qa:content` taken at the close of the stabilization
sprint. This is the **starting point**; every future change should keep
hard failures at zero and reduce the thin count.

## Summary

| Metric | Value |
|--------|-------|
| Total articles (excl. authors/) | 97 |
| Hard failures (CI-blocking) | **0** |
| Thin articles (<1200 words) | 79 |
| Articles with missing or short FAQ | 16 |

## Categories

| Category | Articles |
|----------|---------:|
| osek-murshe   | 18 |
| guides        | 15 |
| osek-patur    | 14 |
| amuta         | 10 |
| hevra-bam     |  9 |
| sgirat-tikim  |  7 |
| misui         |  6 |
| osek-zeir     |  6 |
| miktzoa       |  4 |
| cities        |  3 |
| services      |  3 |
| comparisons   |  1 |
| maam          |  1 |

## Top 10 thinnest articles — expand priority

These are the 10 articles closest to a "Crawled — currently not indexed"
verdict in Google Search Console. Expanding them past 1200w + adding
FAQ should unlock indexation for most.

| Words | URL |
|------:|-----|
| 224 | `/osek-murshe/advantages-of-osek-murshe` |
| 268 | `/amuta/cost` |
| 291 | `/amuta/faq` |
| 296 | `/osek-murshe/faq` |
| 313 | `/osek-zeir/faq` |
| 372 | `/guides/how-to-write-a-successful-business-plan` |
| 393 | `/osek-patur/faq` |
| 396 | `/amuta/accountant` |
| 397 | `/guides/osek-comparison` |
| 421 | `/guides/faq` |

## How to use this report

```bash
# Full human-readable scan
npm run qa:content

# Machine-readable, exits 1 on any hard failure (suitable for CI)
node scripts/qa-content-scan.cjs --json

# Just the prioritized action list
node scripts/qa-content-scan.cjs --priority
```

## Hard-failure definitions (the only CI gates)

A scan returns exit 1 if **any** article triggers any of:
- missing `metaTitle` / `metaDescription` / `heroTitle` / `sections`
- TOC promises more than 2 sections beyond what `sections[]` actually contains
- placeholder tokens in title/keywords/sections (`test query`, `lorem ipsum`,
  `placeholder`, `TODO:`, `FIXME:`, `XXX:`)
- `slug` field in JSON does not match filename
- `category` field in JSON does not match parent folder
- a `relatedArticles` entry references an article that does not exist
  *and* is not covered by a 301 redirect in `vercel.json`

## Soft-warning definitions (backlog only — never gate)

- word count below `MIN_WORD_COUNT` (currently 1200, see `config/site.config.cjs`)
- fewer than 3 FAQ entries
- `metaTitle` empty or above 60 chars
- `metaDescription` outside 120–160 chars
- fewer than 3 `relatedArticles`
- city pages share an identical template signature

## Reduction targets — next sprints (not committed)

| Target | When |
|--------|------|
| Top 10 thinnest expanded to 1200w+ | next 2 weeks |
| All `cities/*` rewritten with unique per-city content | next month |
| All FAQ pages padded to 3+ Q&A | next 2 weeks |
| Thin count <40 | end of Q2 |
| Thin count 0 | end of Q3 |

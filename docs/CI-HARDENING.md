# CI Hardening — Phase 4 of stabilization sprint

What landed in this sprint vs. what is left as a manual patch you need
to apply in the GitHub UI (because the OAuth token used for these
commits does not have the `workflow` scope, so it can't push changes
to `.github/workflows/`).

## ✅ Already in place (this sprint)

The deploy workflow runs `npm run build:no-prerender`. A new
`prebuild:no-prerender` npm hook now fires automatically before that,
chaining four gates and aborting the deploy if any of them fails:

```
prebuild:no-prerender
  → node scripts/generate-sitemap.js     (regenerates sitemap from /src/content)
  → npm test                              (vitest: 28 tests across 5 suites)
  → node scripts/qa-content-scan.cjs      (exit 1 on any HARD content failure)
  → node scripts/qa-sitemap-audit.cjs     (exit 1 on structural sitemap break)
```

Effect on the existing `.github/workflows/deploy.yml`: zero file change,
but the same workflow now refuses to deploy if:

  - any vitest test fails
  - any article has a hard-failure issue (broken stub, placeholder
    tokens, slug/category mismatch, broken relatedArticles)
  - sitemap.xml is structurally invalid (wrong host, duplicates,
    missing `<?xml` first-byte, malformed URLs)

You can also run the same gate locally with `npm run qa:full`.

## ⏳ Still TODO — apply manually in GitHub UI

These changes require editing `.github/workflows/deploy.yml` directly,
which an OAuth App without `workflow` scope cannot do. They're small,
isolated, and reversible.

### 1. Surface indexing-step failures (no longer silent)

Three steps currently use `continue-on-error: true` and fail in
silence when their underlying API has issues. The fix is to add a
final summary step that emits a visible note in the workflow run.

Open `.github/workflows/deploy.yml` in GitHub → click the pencil icon
→ append this step at the bottom of `steps:`:

```yaml
      - name: Deploy summary
        if: always()
        run: |
          {
            echo "## Deploy summary"
            echo ""
            echo "Commit: ${{ github.sha }}"
            echo ""
            echo "| Step | Result |"
            echo "|------|--------|"
            echo "| Build & smoke | ${{ steps.smoke.outcome || 'n/a' }} |"
            echo "| Vercel deploy | ${{ steps.deploy.outcome || 'n/a' }} |"
            echo "| Google Indexing API | ${{ steps.notify-google.outcome || 'n/a' }} |"
            echo "| IndexNow (Bing/Yandex) | ${{ steps.notify-indexnow.outcome || 'n/a' }} |"
            echo "| Submit sitemap to GSC | ${{ steps.submit-sitemap.outcome || 'n/a' }} |"
          } >> $GITHUB_STEP_SUMMARY
```

…and add `id:` keys to the affected existing steps so the summary can
read their outcomes:

  - `Smoke test critical routes` → add `id: smoke`
  - `Deploy to Vercel` → add `id: deploy`
  - `Notify Google Indexing API` → add `id: notify-google`
  - `Notify IndexNow (Bing/Yandex)` → add `id: notify-indexnow`
  - `Submit Sitemap to GSC` → add `id: submit-sitemap`

Result: every workflow run will have a top-of-page summary table with
green/red dots for each post-deploy hook. Failures stop being silent.

### 2. (Optional) Promote `Submit Sitemap to GSC` to blocking

`Submit Sitemap to GSC` currently has `continue-on-error: true`. The
script itself already handles 403 (auth) and 404 (missing) cases
gracefully — it returns exit 0 in both. So the only way it returns
non-zero now is on a *real* outage.

Removing `continue-on-error: true` from this single step is safe and
makes sitemap-submit failures fail the workflow visibly. Recommended.

Keep `continue-on-error: true` on `Notify Google Indexing API` and
`Notify IndexNow` — those can hit transient quota/network issues that
should not block a deploy.

### 3. (Optional) Add a weekly bulk-indexing schedule

`bulk-indexing.yml` is currently `workflow_dispatch` only. To run it
automatically once a week (recommended — it submits all articles to
Google Indexing API + IndexNow + GSC), add:

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '0 8 * * 1'   # Mondays at 08:00 UTC = 11:00 Israel
```

That's it. The job already has all the env wiring; adding the
schedule is a one-line change.

## Why an OAuth-scope limitation blocked these from being pushed

When this sprint started, the available token had `repo` scope but
not `workflow` scope. GitHub's enforcement:

> ! [remote rejected]   main -> main (refusing to allow an OAuth App
>   to create or update workflow `.github/workflows/...` without
>   `workflow` scope)

To unblock future automation passes, regenerate the token with
`repo` + `workflow` scopes (Settings → Developer settings → Personal
access tokens). Or apply the three patches above by hand in the
GitHub UI; takes 3-5 minutes.

# Rollback Playbook

Four scenarios. Match yours, run the steps. If the right scenario is
unclear, default to **Scenario 1** (revert main + redeploy) — it's
always safe and reverses cleanly.

## Scenario 1 — Bad commit on main is breaking the site

**Symptom:** site is loading 5xx / white screens / wrong content. Last
deploy went green but reality is broken.

```bash
# 1. Find the last known-good commit
git log --oneline -10

# 2. Identify the bad SHA (let's call it $BAD), the previous good one ($GOOD)
git revert --no-edit $BAD     # creates a new commit reverting $BAD
git push origin main          # triggers a fresh deploy with $BAD reverted
```

Effect: ~5-10 minutes later, site is restored. The bad commit stays
in history, but its effect is undone. Cleaner than `git reset --hard`
because it preserves history and auditability.

## Scenario 2 — Vercel-side issue (deploy step succeeded but Vercel serves the wrong build)

**Symptom:** GitHub Actions shows green, but the live site doesn't
reflect the latest commit. Could be Vercel cache, edge config, etc.

```bash
# Find a previous good Vercel deployment URL
vercel ls --token=$VERCEL_TOKEN --scope=yosi5919-8785s-projects | head -10

# Promote the previous deployment back to production
vercel promote <previous-deployment-url> --token=$VERCEL_TOKEN
```

Or via Vercel UI: Project → Deployments → on the green one, click
the "..." menu → "Promote to Production". Takes ~30 seconds.

## Scenario 3 — Sitemap broken / GSC parse errors

**Symptom:** Google Search Console shows a sitemap error. Production
site itself is fine.

```bash
# Pull the sitemap from the safety branch from before the relevant sprint
git checkout backup/pre-cleanup-20260426 -- public/sitemap.xml
git commit -m "rollback: restore sitemap.xml from pre-cleanup backup"
git push

# Or just regenerate from scratch (preferred — picks up current content)
node scripts/generate-sitemap.js
git add public/sitemap.xml
git commit -m "rollback: regenerate sitemap from src/content/"
git push
```

Then in GSC: Sitemaps → click `/sitemap.xml` → "Re-submit". Status
will refresh within a few hours.

## Scenario 4 — A live n8n workflow is misbehaving

**Symptom:** F33 stopped producing articles, FollowUp Bot sent
duplicates, social-publisher failed silently.

DO NOT edit JSON exports in `docs/`. Open the n8n UI directly:

1. Identify the workflow (`FollowUp Bot`, `F33 article writer`,
   `post-purchase-workflow`, etc.)
2. n8n → Executions tab → check the most recent failed run
3. n8n → Workflow → "Versions" → restore to a known-good version
   (n8n keeps version history per workflow)
4. After verifying the live workflow is good, export to `docs/` to
   refresh the backup file:
   ```bash
   # in n8n UI: open workflow → Settings → Export
   # save the JSON to docs/<workflow-name>.json
   git add docs/<workflow-name>.json
   git commit -m "backup: refresh n8n export of <workflow-name>"
   git push
   ```

## Scenario 5 — Rolling back a Supabase migration

**This is the hardest one and requires explicit human approval.**
Migrations should never be rolled back via git revert alone — the
database state is what matters, not the migrations folder.

If a migration broke production:

1. Identify the migration (check `supabase migration list` if available,
   otherwise look at `supabase/migrations/` timestamps)
2. Write a NEW migration that reverses the schema change (don't try
   to "uncommit" the original)
3. Apply the new migration via the Supabase MCP / dashboard
4. Commit the new migration to git

If RLS or auth is broken, FIRST set the affected table to RLS-bypass
service-role only (kills public access) until the new reverse-migration
is applied. Better a brief outage than a data leak.

**Emergency contact:** check `docs/DO-NOT-TOUCH.md` — anything in the
"absolutely off-limits" section needs human review before rollback.

## Rollback after a stabilization sprint

The stabilization sprints (2026-04-26) created a backup branch:

```
backup/pre-cleanup-20260426
```

To roll back the entire sprint:

```bash
# Reset main to the state before the sprint
git checkout main
git reset --hard backup/pre-cleanup-20260426
git push --force-with-lease origin main
```

DANGER: this is a force-push. Only use if you're certain the sprint
introduced regressions and there's no per-commit revert that fixes it.
Coordinate with anyone else pushing to main first.

Safer alternative — revert specific commits:

```bash
# List the sprint's commits
git log --oneline backup/pre-cleanup-20260426..main

# Revert specific ones in reverse order
git revert <newest-bad-commit>
git revert <next-bad-commit>
git push
```

## After every rollback

1. `npm run qa:full` — make sure local matches what's live
2. `gh run watch` — confirm the redeploy goes green
3. Smoke test 7 critical URLs:
   ```bash
   for url in "/" "/sitemap.xml" "/osek-patur/how-to-open" "/osek-murshe/vat-guide" "/calculators" "/about" "/atzmaim-berega"; do
     curl -o /dev/null -s -w "%{http_code}  $url\n" "https://www.perfect1.co.il${url}"
   done
   ```
4. If indexing got disrupted, run `gh workflow run bulk-indexing.yml`
   to re-push URLs to Google Indexing API + IndexNow.

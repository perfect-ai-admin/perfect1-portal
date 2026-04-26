# DO-NOT-TOUCH — Production Boundaries

This is the safety perimeter. Code, agents, and humans operating in
this repo MUST NOT change anything below without explicit human
approval — and even then, with a backup branch and rollback ready.

## 🔴 Absolutely off-limits without explicit per-change approval

### Payment flows
```
supabase/functions/tranzilaCreatePayment/
supabase/functions/tranzilaConfirmPayment/
supabase/functions/tranzilaHandshake/
supabase/functions/stripeWebhook/
supabase/functions/fulfillPayment/
supabase/functions/createCheckoutSession/
supabase/functions/getPaymentStatus/
supabase/functions/retryBillingDocument/
supabase/functions/billingHealthScanner/
supabase/functions/checkAndReserveCredit/
supabase/functions/addCredits/
supabase/functions/addDownloadCredits/
src/pages/Checkout*.jsx
```
Why: real money flows. A regression silently fails subscriptions.

### CRM authentication & lead routing
```
supabase/functions/crm*           (26 functions)
supabase/functions/agentLogin/
supabase/functions/adminUpdate*/
supabase/functions/adminDelete*/
supabase/functions/submitLead/
supabase/functions/createLeadWithBot/
src/pages/AgentLogin.jsx
src/pages/CRM/*
```
Why: lead loss is permanent. Auth bugs leak data.

### WhatsApp Bot entry flow
```
supabase/functions/botStartFlow/
supabase/functions/botHandleReply/
supabase/functions/smartMentorEngine/
supabase/functions/sendAgentNotification/
supabase/functions/inboundWebhook/
supabase/functions/triggerFollowupFlow/
supabase/functions/followupDispatch/
supabase/functions/triggerManualFollowup/   (untracked but live)
```
Why: customer-visible. The token misalignment in 2026-04-05 caused
silent message failures for ~24 hours.

### Live n8n workflows
- `FollowUp Bot` (every-5-minute trigger)
- `F33 article writer` (Claude Opus → PR)
- `post-purchase-workflow`
- `social-media-publisher`
- `seo-cannibalization-workflow`
- `seo-competitor-monitor-workflow`
- `fillfaster-agreement-bridge`
- `fb-ig-publisher-v2`

The JSON exports in `docs/` and `docs/_archive/` are **backups, not the
source of truth**. The live n8n instance is. Edit there, then re-export
to `docs/` if you want a fresh backup.

### Vercel platform config
- `vercel.json` `headers` and `rewrites` blocks (CSP, frame-ancestors —
  changing breaks Tranzila/Stripe iframes)
- `vercel.json` catch-all `https://www.perfect1.co.il/:path*` redirect
  (forces canonical host)

You **may** add new entries to `vercel.json.redirects[]` for slug
renames or to fix broken inline links. That's the project's
established mechanism — see how Phase 4 of the SEO sprint added 15.

### Supabase platform
- `supabase/config.toml` `project_id` (currently mismatched between
  config.toml and prod — see docs/CI-HARDENING.md for context)
- pg_cron jobs in `supabase/migrations/` (followup tick, gmail polling)
- RLS policies on `leads`, `payments`, `seo_published_articles`
- The 21 untracked migrations and 5 untracked edge functions —
  their state in production is unverified. **Do not auto-commit
  them**. See Phase 2 audit summary.

### Static infrastructure files
- `public/sitemap.xml` — generated automatically. Manual edits get
  overwritten on every prebuild AND can break the XML declaration
  byte-1 invariant (already burned us once in 2026-04-24).
- `public/robots.txt` — coordinated with Google/Bing crawlers.
  Changing block lists can drop URLs from index.
- `public/{INDEXNOW_KEY}.txt` — IndexNow proof file. Deleting breaks
  Bing/Yandex submissions.

## 🟡 Touch with caution — small, reversible changes only

### Production scripts at `scripts/` root
The 10 workflow-referenced scripts. You may improve their internal
logic, but DO NOT rename them or move them — workflow files reference
them by path and updating those needs `workflow` OAuth scope which the
project's tokens currently don't have.

### `config/site.config.cjs`
Single source of truth. Changes here propagate to every script. Any
change should be a tiny diff (e.g., bumping a threshold), reviewed by
a human, and tested with `npm run qa:full`.

### CLAUDE.md
Read by every AI agent in the project. Changes here change agent
behavior across the board. Make sure changes are SHORT and based on
verifiable reality — not aspiration.

### `src/portal/config/navigation.js`
Sitewide navigation. Changes affect every page's header/footer. Test
in `npm run dev` before merging.

## 🟢 Safe to change without ceremony

- `src/content/<category>/<slug>.json` (new articles, edits to existing
  ones — provided they pass `npm run qa:full`)
- `scripts/qa/*` (new audits, improvements to existing audits)
- `scripts/setup/*` (one-shot helpers — must remain idempotent)
- `tests/*.test.js` (more tests = more safety)
- `docs/*.md` (documentation; keep accurate to reality)

## SEO automation must NEVER

These are enforced rules for any agent or script working on SEO/content
publishing:

1. **Read or write `leads`, `payments`, `subscriptions` tables.** Use
   `seo_published_articles` and the per-content tables only.
2. **Use `SUPABASE_SERVICE_KEY` for anything other than the SEO tracking
   tables.** Use the publish-only key path.
3. **Publish an article that fails the quality gate.** F33 (n8n) and
   the CI gates BOTH enforce this — if either is bypassed, the published
   article must still pass `npm run qa:content` post-merge.
4. **Touch n8n production workflows from a script.** Workflows are
   edited only via the n8n UI, then exported to `docs/` for backup.
5. **Modify CSP headers in `vercel.json`.** Tightening the CSP can
   block Tranzila/Stripe iframes. Loosening exposes XSS surface.

## When in doubt

Stop and ask. The cost of a 5-minute confirmation is far less than the
cost of an outage in payment / lead / bot flows.

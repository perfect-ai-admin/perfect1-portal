# docs/_archive — Versioned Snapshots

Historical n8n workflow exports + bot payload snapshots that were
previously committed at the top of `/docs/` as separate `*-v2.json`,
`*-v3.json`, `*-final.json`, `*-updated.json` files.

## Why archived

Git already provides version history. Committing each iteration as
a new file (`crm-bot-payload-v2.json` … `crm-bot-payload-v11.json`)
duplicated information that `git log` exposes for free, polluted
the active docs folder, and made it unclear which snapshot was the
current source of truth.

Moved here on 2026-04-26 as part of the stabilization sprint
(Phase 2C). None of these files are referenced from any tracked
production path (`.github/workflows/`, `package.json`,
`supabase/functions/`, `src/`).

## How to revive a file

If you need to re-activate one of these (e.g. an n8n workflow needs
to be re-imported), move it back with:

    git mv docs/_archive/<file>.json docs/<file>.json

…then commit. Git history is preserved across the move.

## What is the *current* truth

For active n8n workflows, see (these stayed in `/docs/`):

  - `docs/FollowUp Bot.json`
  - `docs/sales-bot-workflow.json`
  - `docs/social-media-publisher.json`
  - `docs/post-purchase-workflow*.json`
  - `docs/seo-cannibalization-workflow.json`
  - `docs/seo-competitor-monitor-workflow.json`
  - `docs/fillfaster-agreement-bridge.json`
  - `docs/fb-ig-publisher-v2.json`

The live n8n instance is the actual source of truth — these JSONs
are exports for backup / version-control purposes only.

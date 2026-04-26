# scripts/ — Layout

```
scripts/
├── README.md          (this file)
├── qa/                — read-only audits (CI gates + npm run qa:*)
├── setup/             — one-shot helpers (run-once, must be idempotent)
├── generate-sitemap.js          — npm prebuild hook (CI)
├── generate-static.js           — npm build step (CI)
├── prerender.js                 — deploy.yml step (CI)
├── smoke-test-routes.js         — deploy.yml step (CI)
├── notify-google-indexing.cjs   — deploy.yml post-deploy (CI)
├── notify-indexnow.cjs          — deploy.yml post-deploy (CI)
├── submit-sitemap-gsc.cjs       — deploy.yml post-deploy (CI)
├── bulk-request-indexing.cjs    — bulk-indexing.yml (manual workflow)
├── check-indexation-status.cjs  — check-indexation.yml (daily cron)
└── submit-all-urls.cjs          — submit-all-to-google.yml (manual workflow)
```

## Rules

1. **Workflow-referenced scripts must stay at `scripts/` root.** Moving them
   would silently break `.github/workflows/*.yml` paths. Once the workflow
   files have been updated to support the new layout (see
   `docs/CI-HARDENING.md`), they can be moved into a new
   `scripts/cron/` subfolder.

2. **One-shot fixes belong in `scripts/setup/`** — never at the root. If
   you find yourself writing `scripts/fix-foo.cjs`, stop and put it in
   `scripts/setup/foo.cjs` instead, with a comment that says when it ran.
   Better yet: don't commit it unless it's idempotent and useful again.

3. **Read-only audits belong in `scripts/qa/`.** Anything that mutates
   data, deploys, or sends notifications does NOT belong in `qa/`.

4. **Scripts that need to deploy or modify production state** stay at
   the root for now — moving them is risky without coordinated workflow
   updates.

## What is dead but still here

Nothing should be. If you find a script that hasn't run in months and
isn't referenced from `.github/workflows/`, `package.json`, or `docs/`,
flag it for removal in the next stabilization sprint.

# Staging Environment — Future Setup

This document describes how to enable a staging environment for the SEO automation pipeline. **Nothing is wired up today** — F33 still publishes directly to `main` → production.

## Current production flow

```
F33 (n8n) → commit to main → GitHub Actions deploy.yml → Vercel prod (perfect1.co.il)
```

## Proposed staging flow (when needed)

```
F33-staging (n8n duplicate) → commit to staging branch → Vercel preview deploy
```

## Steps to enable

1. **Create branch.** From local clone:
   ```
   git fetch origin
   git checkout -b staging origin/main
   git push -u origin staging
   ```

2. **Vercel preview.** No new project required. Vercel automatically generates preview deploys for any branch push when the project is connected to the GitHub repo. The preview URL pattern is:
   `https://perfect1-portal-git-staging-<team>.vercel.app`

3. **Duplicate F33 in n8n** (later — when content automation needs staging):
   - Clone the F33 workflow → name `F33-staging`.
   - Change the GitHub commit node `branch` field from `main` → `staging`.
   - Disable the email-notification node, or point it to a dev email.
   - Schedule weekly (not daily) to avoid noise.

4. **Validation gate:** F33-staging publishes → preview URL becomes available → manual review → merge `staging` → `main` triggers prod deploy.

## What is NOT changed today

- DNS — production stays on `perfect1.co.il`.
- F33 production workflow — untouched.
- `.github/workflows/deploy.yml` — still builds on `main` only.
- Vercel project — still single `perfect1-portal` project.

## Cost

Zero. Vercel preview deploys are free for branch pushes on Hobby/Pro plans.

## When to enable

- When publishing rate climbs above 5/day and post-publish bugs become hard to revert.
- When F33 starts touching schema (categories, navigation, etc.) where mistakes cascade.

Until then, staging is overhead with no payoff.

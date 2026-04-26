# scripts/setup/ — One-Shot Setup Helpers

Scripts that perform a one-time bootstrap or migration of static
state. Not run on a schedule, not run by CI. Kept in git because they
document a real action that was taken AND may be useful again.

| Script | What | Idempotent? |
|---|---|---|
| `add-cross-category-links.cjs` | Inserts cross-category `relatedArticles` entries from authority articles into orphan categories (cities, services, maam, misui, amuta, osek-zeir). | yes — skips entries already present |
| `deploy-crm-functions.sh` | Manual `supabase functions deploy` chain for the CRM edge functions. | yes (Supabase deploy is idempotent) |

If you write a new one-shot, put it here, NOT at `scripts/` root.
The unwritten convention: scripts/setup/ scripts must be safe to run
twice.

-- Fix WF6 (SEO Article Writer) schema mismatches
-- 1. seo_runs: add 'article_writer' to run_type, 'error' to status
ALTER TABLE seo_runs DROP CONSTRAINT IF EXISTS seo_runs_run_type_check;
ALTER TABLE seo_runs ADD CONSTRAINT seo_runs_run_type_check
  CHECK (run_type IN ('daily_sync','opportunity_detection','content_ideas','internal_links','weekly_report','article_writer'));

ALTER TABLE seo_runs DROP CONSTRAINT IF EXISTS seo_runs_status_check;
ALTER TABLE seo_runs ADD CONSTRAINT seo_runs_status_check
  CHECK (status IN ('running','success','partial','failed','error'));

-- 2. seo_content_ideas: add 'pending','dismissed' to status, add notes column,
--    add source_page_url alias, add internal_links alias
ALTER TABLE seo_content_ideas DROP CONSTRAINT IF EXISTS seo_content_ideas_status_check;
ALTER TABLE seo_content_ideas ADD CONSTRAINT seo_content_ideas_status_check
  CHECK (status IN ('new','pending','approved','rejected','drafted','published','dismissed'));

ALTER TABLE seo_content_ideas ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add source_page_url as alias for parent_page_url (for WF6 compatibility)
ALTER TABLE seo_content_ideas ADD COLUMN IF NOT EXISTS source_page_url TEXT;
UPDATE seo_content_ideas SET source_page_url = parent_page_url WHERE source_page_url IS NULL;

-- Add internal_links as alias for internal_links_json (WF6 reads idea.internal_links)
ALTER TABLE seo_content_ideas ADD COLUMN IF NOT EXISTS internal_links JSONB DEFAULT '[]';
UPDATE seo_content_ideas SET internal_links = internal_links_json WHERE internal_links IS NULL OR internal_links = '[]';

-- 3. Allow 'pending' as initial status for WF3-created ideas
-- (WF3 should set status='pending' when creating ideas for WF6 to pick up)
-- Also allow direct inserts with status='pending'
-- (already covered by constraint above)

-- 4. Create a test pending idea if none exists (for QA)
INSERT INTO seo_content_ideas (
  parent_page_url, source_page_url, target_query, suggested_article_title,
  search_intent, suggested_angle, why_it_matters,
  internal_links_json, internal_links,
  priority_score, status
)
SELECT
  '/osek-patur', '/osek-patur',
  'ביטוח לאומי עוסק פטור',
  'ביטוח לאומי לעוסק פטור — המדריך המלא לשנת 2026',
  'informational',
  'מדריך מקיף על תשלומי ביטוח לאומי לעוסק פטור, כולל סכומים, מועדים ופטורים',
  'שאלה נפוצה מאוד בקרב עוסקים פטורים — כמה משלמים ומתי',
  '["/osek-patur/limit", "/osek-patur/expenses"]',
  '["/osek-patur/limit", "/osek-patur/expenses"]',
  85, 'pending'
WHERE NOT EXISTS (
  SELECT 1 FROM seo_content_ideas WHERE status = 'pending' LIMIT 1
);

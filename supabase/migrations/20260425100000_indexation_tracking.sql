-- Add indexation tracking columns to seo_published_articles
-- For check-indexation-status.cjs daily job

ALTER TABLE seo_published_articles
  ADD COLUMN IF NOT EXISTS indexed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_indexation_check TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS coverage_state TEXT;

CREATE INDEX IF NOT EXISTS idx_seo_published_indexed_at ON seo_published_articles(indexed_at);
CREATE INDEX IF NOT EXISTS idx_seo_published_check ON seo_published_articles(last_indexation_check DESC);

COMMENT ON COLUMN seo_published_articles.indexed_at IS 'First time GSC confirmed URL is indexed';
COMMENT ON COLUMN seo_published_articles.last_indexation_check IS 'Last time we ran inspect_url against GSC';
COMMENT ON COLUMN seo_published_articles.coverage_state IS 'Latest coverageState from GSC URL Inspection';

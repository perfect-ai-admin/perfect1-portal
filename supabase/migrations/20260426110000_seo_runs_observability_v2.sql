-- seo_runs_observability_v2
-- Adds 6 new columns + 2 indexes to the existing seo_runs table.
-- Idempotent — safe to re-run.

ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS script TEXT;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS ideas_processed INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS passed_gate INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS failed_gate INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS published INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS errors INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_seo_runs_started_at ON seo_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_runs_script ON seo_runs(script);

COMMENT ON COLUMN seo_runs.script IS 'name of the script that ran (e.g. bulk-request-indexing)';
COMMENT ON COLUMN seo_runs.ideas_processed IS 'how many candidate ideas a run consumed';
COMMENT ON COLUMN seo_runs.passed_gate IS 'ideas that passed the quality gate';
COMMENT ON COLUMN seo_runs.failed_gate IS 'ideas rejected by the quality gate';
COMMENT ON COLUMN seo_runs.published IS 'articles successfully committed to GitHub';
COMMENT ON COLUMN seo_runs.errors IS 'count of fatal errors during the run';

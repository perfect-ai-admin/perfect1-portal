-- SEO automation observability columns.
-- Adds metrics + status tracking to seo_runs so report-metrics.cjs and
-- cross-script error handling can record success/failure consistently.
--
-- Idempotent — safe to re-run. seo_runs table itself is created elsewhere
-- (or here if it doesn't exist yet, as a minimal schema).

CREATE TABLE IF NOT EXISTS seo_runs (
  id BIGSERIAL PRIMARY KEY,
  script TEXT,
  status TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS script TEXT;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS ideas_processed INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS passed_gate INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS failed_gate INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS published INT DEFAULT 0;
ALTER TABLE seo_runs ADD COLUMN IF NOT EXISTS errors INT DEFAULT 0;

-- Indexes for the report queries (last-7-days slice).
CREATE INDEX IF NOT EXISTS idx_seo_runs_started_at ON seo_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_runs_script ON seo_runs(script);

COMMENT ON COLUMN seo_runs.ideas_processed IS 'how many candidate ideas a run consumed';
COMMENT ON COLUMN seo_runs.passed_gate IS 'ideas that passed the quality gate';
COMMENT ON COLUMN seo_runs.failed_gate IS 'ideas rejected by the quality gate';
COMMENT ON COLUMN seo_runs.published IS 'articles successfully committed to GitHub';
COMMENT ON COLUMN seo_runs.errors IS 'count of fatal errors during the run';

-- SEO Automation System
-- Tables for Google Search Console data, opportunities, content ideas, and internal links

-- 1. seo_pages_daily
CREATE TABLE IF NOT EXISTS seo_pages_daily (
  id BIGSERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(6,4) NOT NULL DEFAULT 0,
  avg_position NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_url, date)
);
CREATE INDEX IF NOT EXISTS idx_seo_pages_daily_date ON seo_pages_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_pages_daily_page ON seo_pages_daily(page_url);

-- 2. seo_queries_daily
CREATE TABLE IF NOT EXISTS seo_queries_daily (
  id BIGSERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  query TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(6,4) NOT NULL DEFAULT 0,
  avg_position NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_url, query, date)
);
CREATE INDEX IF NOT EXISTS idx_seo_queries_daily_date ON seo_queries_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_queries_daily_page ON seo_queries_daily(page_url);
CREATE INDEX IF NOT EXISTS idx_seo_queries_daily_query ON seo_queries_daily(query);

-- 3. seo_opportunities
CREATE TABLE IF NOT EXISTS seo_opportunities (
  id BIGSERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN (
    'rising_page', 'near_page_one', 'high_imp_low_ctr', 'cluster_traction', 'commercial_intent'
  )),
  title TEXT NOT NULL,
  summary TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','reviewed','approved','rejected','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_status ON seo_opportunities(status, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_opportunities_page ON seo_opportunities(page_url);

-- 4. seo_content_ideas
CREATE TABLE IF NOT EXISTS seo_content_ideas (
  id BIGSERIAL PRIMARY KEY,
  parent_page_url TEXT NOT NULL,
  opportunity_id BIGINT REFERENCES seo_opportunities(id) ON DELETE SET NULL,
  target_query TEXT NOT NULL,
  suggested_article_title TEXT NOT NULL,
  search_intent TEXT CHECK (search_intent IN ('informational','commercial','transactional','navigational')),
  suggested_angle TEXT,
  why_it_matters TEXT,
  internal_links_json JSONB DEFAULT '[]',
  priority_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved','rejected','drafted','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_seo_ideas_status ON seo_content_ideas(status, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_ideas_parent ON seo_content_ideas(parent_page_url);

-- 5. seo_internal_link_suggestions
CREATE TABLE IF NOT EXISTS seo_internal_link_suggestions (
  id BIGSERIAL PRIMARY KEY,
  source_page_url TEXT NOT NULL,
  target_page_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  reason TEXT,
  priority_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved','rejected','implemented')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_page_url, target_page_url, anchor_text)
);
CREATE INDEX IF NOT EXISTS idx_seo_links_status ON seo_internal_link_suggestions(status, priority_score DESC);

-- 6. seo_runs
CREATE TABLE IF NOT EXISTS seo_runs (
  id BIGSERIAL PRIMARY KEY,
  run_type TEXT NOT NULL CHECK (run_type IN ('daily_sync','opportunity_detection','content_ideas','internal_links','weekly_report')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','success','partial','failed')),
  notes TEXT,
  error_log TEXT,
  total_pages_processed INTEGER DEFAULT 0,
  total_opportunities_found INTEGER DEFAULT 0,
  total_ideas_created INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_seo_runs_started ON seo_runs(started_at DESC);

-- RLS
ALTER TABLE seo_pages_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_queries_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_content_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_internal_link_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_seo_pages" ON seo_pages_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_seo_queries" ON seo_queries_daily FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_seo_opps" ON seo_opportunities FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_seo_ideas" ON seo_content_ideas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_seo_links" ON seo_internal_link_suggestions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_seo_runs" ON seo_runs FOR ALL TO service_role USING (true) WITH CHECK (true);

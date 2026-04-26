-- SEO Automation Tables Migration
-- Run this in Supabase SQL editor

-- 1. Audit log for all SEO workflow runs
CREATE TABLE IF NOT EXISTS seo_runs (
  id SERIAL PRIMARY KEY,
  run_type TEXT NOT NULL, -- 'daily_sync' | 'opportunity_detection' | 'content_ideas' | 'internal_linking' | 'weekly_report'
  status TEXT NOT NULL DEFAULT 'running', -- 'running' | 'success' | 'failed'
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  total_pages_processed INT,
  total_opportunities_found INT,
  error_log TEXT,
  notes TEXT
);

-- 2. Daily snapshots per page
CREATE TABLE IF NOT EXISTS seo_pages_daily (
  id SERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  avg_position FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seo_pages_daily_unique UNIQUE (page_url, date)
);

CREATE INDEX IF NOT EXISTS idx_seo_pages_date ON seo_pages_daily (date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_pages_url ON seo_pages_daily (page_url);

-- 3. Daily snapshots per query + page
CREATE TABLE IF NOT EXISTS seo_queries_daily (
  id SERIAL PRIMARY KEY,
  page_url TEXT NOT NULL,
  query TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr FLOAT DEFAULT 0,
  avg_position FLOAT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seo_queries_daily_unique UNIQUE (page_url, query, date)
);

CREATE INDEX IF NOT EXISTS idx_seo_queries_date ON seo_queries_daily (date DESC);
CREATE INDEX IF NOT EXISTS idx_seo_queries_url ON seo_queries_daily (page_url);
CREATE INDEX IF NOT EXISTS idx_seo_queries_position ON seo_queries_daily (avg_position);

-- 4. Detected opportunities
CREATE TABLE IF NOT EXISTS seo_opportunities (
  id SERIAL PRIMARY KEY,
  opportunity_type TEXT NOT NULL, -- 'rising_page' | 'near_page_one' | 'high_imp_low_ctr' | 'cluster_traction' | 'commercial_intent'
  page_url TEXT NOT NULL,
  query TEXT,
  avg_position FLOAT,
  impressions INT,
  ctr FLOAT,
  priority_score INT DEFAULT 0,
  details JSONB,
  status TEXT DEFAULT 'new', -- 'new' | 'reviewed' | 'dismissed'
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_opp_status ON seo_opportunities (status, priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_seo_opp_type ON seo_opportunities (opportunity_type);
CREATE INDEX IF NOT EXISTS idx_seo_opp_detected ON seo_opportunities (detected_at DESC);

-- 5. AI-generated content ideas
CREATE TABLE IF NOT EXISTS seo_content_ideas (
  id SERIAL PRIMARY KEY,
  opportunity_id INT REFERENCES seo_opportunities(id) ON DELETE SET NULL,
  source_page_url TEXT NOT NULL,
  target_query TEXT NOT NULL,
  suggested_article_title TEXT NOT NULL,
  search_intent TEXT DEFAULT 'informational', -- 'informational' | 'commercial' | 'transactional'
  suggested_angle TEXT,
  why_it_matters TEXT,
  internal_links JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'published' | 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_ideas_status ON seo_content_ideas (status);
CREATE INDEX IF NOT EXISTS idx_seo_ideas_intent ON seo_content_ideas (search_intent);

-- 6. Internal linking suggestions
CREATE TABLE IF NOT EXISTS seo_internal_link_suggestions (
  id SERIAL PRIMARY KEY,
  content_idea_id INT REFERENCES seo_content_ideas(id) ON DELETE SET NULL,
  source_page_url TEXT NOT NULL,
  target_page_url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'implemented' | 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT seo_links_unique UNIQUE (source_page_url, target_page_url, anchor_text)
);

CREATE INDEX IF NOT EXISTS idx_seo_links_status ON seo_internal_link_suggestions (status);

-- Grant access to service role
GRANT ALL ON seo_runs TO service_role;
GRANT ALL ON seo_pages_daily TO service_role;
GRANT ALL ON seo_queries_daily TO service_role;
GRANT ALL ON seo_opportunities TO service_role;
GRANT ALL ON seo_content_ideas TO service_role;
GRANT ALL ON seo_internal_link_suggestions TO service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

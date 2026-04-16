-- Track auto-published articles for daily limit enforcement
CREATE TABLE IF NOT EXISTS seo_published_articles (
  id BIGSERIAL PRIMARY KEY,
  idea_id BIGINT REFERENCES seo_content_ideas(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  git_commit_sha TEXT,
  word_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, slug)
);

CREATE INDEX idx_seo_published_created ON seo_published_articles(created_at DESC);

ALTER TABLE seo_published_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_all_seo_published" ON seo_published_articles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- RPC: pick next ideas to publish (respects daily limit)
CREATE OR REPLACE FUNCTION get_seo_ideas_to_publish(max_per_day INTEGER DEFAULT 3)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  published_today INTEGER;
  available_slots INTEGER;
  result JSONB;
BEGIN
  -- Count how many articles we already published today
  SELECT COUNT(*) INTO published_today
  FROM seo_published_articles
  WHERE created_at >= (CURRENT_DATE);

  available_slots := max_per_day - published_today;

  IF available_slots <= 0 THEN
    RETURN jsonb_build_object(
      'published_today', published_today,
      'available_slots', 0,
      'ideas', '[]'::jsonb,
      'reason', 'daily_limit_reached'
    );
  END IF;

  -- Pick top N unpublished ideas by priority
  WITH picked AS (
    SELECT
      i.id,
      i.parent_page_url,
      i.target_query,
      i.suggested_article_title,
      i.search_intent,
      i.suggested_angle,
      i.why_it_matters,
      i.internal_links_json,
      i.priority_score
    FROM seo_content_ideas i
    WHERE i.status = 'new'
      AND NOT EXISTS (
        SELECT 1 FROM seo_published_articles pa
        WHERE pa.idea_id = i.id
      )
    ORDER BY i.priority_score DESC, i.created_at DESC
    LIMIT available_slots
  )
  SELECT jsonb_build_object(
    'published_today', published_today,
    'available_slots', available_slots,
    'ideas', COALESCE(jsonb_agg(row_to_json(picked)), '[]'::jsonb)
  ) INTO result
  FROM picked;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_seo_ideas_to_publish(INTEGER) TO service_role, authenticated, anon;

-- RPC to mark an idea as published (called after successful git push)
CREATE OR REPLACE FUNCTION mark_seo_idea_published(
  p_idea_id BIGINT,
  p_category TEXT,
  p_slug TEXT,
  p_title TEXT,
  p_file_path TEXT,
  p_git_sha TEXT,
  p_word_count INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_id BIGINT;
BEGIN
  INSERT INTO seo_published_articles
    (idea_id, category, slug, title, file_path, git_commit_sha, word_count)
  VALUES
    (p_idea_id, p_category, p_slug, p_title, p_file_path, p_git_sha, p_word_count)
  RETURNING id INTO new_id;

  UPDATE seo_content_ideas
  SET status = 'published'
  WHERE id = p_idea_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_seo_idea_published(BIGINT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER)
  TO service_role, authenticated, anon;

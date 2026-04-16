-- SEO daily summary RPC for WhatsApp daily report
CREATE OR REPLACE FUNCTION get_seo_daily_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH
  top_queries_today AS (
    SELECT query, SUM(impressions) as impressions, SUM(clicks) as clicks,
           AVG(avg_position) as avg_position
    FROM seo_queries_daily
    WHERE date >= (CURRENT_DATE - INTERVAL '3 days')
    GROUP BY query
    ORDER BY impressions DESC
    LIMIT 15
  ),
  new_opps AS (
    SELECT page_url, opportunity_type, title, priority_score
    FROM seo_opportunities
    WHERE created_at >= (NOW() - INTERVAL '24 hours')
    ORDER BY priority_score DESC
    LIMIT 10
  ),
  new_ideas AS (
    SELECT parent_page_url, target_query, suggested_article_title, priority_score
    FROM seo_content_ideas
    WHERE created_at >= (NOW() - INTERVAL '24 hours')
    ORDER BY priority_score DESC
    LIMIT 10
  ),
  new_links AS (
    SELECT source_page_url, target_page_url, anchor_text
    FROM seo_internal_link_suggestions
    WHERE created_at >= (NOW() - INTERVAL '24 hours')
    LIMIT 10
  ),
  stats_data AS (
    SELECT
      (SELECT COUNT(DISTINCT page_url) FROM seo_pages_daily) as total_pages,
      (SELECT COUNT(DISTINCT query) FROM seo_queries_daily) as total_queries,
      (SELECT COUNT(*) FROM seo_opportunities WHERE status = 'new') as active_opportunities,
      (SELECT COUNT(*) FROM seo_content_ideas) as total_ideas
  )
  SELECT jsonb_build_object(
    'top_queries', (SELECT COALESCE(jsonb_agg(row_to_json(tq)), '[]'::jsonb) FROM top_queries_today tq),
    'new_opportunities', (SELECT COALESCE(jsonb_agg(row_to_json(no)), '[]'::jsonb) FROM new_opps no),
    'new_content_ideas', (SELECT COALESCE(jsonb_agg(row_to_json(ni)), '[]'::jsonb) FROM new_ideas ni),
    'new_link_suggestions', (SELECT COALESCE(jsonb_agg(row_to_json(nl)), '[]'::jsonb) FROM new_links nl),
    'stats', (SELECT row_to_json(s) FROM stats_data s)
  ) INTO result;

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_seo_daily_summary() TO service_role, anon, authenticated;

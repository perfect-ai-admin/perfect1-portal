-- Migration: Add 'source' column for multi-tenancy separation
-- Separates data between '5bisnes' (main) and 'sales_portal' projects
-- Date: 2026-03-28

-- ============================================================
-- Tables that need source separation (project-specific data)
-- ============================================================

-- Leads & CRM
ALTER TABLE IF EXISTS leads ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS customers ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS crm_leads ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS followup_leads ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS followup_sequences ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS close_osek_patur_crm ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Sales
ALTER TABLE IF EXISTS sales_interactions ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS sales_insights ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS sales_metrics ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS sales_scripts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Content & Marketing
ALTER TABLE IF EXISTS blog_posts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS landing_pages ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS campaigns ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS content_suggestions ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS competitor_data ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- SEO
ALTER TABLE IF EXISTS seo_config ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS seo_logs ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS sitemap_urls ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS link_reports ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS page_quality_analyses ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS page_snapshots ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Communication
ALTER TABLE IF EXISTS conversations ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS conversation_messages ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Activity & Reports
ALTER TABLE IF EXISTS activity_log ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS escalation_alerts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS weekly_reports ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Digital Cards
ALTER TABLE IF EXISTS digital_cards ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS card_clicks ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Business Journey
ALTER TABLE IF EXISTS business_state ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS business_journeys ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Goals
ALTER TABLE IF EXISTS daily_focus ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS goal_interactions ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS goal_steps ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS customer_goals ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS goals ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- AI Agents
ALTER TABLE IF EXISTS ai_agents ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS agent_prompt_templates ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Billing & Payments
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS billing_documents ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS cart_items ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS purchased_products ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS credit_ledger ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Accounting
ALTER TABLE IF EXISTS accounting_documents ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS accounting_expenses ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS accounting_customers ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS accounting_connections ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS finbot_audit_log ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Logo
ALTER TABLE IF EXISTS logo_projects ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS logo_generations ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- Misc
ALTER TABLE IF EXISTS saved_works ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS presentations ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS stickers ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS partnerships ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS user_accounts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS oauth_tokens ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;
ALTER TABLE IF EXISTS system_components ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'main' NOT NULL;

-- ============================================================
-- Indexes for the source column
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_customers_source ON customers(source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON crm_leads(source);
CREATE INDEX IF NOT EXISTS idx_followup_leads_source ON followup_leads(source);
CREATE INDEX IF NOT EXISTS idx_followup_sequences_source ON followup_sequences(source);
CREATE INDEX IF NOT EXISTS idx_close_osek_patur_crm_source ON close_osek_patur_crm(source);
CREATE INDEX IF NOT EXISTS idx_sales_interactions_source ON sales_interactions(source);
CREATE INDEX IF NOT EXISTS idx_sales_insights_source ON sales_insights(source);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_source ON sales_metrics(source);
CREATE INDEX IF NOT EXISTS idx_sales_scripts_source ON sales_scripts(source);
CREATE INDEX IF NOT EXISTS idx_blog_posts_source ON blog_posts(source);
CREATE INDEX IF NOT EXISTS idx_landing_pages_source ON landing_pages(source);
CREATE INDEX IF NOT EXISTS idx_campaigns_source ON campaigns(source);
CREATE INDEX IF NOT EXISTS idx_content_suggestions_source ON content_suggestions(source);
CREATE INDEX IF NOT EXISTS idx_competitor_data_source ON competitor_data(source);
CREATE INDEX IF NOT EXISTS idx_seo_config_source ON seo_config(source);
CREATE INDEX IF NOT EXISTS idx_seo_logs_source ON seo_logs(source);
CREATE INDEX IF NOT EXISTS idx_sitemap_urls_source ON sitemap_urls(source);
CREATE INDEX IF NOT EXISTS idx_link_reports_source ON link_reports(source);
CREATE INDEX IF NOT EXISTS idx_page_quality_analyses_source ON page_quality_analyses(source);
CREATE INDEX IF NOT EXISTS idx_page_snapshots_source ON page_snapshots(source);
CREATE INDEX IF NOT EXISTS idx_conversations_source ON conversations(source);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_source ON conversation_messages(source);
CREATE INDEX IF NOT EXISTS idx_activity_log_source ON activity_log(source);
CREATE INDEX IF NOT EXISTS idx_escalation_alerts_source ON escalation_alerts(source);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_source ON weekly_reports(source);
CREATE INDEX IF NOT EXISTS idx_digital_cards_source ON digital_cards(source);
CREATE INDEX IF NOT EXISTS idx_card_clicks_source ON card_clicks(source);
CREATE INDEX IF NOT EXISTS idx_business_state_source ON business_state(source);
CREATE INDEX IF NOT EXISTS idx_business_journeys_source ON business_journeys(source);
CREATE INDEX IF NOT EXISTS idx_daily_focus_source ON daily_focus(source);
CREATE INDEX IF NOT EXISTS idx_goal_interactions_source ON goal_interactions(source);
CREATE INDEX IF NOT EXISTS idx_goal_steps_source ON goal_steps(source);
CREATE INDEX IF NOT EXISTS idx_customer_goals_source ON customer_goals(source);
CREATE INDEX IF NOT EXISTS idx_goals_source ON goals(source);
CREATE INDEX IF NOT EXISTS idx_ai_agents_source ON ai_agents(source);
CREATE INDEX IF NOT EXISTS idx_agent_prompt_templates_source ON agent_prompt_templates(source);
CREATE INDEX IF NOT EXISTS idx_payments_source ON payments(source);
CREATE INDEX IF NOT EXISTS idx_billing_documents_source ON billing_documents(source);
CREATE INDEX IF NOT EXISTS idx_cart_items_source ON cart_items(source);
CREATE INDEX IF NOT EXISTS idx_purchased_products_source ON purchased_products(source);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_source ON credit_ledger(source);
CREATE INDEX IF NOT EXISTS idx_accounting_documents_source ON accounting_documents(source);
CREATE INDEX IF NOT EXISTS idx_accounting_expenses_source ON accounting_expenses(source);
CREATE INDEX IF NOT EXISTS idx_accounting_customers_source ON accounting_customers(source);
CREATE INDEX IF NOT EXISTS idx_accounting_connections_source ON accounting_connections(source);
CREATE INDEX IF NOT EXISTS idx_finbot_audit_log_source ON finbot_audit_log(source);
CREATE INDEX IF NOT EXISTS idx_logo_projects_source ON logo_projects(source);
CREATE INDEX IF NOT EXISTS idx_logo_generations_source ON logo_generations(source);
CREATE INDEX IF NOT EXISTS idx_saved_works_source ON saved_works(source);
CREATE INDEX IF NOT EXISTS idx_presentations_source ON presentations(source);
CREATE INDEX IF NOT EXISTS idx_stickers_source ON stickers(source);
CREATE INDEX IF NOT EXISTS idx_partnerships_source ON partnerships(source);
CREATE INDEX IF NOT EXISTS idx_user_accounts_source ON user_accounts(source);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_source ON oauth_tokens(source);
CREATE INDEX IF NOT EXISTS idx_system_components_source ON system_components(source);

-- ============================================================
-- NOTE: Tables that are SHARED (no source column needed):
-- - plans (reference data)
-- - services (reference data)
-- - professions (reference data)
-- ============================================================

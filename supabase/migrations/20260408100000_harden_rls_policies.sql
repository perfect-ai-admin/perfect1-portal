-- =============================================================
-- Security Hardening: RLS policies for perfect1-portal
-- Date: 2026-04-08
-- Adapted to actual tables in this project
-- =============================================================

-- EXISTING TABLES:
-- leads, clients, communications, tasks, documents,
-- status_history, notifications, service_catalog, lost_reasons,
-- bot_sessions, bot_events

-- =============================================================
-- LEADS — enable RLS, restrict to service_role only
-- Public anon access blocked; Edge Functions use service_role
-- =============================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop overly permissive policies if they exist
DROP POLICY IF EXISTS "leads_select_authenticated" ON leads;
DROP POLICY IF EXISTS "leads_update_authenticated" ON leads;
DROP POLICY IF EXISTS "leads_delete_authenticated" ON leads;
DROP POLICY IF EXISTS "leads_insert_public" ON leads;
DROP POLICY IF EXISTS "Enable insert for anon" ON leads;
DROP POLICY IF EXISTS "Enable read for anon" ON leads;
DROP POLICY IF EXISTS "Allow anon insert" ON leads;

-- Service role bypass (Edge Functions need full access)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'service_role_all_leads') THEN
    EXECUTE 'CREATE POLICY "service_role_all_leads" ON leads FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Allow anon INSERT only (for lead forms from the website)
CREATE POLICY "leads_anon_insert"
  ON leads FOR INSERT TO anon
  WITH CHECK (true);

-- =============================================================
-- CLIENTS — admin only via service_role
-- =============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_clients" ON clients;
CREATE POLICY "service_role_all_clients" ON clients FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- COMMUNICATIONS — admin only via service_role
-- =============================================================

ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_communications" ON communications;
CREATE POLICY "service_role_all_communications" ON communications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- TASKS — admin only via service_role
-- =============================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_tasks" ON tasks;
CREATE POLICY "service_role_all_tasks" ON tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- DOCUMENTS — admin only via service_role
-- =============================================================

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_documents" ON documents;
CREATE POLICY "service_role_all_documents" ON documents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- STATUS_HISTORY — admin only via service_role
-- =============================================================

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_status_history" ON status_history;
CREATE POLICY "service_role_all_status_history" ON status_history FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- NOTIFICATIONS — admin only via service_role
-- =============================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_notifications" ON notifications;
CREATE POLICY "service_role_all_notifications" ON notifications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- SERVICE_CATALOG — public read (filtered), admin write
-- =============================================================

ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_service_catalog" ON service_catalog;
CREATE POLICY "service_role_all_service_catalog" ON service_catalog FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_service_catalog" ON service_catalog;
CREATE POLICY "anon_read_service_catalog" ON service_catalog FOR SELECT TO anon
  USING (is_active = true);

-- =============================================================
-- LOST_REASONS — public read (filtered), admin write
-- =============================================================

ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_lost_reasons" ON lost_reasons;
CREATE POLICY "service_role_all_lost_reasons" ON lost_reasons FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_lost_reasons" ON lost_reasons;
CREATE POLICY "anon_read_lost_reasons" ON lost_reasons FOR SELECT TO anon
  USING (is_active = true);

-- =============================================================
-- BOT_SESSIONS — service_role only
-- =============================================================

ALTER TABLE bot_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_bot_sessions" ON bot_sessions;
CREATE POLICY "service_role_all_bot_sessions" ON bot_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- =============================================================
-- BOT_EVENTS — service_role only
-- =============================================================

ALTER TABLE bot_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_bot_events" ON bot_events;
CREATE POLICY "service_role_all_bot_events" ON bot_events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

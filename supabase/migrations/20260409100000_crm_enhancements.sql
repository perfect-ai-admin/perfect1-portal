-- =============================================================
-- CRM Enhancements: RLS fix, lead_notes, next_followup_date
-- Date: 2026-04-09
-- IDEMPOTENT: safe to run multiple times
-- =============================================================

-- =====================================================
-- FIX: Add authenticated policies for CRM tables
-- The hardened migration (20260408) only allowed service_role,
-- but the CRM frontend uses authenticated sessions.
-- Wrapped in DO blocks for idempotency (Postgres has no
-- CREATE POLICY IF NOT EXISTS).
-- =====================================================

DO $$ BEGIN
  -- LEADS: authenticated SELECT, INSERT, UPDATE, DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='leads_select_auth') THEN
    EXECUTE 'CREATE POLICY "leads_select_auth" ON leads FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='leads_insert_auth') THEN
    EXECUTE 'CREATE POLICY "leads_insert_auth" ON leads FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='leads_update_auth') THEN
    EXECUTE 'CREATE POLICY "leads_update_auth" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='leads' AND policyname='leads_delete_auth') THEN
    EXECUTE 'CREATE POLICY "leads_delete_auth" ON leads FOR DELETE TO authenticated USING (true)';
  END IF;

  -- COMMUNICATIONS: authenticated full access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='communications' AND policyname='comms_select_auth') THEN
    EXECUTE 'CREATE POLICY "comms_select_auth" ON communications FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='communications' AND policyname='comms_insert_auth') THEN
    EXECUTE 'CREATE POLICY "comms_insert_auth" ON communications FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='communications' AND policyname='comms_update_auth') THEN
    EXECUTE 'CREATE POLICY "comms_update_auth" ON communications FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='communications' AND policyname='comms_delete_auth') THEN
    EXECUTE 'CREATE POLICY "comms_delete_auth" ON communications FOR DELETE TO authenticated USING (true)';
  END IF;

  -- TASKS: authenticated full access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='tasks_select_auth') THEN
    EXECUTE 'CREATE POLICY "tasks_select_auth" ON tasks FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='tasks_insert_auth') THEN
    EXECUTE 'CREATE POLICY "tasks_insert_auth" ON tasks FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='tasks_update_auth') THEN
    EXECUTE 'CREATE POLICY "tasks_update_auth" ON tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='tasks' AND policyname='tasks_delete_auth') THEN
    EXECUTE 'CREATE POLICY "tasks_delete_auth" ON tasks FOR DELETE TO authenticated USING (true)';
  END IF;

  -- STATUS_HISTORY: authenticated read + insert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='status_history' AND policyname='sh_select_auth') THEN
    EXECUTE 'CREATE POLICY "sh_select_auth" ON status_history FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='status_history' AND policyname='sh_insert_auth') THEN
    EXECUTE 'CREATE POLICY "sh_insert_auth" ON status_history FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;

  -- AI_AGENTS: authenticated read (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='ai_agents' AND table_schema='public') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_agents' AND policyname='agents_select_auth') THEN
      EXECUTE 'CREATE POLICY "agents_select_auth" ON ai_agents FOR SELECT TO authenticated USING (true)';
    END IF;
  END IF;

  -- NOTIFICATIONS: authenticated read + update (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='notifications' AND table_schema='public') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notif_select_auth') THEN
      EXECUTE 'CREATE POLICY "notif_select_auth" ON notifications FOR SELECT TO authenticated USING (true)';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='notifications' AND policyname='notif_update_auth') THEN
      EXECUTE 'CREATE POLICY "notif_update_auth" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    END IF;
  END IF;
END $$;

-- =====================================================
-- ADD: next_followup_date column to leads
-- =====================================================

ALTER TABLE leads ADD COLUMN IF NOT EXISTS next_followup_date DATE;

-- =====================================================
-- CREATE: lead_notes table
-- =====================================================

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON lead_notes(lead_id, created_at DESC);

ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_notes' AND policyname='lead_notes_service_role') THEN
    EXECUTE 'CREATE POLICY "lead_notes_service_role" ON lead_notes FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_notes' AND policyname='lead_notes_select_auth') THEN
    EXECUTE 'CREATE POLICY "lead_notes_select_auth" ON lead_notes FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_notes' AND policyname='lead_notes_insert_auth') THEN
    EXECUTE 'CREATE POLICY "lead_notes_insert_auth" ON lead_notes FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_notes' AND policyname='lead_notes_update_auth') THEN
    EXECUTE 'CREATE POLICY "lead_notes_update_auth" ON lead_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='lead_notes' AND policyname='lead_notes_delete_auth') THEN
    EXECUTE 'CREATE POLICY "lead_notes_delete_auth" ON lead_notes FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;

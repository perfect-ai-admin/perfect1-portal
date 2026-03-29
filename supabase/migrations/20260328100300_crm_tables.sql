-- CRM Tables Migration
-- Extends leads + creates new CRM tables

-- ============================================
-- 1. Extend leads table
-- ============================================
ALTER TABLE leads ADD COLUMN IF NOT EXISTS agent_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'new_lead';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_entered_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_type VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lost_reason_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lost_reason_note TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_value NUMERIC(10,2);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sla_deadline TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS id_number VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_contact_channel VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS preferred_contact_time VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS temperature VARCHAR(10) DEFAULT 'warm';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS duplicate_of UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS is_spam BOOLEAN DEFAULT FALSE;

-- ============================================
-- 2. Clients table (post-conversion)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  id_number VARCHAR(20),
  business_name TEXT,
  business_type VARCHAR(50),
  agent_id UUID,
  status VARCHAR(30) DEFAULT 'active',
  service_type VARCHAR(50),
  monthly_fee NUMERIC(10,2),
  onboarding_status VARCHAR(30) DEFAULT 'pending',
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[],
  churn_reason TEXT,
  risk_flag BOOLEAN DEFAULT FALSE,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Communications table
-- ============================================
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID,
  client_id UUID,
  agent_id UUID,
  channel VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL,
  subject TEXT,
  content TEXT,
  duration_seconds INTEGER,
  outcome VARCHAR(30),
  follow_up_needed BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  next_step TEXT,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Tasks table
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type VARCHAR(50) NOT NULL,
  lead_id UUID,
  client_id UUID,
  assigned_to UUID,
  created_by UUID,
  priority VARCHAR(10) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sla_hours INTEGER,
  is_automated BOOLEAN DEFAULT FALSE,
  reminder_at TIMESTAMPTZ,
  task_category VARCHAR(50),
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Documents table
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID,
  client_id UUID,
  document_type VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  uploaded_by UUID,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expiry_date DATE,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Status History (audit log)
-- ============================================
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  old_stage VARCHAR(50),
  new_stage VARCHAR(50),
  changed_by UUID,
  change_reason TEXT,
  metadata JSONB,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Lost Reasons catalog
-- ============================================
CREATE TABLE IF NOT EXISTS lost_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  reason_text TEXT NOT NULL,
  is_recoverable BOOLEAN DEFAULT FALSE,
  recovery_action TEXT,
  follow_up_days INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. Service Catalog
-- ============================================
CREATE TABLE IF NOT EXISTS service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2),
  estimated_duration_days INTEGER,
  required_documents JSONB,
  onboarding_steps JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID,
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  entity_type VARCHAR(20),
  entity_id UUID,
  source VARCHAR(50) DEFAULT 'sales_portal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. Extend ai_agents table
-- ============================================
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS max_leads INTEGER DEFAULT 50;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS specialties TEXT[];
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS team VARCHAR(50);
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS daily_target INTEGER DEFAULT 10;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS availability_status VARCHAR(20) DEFAULT 'available';

-- ============================================
-- 11. Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_leads_agent_id ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_sla_deadline ON leads(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_leads_source_stage ON leads(source, pipeline_stage);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_agent_id ON clients(agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_source ON clients(source);

CREATE INDEX IF NOT EXISTS idx_communications_lead_id ON communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_communications_client_id ON communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_agent_id ON communications(agent_id);
CREATE INDEX IF NOT EXISTS idx_communications_source ON communications(source);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_source ON tasks(source);

CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);

CREATE INDEX IF NOT EXISTS idx_status_history_entity ON status_history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_status_history_source ON status_history(source);

CREATE INDEX IF NOT EXISTS idx_notifications_agent_id ON notifications(agent_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_source ON notifications(source);

CREATE INDEX IF NOT EXISTS idx_lost_reasons_source ON lost_reasons(source);
CREATE INDEX IF NOT EXISTS idx_service_catalog_source ON service_catalog(source);

-- ============================================
-- 12. RLS Policies
-- ============================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role bypass (edge functions use service role)
CREATE POLICY "service_role_all_clients" ON clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_communications" ON communications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_tasks" ON tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_documents" ON documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_status_history" ON status_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_lost_reasons" ON lost_reasons FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_service_catalog" ON service_catalog FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all_notifications" ON notifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Anon read for catalogs
CREATE POLICY "anon_read_lost_reasons" ON lost_reasons FOR SELECT TO anon USING (source = 'sales_portal' AND is_active = true);
CREATE POLICY "anon_read_service_catalog" ON service_catalog FOR SELECT TO anon USING (source = 'sales_portal' AND is_active = true);

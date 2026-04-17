-- Outreach System Tables Migration
-- Mini-CRM for managing outreach: link exchange, barter, collaboration, paid links

-- ============================================
-- 1. outreach_websites
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE,
  name TEXT,
  niche TEXT,
  country VARCHAR(10) DEFAULT 'IL',
  language VARCHAR(10) DEFAULT 'he',
  status VARCHAR(30) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','reviewed','approved','rejected','contacted','replied',
                      'negotiation','won','lost','do_not_contact')),
  relevance_score INTEGER DEFAULT 0 CHECK (relevance_score BETWEEN 0 AND 100),
  seo_score INTEGER,
  traffic_estimate INTEGER,
  contact_page_url TEXT,
  notes TEXT,
  added_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. outreach_contacts
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES outreach_websites(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT,
  email TEXT NOT NULL,
  contact_source VARCHAR(30) NOT NULL DEFAULT 'manual'
    CHECK (contact_source IN ('manual','public_contact_page','imported_csv')),
  source_url TEXT,
  verified_email_status VARCHAR(20) DEFAULT 'unknown'
    CHECK (verified_email_status IN ('unknown','likely_valid','bounced')),
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. outreach_email_templates
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('initial','followup','barter','paid_link','link_exchange')),
  subject_template TEXT NOT NULL,
  body_template TEXT NOT NULL,
  variables_json JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. outreach_campaigns
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  campaign_type VARCHAR(30) NOT NULL
    CHECK (campaign_type IN ('link_exchange','paid_link','barter','collaboration')),
  target_niche TEXT,
  sending_email TEXT NOT NULL DEFAULT 'noreply@one-pai.com',
  daily_send_limit INTEGER NOT NULL DEFAULT 15
    CHECK (daily_send_limit BETWEEN 1 AND 100),
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','active','paused','completed')),
  initial_template_id UUID REFERENCES outreach_email_templates(id) ON DELETE SET NULL,
  followup1_template_id UUID REFERENCES outreach_email_templates(id) ON DELETE SET NULL,
  followup2_template_id UUID REFERENCES outreach_email_templates(id) ON DELETE SET NULL,
  followup1_delay_days INTEGER DEFAULT 4,
  followup2_delay_days INTEGER DEFAULT 8,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. outreach_messages
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  website_id UUID NOT NULL REFERENCES outreach_websites(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES outreach_contacts(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  personalization_json JSONB DEFAULT '{}',
  sequence_step VARCHAR(20) NOT NULL DEFAULT 'initial'
    CHECK (sequence_step IN ('initial','followup_1','followup_2')),
  status VARCHAR(20) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','approved','sent','delivered','opened',
                      'replied','bounced','failed')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  reply_received_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  thread_id TEXT,
  external_message_id TEXT,
  resend_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. outreach_replies
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_message_id UUID REFERENCES outreach_messages(id) ON DELETE SET NULL,
  website_id UUID NOT NULL REFERENCES outreach_websites(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES outreach_contacts(id) ON DELETE SET NULL,
  direction VARCHAR(10) NOT NULL DEFAULT 'inbound'
    CHECK (direction IN ('inbound','outbound')),
  subject TEXT,
  body TEXT NOT NULL,
  sentiment VARCHAR(20) DEFAULT 'needs_review'
    CHECK (sentiment IN ('positive','neutral','negative','needs_review')),
  intent VARCHAR(30) DEFAULT 'unknown'
    CHECK (intent IN ('interested','not_interested','ask_price','ask_details',
                      'partnership','unknown')),
  ai_summary TEXT,
  ai_suggested_reply TEXT,
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. outreach_tasks
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID REFERENCES outreach_websites(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES outreach_contacts(id) ON DELETE SET NULL,
  reply_id UUID REFERENCES outreach_replies(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL
    CHECK (type IN ('review_reply','send_followup','negotiate',
                    'publish_link','check_live_link')),
  status VARCHAR(20) NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','in_progress','done')),
  assigned_to UUID,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. outreach_domain_health
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_domain_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sending_domain TEXT NOT NULL UNIQUE,
  total_sent INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  bounce_rate NUMERIC(5,4) DEFAULT 0,
  reply_rate NUMERIC(5,4) DEFAULT 0,
  spam_warning_level VARCHAR(10) DEFAULT 'low'
    CHECK (spam_warning_level IN ('low','medium','high')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_outreach_websites_status ON outreach_websites(status);
CREATE INDEX IF NOT EXISTS idx_outreach_websites_niche ON outreach_websites(niche);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_website ON outreach_contacts(website_id);
CREATE INDEX IF NOT EXISTS idx_outreach_contacts_email ON outreach_contacts(email);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_campaign ON outreach_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_status ON outreach_messages(status);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_website ON outreach_messages(website_id);
CREATE INDEX IF NOT EXISTS idx_outreach_messages_scheduled ON outreach_messages(scheduled_for)
  WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_outreach_replies_website ON outreach_replies(website_id);
CREATE INDEX IF NOT EXISTS idx_outreach_replies_message ON outreach_replies(outreach_message_id);
CREATE INDEX IF NOT EXISTS idx_outreach_tasks_status ON outreach_tasks(status);
CREATE INDEX IF NOT EXISTS idx_outreach_tasks_website ON outreach_tasks(website_id);

-- ============================================
-- RLS Policies
-- ============================================
ALTER TABLE outreach_websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_domain_health ENABLE ROW LEVEL SECURITY;

-- Service role (Edge Functions) — full access
CREATE POLICY "service_all_outreach_websites" ON outreach_websites FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_contacts" ON outreach_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_campaigns" ON outreach_campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_messages" ON outreach_messages FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_replies" ON outreach_replies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_tasks" ON outreach_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_templates" ON outreach_email_templates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_all_outreach_health" ON outreach_domain_health FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users (CRM admins) — full access (CRMLayout guards auth)
CREATE POLICY "auth_all_outreach_websites" ON outreach_websites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_contacts" ON outreach_contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_campaigns" ON outreach_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_messages" ON outreach_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_replies" ON outreach_replies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_tasks" ON outreach_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_templates" ON outreach_email_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_outreach_health" ON outreach_domain_health FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- Seed: Default email templates
-- ============================================
INSERT INTO outreach_email_templates (name, type, subject_template, body_template, variables_json) VALUES
(
  'שיתוף פעולה',
  'initial',
  'שיתוף פעולה אפשרי בין האתרים שלנו',
  E'היי {{name}},\n\nראיתי את האתר שלכם בנושא {{niche}} ונראה שיש התאמה טובה לשיתוף פעולה.\n\nיש לנו אתר בתחום ניהול עסקים ופיננסים לעצמאים (perfect1.co.il), וחשבתי לבדוק אם רלוונטי מבחינתכם:\n\n- שיתוף תוכן\n- החלפת קישורים איכותית\n- ברטר\n- שיתוף פעולה מסחרי\n\nאם זה מעניין, אשמח לשלוח רעיון קצר ומדויק שמתאים אליכם.\n\nתודה,\n{{signature}}',
  '["name", "niche", "signature"]'::jsonb
),
(
  'ברטר',
  'barter',
  'רעיון לברטר שיכול להתאים לכם',
  E'היי {{name}},\n\nעברתי על האתר שלכם וראיתי שיש חיבור טוב לתחום שלנו.\n\nחשבתי להציע ברטר פשוט שיכול לתת ערך לשני הצדדים, בלי לסבך תהליך:\n{{value_proposition}}\n\nאם זה נשמע לכם רלוונטי, אשלח כיוון מסודר ב-2-3 נקודות.\n\nתודה,\n{{signature}}',
  '["name", "value_proposition", "signature"]'::jsonb
),
(
  'מעקב ראשון',
  'followup',
  'רק מוודא שההודעה הגיעה',
  E'היי {{name}},\n\nרק קופץ לבדוק אם ההודעה הקודמת שלי רלוונטית לכם.\n\nאם כן, אשמח לשלוח הצעה קצרה ומדויקת.\nאם לא, הכל טוב ואעצור כאן.\n\nתודה,\n{{signature}}',
  '["name", "signature"]'::jsonb
),
(
  'החלפת קישורים',
  'link_exchange',
  'הצעה להחלפת קישורים איכותית',
  E'היי {{name}},\n\nשמי יוסי מפרפקט וואן — אתר המדריכים המוביל לעצמאים בישראל.\n\nראיתי שהאתר שלכם ({{domain}}) עוסק ב-{{niche}} ויש חפיפה טבעית לתוכן שלנו.\n\nחשבתי להציע החלפת קישורים איכותית:\n- אנחנו נקשר אליכם מתוך מאמר רלוונטי באתר שלנו\n- אתם תקשרו אלינו ממאמר מתאים אצלכם\n\nאם מעניין, אשלח דוגמאות ספציפיות.\n\nתודה,\n{{signature}}',
  '["name", "domain", "niche", "signature"]'::jsonb
);

-- Seed: Default domain health entry
INSERT INTO outreach_domain_health (sending_domain, total_sent, total_replied, total_bounced)
VALUES ('one-pai.com', 0, 0, 0)
ON CONFLICT (sending_domain) DO NOTHING;

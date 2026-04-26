-- Platform connections
CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  platform VARCHAR(30) NOT NULL CHECK (platform IN ('facebook','instagram','tiktok','youtube','linkedin','pinterest','google_business','telegram')),
  platform_account_id TEXT NOT NULL,
  platform_account_name TEXT,
  platform_account_type VARCHAR(30),
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','expired','revoked','error','limited')),
  last_checked_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}',
  connected_by UUID REFERENCES auth.users(id),
  connected_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, platform, platform_account_id)
);
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_connections_workspace ON platform_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_connections_platform ON platform_connections(platform, status);

-- Media assets
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  uploader_id UUID REFERENCES auth.users(id),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT,
  width INTEGER,
  height INTEGER,
  duration_sec NUMERIC(8,2),
  alt_text TEXT,
  tags TEXT[],
  folder TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft','active','paused','completed','archived')),
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  title TEXT,
  base_caption TEXT,
  media_asset_ids UUID[],
  goal VARCHAR(30) CHECK (goal IN ('awareness','engagement','lead_generation','traffic','sales','authority')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','scheduled','publishing','published','partial','failed','cancelled')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  approval_status VARCHAR(20) DEFAULT 'not_required' CHECK (approval_status IN ('not_required','pending','approved','rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  ai_generated BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_posts_workspace ON posts(workspace_id, status, scheduled_at DESC);

-- Post variants
CREATE TABLE IF NOT EXISTS post_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  media_asset_ids UUID[],
  format VARCHAR(30) DEFAULT 'feed' CHECK (format IN ('feed','story','reel','short','pin','local_post','message')),
  platform_config JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','queued','publishing','published','failed','skipped')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  platform_post_id TEXT,
  platform_post_url TEXT,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE post_variants ENABLE ROW LEVEL SECURITY;

-- Publish jobs
CREATE TABLE IF NOT EXISTS publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES post_variants(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id),
  idempotency_key TEXT UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued','processing','done','failed','dead')),
  attempt_number INTEGER DEFAULT 1,
  max_attempts INTEGER DEFAULT 4,
  next_attempt_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE publish_jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_jobs_queued ON publish_jobs(next_attempt_at) WHERE status = 'queued';

-- Publish logs
CREATE TABLE IF NOT EXISTS publish_logs (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID REFERENCES publish_jobs(id),
  variant_id UUID REFERENCES post_variants(id),
  event VARCHAR(50) NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE publish_logs ENABLE ROW LEVEL SECURITY;

-- Error logs
CREATE TABLE IF NOT EXISTS error_logs (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  connection_id UUID REFERENCES platform_connections(id),
  variant_id UUID REFERENCES post_variants(id),
  error_type VARCHAR(50) NOT NULL,
  error_code VARCHAR(50),
  error_message TEXT,
  context JSONB DEFAULT '{}',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Post analytics
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES post_variants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform VARCHAR(30) NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  impressions BIGINT DEFAULT 0,
  reach BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  clicks BIGINT DEFAULT 0,
  video_views BIGINT DEFAULT 0,
  watch_time_sec BIGINT DEFAULT 0,
  engagement_rate NUMERIC(6,4),
  raw_data JSONB DEFAULT '{}'
);
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Account analytics
CREATE TABLE IF NOT EXISTS account_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES platform_connections(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  followers BIGINT,
  following BIGINT,
  profile_views BIGINT,
  reach BIGINT,
  raw_data JSONB DEFAULT '{}',
  UNIQUE(connection_id, date)
);
ALTER TABLE account_analytics ENABLE ROW LEVEL SECURITY;

-- Billing plans
CREATE TABLE IF NOT EXISTS billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  price_monthly NUMERIC(10,2) NOT NULL,
  price_yearly NUMERIC(10,2),
  currency VARCHAR(10) DEFAULT 'USD',
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features JSONB DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;

INSERT INTO billing_plans (name, display_name, price_monthly, price_yearly, limits, sort_order) VALUES
('starter', 'Starter', 19.00, 190.00, '{"posts_per_month": 30, "connections": 3, "brands": 1, "products": 5, "ai_credits": 50, "members": 1, "storage_mb": 500}', 1),
('pro', 'Pro', 49.00, 490.00, '{"posts_per_month": 150, "connections": 10, "brands": 5, "products": 25, "ai_credits": 300, "members": 5, "storage_mb": 5000}', 2),
('agency', 'Agency', 99.00, 990.00, '{"posts_per_month": -1, "connections": 30, "brands": 20, "products": 100, "ai_credits": 1000, "members": 20, "storage_mb": 50000}', 3),
('enterprise', 'Enterprise', 299.00, 2990.00, '{"posts_per_month": -1, "connections": -1, "brands": -1, "products": -1, "ai_credits": -1, "members": -1, "storage_mb": -1}', 4)
ON CONFLICT (name) DO NOTHING;

-- Workspace subscriptions
CREATE TABLE IF NOT EXISTS workspace_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  plan_name VARCHAR(30) NOT NULL DEFAULT 'starter',
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status VARCHAR(30) DEFAULT 'trialing' CHECK (status IN ('trialing','active','past_due','cancelled','paused')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE workspace_subscriptions ENABLE ROW LEVEL SECURITY;

-- Usage events
CREATE TABLE IF NOT EXISTS usage_events (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  quantity INTEGER DEFAULT 1,
  period_month DATE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Post templates
CREATE TABLE IF NOT EXISTS post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  template_name TEXT NOT NULL,
  base_caption TEXT,
  cta TEXT,
  hashtags TEXT[],
  platform_overrides JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;

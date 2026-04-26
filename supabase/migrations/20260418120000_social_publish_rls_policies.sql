-- Helper: check workspace membership
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get workspace role
CREATE OR REPLACE FUNCTION workspace_role(ws_id UUID)
RETURNS VARCHAR AS $$
  SELECT role FROM workspace_members
  WHERE workspace_id = ws_id AND user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-add owner as member on workspace creation
CREATE OR REPLACE FUNCTION auto_add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_add_workspace_owner ON workspaces;
CREATE TRIGGER trg_auto_add_workspace_owner
  AFTER INSERT ON workspaces
  FOR EACH ROW EXECUTE FUNCTION auto_add_workspace_owner();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_workspaces_updated_at ON workspaces;
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON workspaces FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_brands_updated_at ON brands;
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_connections_updated_at ON platform_connections;
CREATE TRIGGER trg_connections_updated_at BEFORE UPDATE ON platform_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_posts_updated_at ON posts;
CREATE TRIGGER trg_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_variants_updated_at ON post_variants;
CREATE TRIGGER trg_variants_updated_at BEFORE UPDATE ON post_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS: workspaces
CREATE POLICY "members_select_workspaces" ON workspaces FOR SELECT USING (is_workspace_member(id));
CREATE POLICY "owner_update_workspaces" ON workspaces FOR UPDATE USING (workspace_role(id) IN ('owner','admin'));
CREATE POLICY "authenticated_insert_workspaces" ON workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "owner_delete_workspaces" ON workspaces FOR DELETE USING (owner_id = auth.uid());

-- RLS: workspace_members
CREATE POLICY "members_select_members" ON workspace_members FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "admin_manage_members" ON workspace_members FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin'));

-- RLS: brands
CREATE POLICY "members_select_brands" ON brands FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_manage_brands" ON brands FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin','editor'));

-- RLS: products
CREATE POLICY "members_select_products" ON products FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_manage_products" ON products FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin','editor'));

-- RLS: platform_connections
CREATE POLICY "members_select_connections" ON platform_connections FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "admin_manage_connections" ON platform_connections FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin'));

-- RLS: media_assets
CREATE POLICY "members_select_media" ON media_assets FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_manage_media" ON media_assets FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin','editor'));

-- RLS: campaigns
CREATE POLICY "members_select_campaigns" ON campaigns FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_manage_campaigns" ON campaigns FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin','editor'));

-- RLS: posts
CREATE POLICY "members_select_posts" ON posts FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_manage_posts" ON posts FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin','editor'));

-- RLS: post_variants
CREATE POLICY "members_select_variants" ON post_variants FOR SELECT USING (
  post_id IN (SELECT id FROM posts WHERE is_workspace_member(workspace_id))
);
CREATE POLICY "editors_insert_variants" ON post_variants FOR INSERT WITH CHECK (
  post_id IN (SELECT id FROM posts WHERE workspace_role(workspace_id) IN ('owner','admin','editor'))
);
CREATE POLICY "editors_update_variants" ON post_variants FOR UPDATE USING (
  post_id IN (SELECT id FROM posts WHERE workspace_role(workspace_id) IN ('owner','admin','editor'))
);
CREATE POLICY "editors_delete_variants" ON post_variants FOR DELETE USING (
  post_id IN (SELECT id FROM posts WHERE workspace_role(workspace_id) IN ('owner','admin','editor'))
);

-- RLS: publish_jobs (read-only for members via variant join)
CREATE POLICY "members_select_jobs" ON publish_jobs FOR SELECT USING (
  workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
  OR variant_id IN (
    SELECT pv.id FROM post_variants pv JOIN posts p ON pv.post_id = p.id WHERE is_workspace_member(p.workspace_id)
  )
);

-- RLS: publish_logs
CREATE POLICY "members_select_publish_logs" ON publish_logs FOR SELECT USING (
  variant_id IN (
    SELECT pv.id FROM post_variants pv JOIN posts p ON pv.post_id = p.id WHERE is_workspace_member(p.workspace_id)
  )
);

-- RLS: error_logs
CREATE POLICY "members_select_error_logs" ON error_logs FOR SELECT USING (
  workspace_id IS NULL OR is_workspace_member(workspace_id)
);

-- RLS: audit_logs
CREATE POLICY "members_select_audit" ON audit_logs FOR SELECT USING (is_workspace_member(workspace_id));

-- Ensure notifications table has user_id (may exist as CRM table without it)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- RLS: notifications
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- RLS: post_analytics
CREATE POLICY "members_select_analytics" ON post_analytics FOR SELECT USING (is_workspace_member(workspace_id));

-- RLS: account_analytics
CREATE POLICY "members_select_account_analytics" ON account_analytics FOR SELECT USING (is_workspace_member(workspace_id));

-- RLS: billing_plans (public read)
CREATE POLICY "public_read_plans" ON billing_plans FOR SELECT USING (true);

-- RLS: workspace_subscriptions
CREATE POLICY "members_select_subscription" ON workspace_subscriptions FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "owner_manage_subscription" ON workspace_subscriptions FOR ALL USING (workspace_role(workspace_id) = 'owner');

-- RLS: usage_events
CREATE POLICY "members_select_usage" ON usage_events FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_insert_usage" ON usage_events FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

-- RLS: post_templates
CREATE POLICY "members_select_templates" ON post_templates FOR SELECT USING (is_workspace_member(workspace_id));
CREATE POLICY "editors_manage_templates" ON post_templates FOR ALL USING (workspace_role(workspace_id) IN ('owner','admin','editor'));

-- Auto-populate workspace_id on publish_jobs
CREATE OR REPLACE FUNCTION set_publish_job_workspace()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.workspace_id IS NULL THEN
    SELECT p.workspace_id INTO NEW.workspace_id
    FROM post_variants pv JOIN posts p ON pv.post_id = p.id WHERE pv.id = NEW.variant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_publish_job_workspace ON publish_jobs;
CREATE TRIGGER trg_set_publish_job_workspace BEFORE INSERT ON publish_jobs FOR EACH ROW EXECUTE FUNCTION set_publish_job_workspace();

-- Dequeue RPC with FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION dequeue_publish_jobs(batch_limit INT DEFAULT 10)
RETURNS SETOF publish_jobs AS $$
  UPDATE publish_jobs SET status = 'processing', started_at = now()
  WHERE id IN (
    SELECT id FROM publish_jobs WHERE status = 'queued' AND next_attempt_at <= now()
    ORDER BY next_attempt_at ASC FOR UPDATE SKIP LOCKED LIMIT batch_limit
  ) RETURNING *;
$$ LANGUAGE sql;

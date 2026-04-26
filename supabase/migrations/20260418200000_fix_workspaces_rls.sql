-- Fix workspaces INSERT policy: add TO authenticated role
DROP POLICY IF EXISTS "authenticated_insert_workspaces" ON workspaces;
CREATE POLICY "authenticated_insert_workspaces" ON workspaces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Fix workspace_members: FOR ALL with only USING clause doesn't cover INSERT
-- The trigger auto_add_workspace_owner is SECURITY DEFINER so it runs as the
-- function owner (postgres / service_role) which bypasses RLS by default.
-- However, if the function owner doesn't bypass RLS we need an explicit INSERT policy.
-- Split the admin_manage_members policy into SELECT/UPDATE/DELETE + separate INSERT.
DROP POLICY IF EXISTS "admin_manage_members" ON workspace_members;

-- Admins/owners can SELECT, UPDATE, DELETE members
CREATE POLICY "admin_manage_members" ON workspace_members
  FOR SELECT USING (workspace_role(workspace_id) IN ('owner','admin'));

CREATE POLICY "admin_update_members" ON workspace_members
  FOR UPDATE USING (workspace_role(workspace_id) IN ('owner','admin'));

CREATE POLICY "admin_delete_members" ON workspace_members
  FOR DELETE USING (workspace_role(workspace_id) IN ('owner','admin'));

-- Allow admins/owners to INSERT new members (WITH CHECK required for INSERT)
CREATE POLICY "admin_insert_members" ON workspace_members
  FOR INSERT TO authenticated
  WITH CHECK (workspace_role(workspace_id) IN ('owner','admin'));

-- Allow the SECURITY DEFINER trigger to insert the owner row on workspace creation.
-- The trigger runs as the function definer (postgres role) which already bypasses RLS,
-- but if it runs as the calling user we need this policy:
-- owner_id is written into workspace_members.user_id by the trigger with role='owner'.
-- We allow INSERT when the inserted user_id matches auth.uid() and role is 'owner'.
CREATE POLICY "self_insert_owner_member" ON workspace_members
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'owner');

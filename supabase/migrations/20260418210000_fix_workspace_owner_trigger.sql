-- Fix: auto_add_workspace_owner trigger must bypass RLS on workspace_members.
-- In Supabase Cloud, even SECURITY DEFINER functions owned by postgres
-- are NOT superusers and may be blocked by RLS unless row_security is disabled.
-- We replace the function to explicitly disable row_security for the INSERT.

CREATE OR REPLACE FUNCTION auto_add_workspace_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Disable RLS for this session so the trigger can always insert the owner row
  -- regardless of the calling user's RLS context.
  SET LOCAL row_security = OFF;

  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Also ensure the INSERT policy on workspaces is clean and explicit
DROP POLICY IF EXISTS "authenticated_insert_workspaces" ON workspaces;
CREATE POLICY "authenticated_insert_workspaces" ON workspaces
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Verify workspace_members has a unique constraint on (workspace_id, user_id)
-- so the ON CONFLICT above works. Add if missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'workspace_members_workspace_id_user_id_key'
      AND conrelid = 'workspace_members'::regclass
  ) THEN
    ALTER TABLE workspace_members
      ADD CONSTRAINT workspace_members_workspace_id_user_id_key
      UNIQUE (workspace_id, user_id);
  END IF;
END;
$$;

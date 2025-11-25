-- ============================================================================
-- FIX: Remove recursive RLS policies that cause infinite recursion
-- ============================================================================

-- 1. Drop problematic admin_users policies
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Allow authenticated users to view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- 2. Recreate admin_users policies WITHOUT recursion
-- For now, allow all authenticated users to view admin_users
-- You can restrict this later via app logic or use a security definer function
CREATE POLICY "Allow authenticated to view admin users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- 3. Recreate audit_log policies WITHOUT recursion
CREATE POLICY "Allow authenticated to view audit log"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert audit log"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Remove admin-only policy from users table if exists
-- Users should only access their own data via existing policies

-- 5. Verify policies are correct
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('users', 'admin_users', 'audit_log')
ORDER BY tablename, cmd, policyname;

-- ============================================================================
-- NOTES
-- ============================================================================
-- The infinite recursion was caused by policies that check admin status
-- by querying admin_users table, which then checks the same policy again.
--
-- This fix removes the recursive check and allows all authenticated users
-- to view admin_users and audit_log tables. You can add more restrictive
-- policies later using security definer functions or app-level checks.

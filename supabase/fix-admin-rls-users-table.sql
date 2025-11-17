-- ============================================
-- FIX: Allow admins to view all users
-- ============================================
-- This fixes the issue where admins can't see other users in admin panel
-- because RLS policy only allows users to see their own data

-- Add policy for admins to view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Verify the fix
-- ============================================
-- Check all policies on users table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'users';

-- Test query as admin (should see all users now)
SELECT id, email, account_status, created_at
FROM public.users
ORDER BY created_at DESC;

-- ============================================
-- SUCCESS!
-- ============================================
-- Admin panel should now show all users.
-- Refresh the admin page to see the changes.

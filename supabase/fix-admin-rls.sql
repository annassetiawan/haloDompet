-- ============================================
-- FIX: Admin Users RLS Policy Infinite Recursion
-- ============================================
-- Run this SQL in Supabase SQL Editor to fix admin access

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.audit_log;

-- 2. Disable RLS on admin_users (safer for small team)
-- Since admin check is already done at API level, and this table
-- only contains admin emails (not sensitive user data)
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;

-- 3. Keep RLS on audit_log but use simpler policy
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view audit log
-- (Admin check happens at API level)
CREATE POLICY "Allow authenticated users to view audit log"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert audit log
-- (Admin check happens at API level before insert)
CREATE POLICY "Allow authenticated users to insert audit log"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- Verify the fix
-- ============================================
-- Test: This should work now without infinite recursion
SELECT * FROM public.admin_users;

-- If you see results, the fix worked! ✅
-- Now go back to /admin and it should work

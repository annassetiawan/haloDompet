-- ============================================
-- FIX WALLETS RLS UPDATE POLICY
-- ============================================
-- This script ensures that users can update their own wallets
-- including resetting balances to 0

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own wallets" ON public.wallets;

-- Create new update policy that allows users to update their own wallets
CREATE POLICY "Users can update own wallets"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'wallets' AND cmd = 'UPDATE';

-- ============================================
-- Test the policy (optional - for debugging)
-- ============================================
-- You can uncomment this to test if the current user can update wallets:
-- UPDATE public.wallets
-- SET balance = 0
-- WHERE user_id = auth.uid();
--
-- If this fails, check:
-- 1. RLS is enabled: SELECT relrowsecurity FROM pg_class WHERE relname = 'wallets';
-- 2. User is authenticated: SELECT auth.uid();
-- ============================================

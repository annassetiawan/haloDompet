-- ============================================
-- FIX: Ensure users can UPDATE their own data
-- ============================================
-- This fixes the issue where onboarding save fails because
-- users cannot update their own profile in public.users table

-- 1. Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- 2. Recreate UPDATE policy with proper permissions
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Verify all RLS policies on users table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY cmd, policyname;

-- ============================================
-- 4. Test UPDATE as current user
-- ============================================
-- Try to update your own profile (should succeed)
UPDATE public.users
SET mode = 'simple'
WHERE id = auth.uid();

-- Check if update worked
SELECT id, email, mode, initial_balance, account_status
FROM public.users
WHERE id = auth.uid();

-- ============================================
-- SUCCESS!
-- ============================================
-- If the UPDATE worked, onboarding should now save data correctly.
-- Try completing onboarding again and check if data persists.

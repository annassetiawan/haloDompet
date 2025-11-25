-- ============================================================================
-- DEBUG SCRIPT: Check users table structure and data
-- ============================================================================

-- 1. Check if all columns exist
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check RLS policies
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

-- 3. Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- 4. List all triggers on users table
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
ORDER BY action_timing, event_manipulation;

-- 5. Check existing users
SELECT
  id,
  email,
  is_onboarded,
  account_status,
  trial_ends_at,
  created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- 6. Count users
SELECT COUNT(*) as total_users FROM public.users;

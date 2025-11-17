-- ============================================
-- FIX: Ensure handle_new_user trigger exists
-- ============================================
-- This fixes the issue where new users aren't appearing in admin panel
-- because the trigger wasn't firing to create their profile

-- 1. Drop and recreate the trigger to ensure it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Verify the function has the trial fields
-- (This should already be set from migration-trial-system.sql)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    account_status,
    trial_ends_at,
    trial_started_at,
    initial_balance,
    current_balance
  )
  VALUES (
    NEW.id,
    NEW.email,
    'trial',
    NOW() + INTERVAL '30 days',
    NOW(),
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING; -- In case user already exists
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Check for orphaned auth users
-- ============================================
-- Find auth users who don't have a profile in public.users
-- and create profiles for them
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN
    SELECT au.id, au.email, au.created_at
    FROM auth.users au
    LEFT JOIN public.users pu ON au.id = pu.id
    WHERE pu.id IS NULL
  LOOP
    INSERT INTO public.users (
      id,
      email,
      account_status,
      trial_ends_at,
      trial_started_at,
      initial_balance,
      current_balance
    )
    VALUES (
      auth_user.id,
      auth_user.email,
      'trial',
      NOW() + INTERVAL '30 days',
      NOW(),
      0,
      0
    )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Created profile for user: % (%)', auth_user.email, auth_user.id;
  END LOOP;
END $$;

-- ============================================
-- 4. Verify the fix
-- ============================================
-- Check if trigger exists
SELECT
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Count users
SELECT
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM public.users) as public_users;

-- Show any mismatches
SELECT
  au.id,
  au.email,
  au.created_at,
  'Missing from public.users' as issue
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see "Missing from public.users" rows above, those users
-- should now have been created by the script.
-- All future signups will automatically create profiles.

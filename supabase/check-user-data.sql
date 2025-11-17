-- ============================================
-- CHECK USER DATA IN DATABASE
-- ============================================
-- Run this to see what data is actually stored in database

-- 1. Show all users with their balance and trial info
SELECT
  id,
  email,
  initial_balance,
  current_balance,
  mode,
  account_status,
  trial_ends_at,
  created_at,
  updated_at
FROM public.users
ORDER BY created_at DESC;

-- 2. Check if the user you just tested exists
-- Replace 'YOUR_EMAIL' with your actual email
SELECT
  id,
  email,
  initial_balance,
  current_balance,
  mode,
  account_status,
  created_at,
  updated_at
FROM public.users
WHERE email = 'qwertyabcd567@gmail.com';  -- Change this to your email

-- 3. Check if there are users with NULL initial_balance
SELECT
  COUNT(*) as users_without_balance,
  email
FROM public.users
WHERE initial_balance IS NULL
GROUP BY email;

-- 4. Test UPDATE permission manually
-- This will try to update YOUR OWN profile
-- Should succeed if RLS is working correctly
UPDATE public.users
SET mode = 'simple'
WHERE id = auth.uid()
RETURNING id, email, mode, initial_balance;

-- ============================================
-- FIX: Set NULL balance for new users
-- ============================================
-- User baru harus punya initial_balance = NULL
-- supaya masuk ke onboarding dulu, bukan langsung dashboard

-- 1. Update trigger function untuk set NULL balance
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
    NULL,  -- Changed from 0 to NULL
    NULL   -- Changed from 0 to NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Update existing users who have balance = 0 to NULL
-- ============================================
-- OPTIONAL: Hanya jalankan ini kalau mau reset user yang ada
-- Kalau user sudah onboarding (balance > 0), tidak akan di-reset

-- Uncomment jika mau reset user dengan balance = 0 jadi NULL
-- UPDATE public.users
-- SET initial_balance = NULL, current_balance = NULL
-- WHERE initial_balance = 0 AND current_balance = 0;

-- ============================================
-- 3. Verify
-- ============================================
-- Check users with NULL balance (should be new users only)
SELECT
  id,
  email,
  initial_balance,
  current_balance,
  account_status,
  created_at
FROM public.users
WHERE initial_balance IS NULL
ORDER BY created_at DESC;

-- ============================================
-- SUCCESS!
-- ============================================
-- Sekarang user baru akan punya initial_balance = NULL
-- dan akan masuk ke onboarding dulu sebelum ke dashboard

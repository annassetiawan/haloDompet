-- ============================================================================
-- COMPREHENSIVE FIX: Add missing columns and update trigger
-- ============================================================================
-- This migration ensures all required columns exist and the trigger works

-- ============================================================================
-- 1. Add missing columns if they don't exist
-- ============================================================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'trial' CHECK (account_status IN ('trial', 'active', 'expired', 'blocked')),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS invited_by TEXT;

-- ============================================================================
-- 2. Create index for trial status queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_trial_status
ON public.users(account_status, trial_ends_at);

-- ============================================================================
-- 3. Update handle_new_user function to set trial fields
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    is_onboarded,
    account_status,
    trial_ends_at,
    trial_started_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,
    'trial',
    NOW() + INTERVAL '30 days',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate key error
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Update existing users who don't have trial data
-- ============================================================================
UPDATE public.users
SET
  is_onboarded = COALESCE(is_onboarded, FALSE),
  account_status = COALESCE(account_status, 'trial'),
  trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '30 days'),
  trial_started_at = COALESCE(trial_started_at, NOW())
WHERE account_status IS NULL OR trial_ends_at IS NULL;

-- ============================================================================
-- 5. Verify columns exist
-- ============================================================================
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name IN ('is_onboarded', 'account_status', 'trial_ends_at', 'trial_started_at')
ORDER BY ordinal_position;

-- ============================================================================
-- DONE!
-- ============================================================================
-- After running this:
-- 1. Try onboarding again - it should work now
-- 2. All users will have proper trial columns
-- 3. New users will auto-get trial status

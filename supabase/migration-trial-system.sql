-- ============================================
-- HALODOMPET - TRIAL SYSTEM MIGRATION
-- ============================================
-- Run this SQL in Supabase SQL Editor after running schema.sql
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ============================================
-- 1. ADD TRIAL COLUMNS TO USERS TABLE
-- ============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'trial' CHECK (account_status IN ('trial', 'active', 'expired', 'blocked')),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invited_by TEXT;

-- ============================================
-- 2. CREATE INDEX FOR TRIAL STATUS QUERIES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_trial_status
ON public.users(account_status, trial_ends_at);

-- ============================================
-- 3. UPDATE EXISTING USERS (If any)
-- ============================================
-- Set trial for existing users who don't have trial dates
UPDATE public.users
SET
  account_status = 'trial',
  trial_ends_at = NOW() + INTERVAL '30 days',
  trial_started_at = NOW()
WHERE trial_ends_at IS NULL;

-- ============================================
-- 4. UPDATE handle_new_user FUNCTION
-- ============================================
-- Auto-set trial dates when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    account_status,
    trial_ends_at,
    trial_started_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    'trial',
    NOW() + INTERVAL '30 days',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. CREATE ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for admin table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view admin table
CREATE POLICY "Admins can view admin users"
  ON public.admin_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 6. CREATE AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.admin_users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES public.users(id),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can view audit log
CREATE POLICY "Admins can view audit log"
  ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Only admins can insert audit log
CREATE POLICY "Admins can insert audit log"
  ON public.audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 7. CREATE HELPER FUNCTION TO CHECK EXPIRED TRIALS
-- ============================================
CREATE OR REPLACE FUNCTION public.check_expired_trials()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.users
  SET account_status = 'expired'
  WHERE account_status = 'trial'
    AND trial_ends_at < NOW()
    AND trial_ends_at IS NOT NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Add your admin email to admin_users table manually:
--    INSERT INTO public.admin_users (user_id, email)
--    VALUES ('your-user-id-from-auth-users', 'your-email@gmail.com');
--
-- 2. Test trial expiry by setting trial_ends_at to past date
-- 3. Verify RLS policies work correctly

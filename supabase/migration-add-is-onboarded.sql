-- ============================================
-- ADD IS_ONBOARDED COLUMN TO USERS TABLE
-- ============================================
-- This migration adds a boolean column to track whether
-- a user has completed the onboarding process.
-- This fixes the bug where users who reset their data
-- get redirected back to onboarding.

-- ============================================
-- 1. ADD is_onboarded COLUMN
-- ============================================
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT false;

-- ============================================
-- 2. SET EXISTING USERS AS ONBOARDED
-- ============================================
-- Mark all existing users with initial_balance > 0 as onboarded
-- This ensures existing users don't get sent back to onboarding
UPDATE public.users
SET is_onboarded = true
WHERE initial_balance > 0 OR initial_balance IS NOT NULL;

-- ============================================
-- 3. UPDATE handle_new_user FUNCTION
-- ============================================
-- Update the function that creates user profiles on signup
-- to set is_onboarded = false for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, is_onboarded)
  VALUES (NEW.id, NEW.email, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Summary:
-- ✅ Added is_onboarded column to users table
-- ✅ Marked all existing users as onboarded
-- ✅ Updated handle_new_user function
--
-- Next steps:
-- 1. Update app/page.tsx to check is_onboarded instead of initial_balance
-- 2. Update onboarding completion to set is_onboarded = true
-- 3. Add "Reset Data" feature in Settings
-- ============================================

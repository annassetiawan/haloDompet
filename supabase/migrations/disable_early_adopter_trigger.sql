-- ============================================================================
-- DISABLE Early Adopter Trigger (for troubleshooting)
-- ============================================================================
-- Run this if you're experiencing issues with user creation/onboarding
-- and want to temporarily disable the early adopter trigger

-- Drop the trigger (keep the function)
DROP TRIGGER IF EXISTS on_user_created_early_adopter ON public.users;

-- Note: Function will remain but won't be executed
-- To re-enable, run the early_adopter_rewards.sql migration again

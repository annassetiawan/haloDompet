-- ============================================================================
-- Skip Onboarding: Auto-complete with default values
-- ============================================================================

-- Update handle_new_user function to auto-complete onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    is_onboarded,
    account_status,
    trial_ends_at,
    trial_started_at,
    initial_balance,
    current_balance,
    mode
  )
  VALUES (
    NEW.id,
    NEW.email,
    TRUE,  -- Auto-complete onboarding
    'trial',
    NOW() + INTERVAL '30 days',
    NOW(),
    0,  -- Default initial balance
    0,  -- Default current balance
    'simple'  -- Default mode
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Update existing users to be onboarded
-- ============================================================================
UPDATE public.users
SET is_onboarded = TRUE
WHERE is_onboarded = FALSE;

-- Verify
SELECT
  id,
  email,
  is_onboarded,
  initial_balance,
  mode,
  trial_ends_at
FROM public.users
LIMIT 5;

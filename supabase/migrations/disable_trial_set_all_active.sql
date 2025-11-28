-- ============================================================================
-- DISABLE Trial System - Set All Users to Active (Unlimited Access)
-- ============================================================================
-- Description: Mengubah sistem trial menjadi unlimited free access untuk semua user
-- Created: 2025-11-28

-- ============================================================================
-- 1. DROP existing early adopter trigger
-- ============================================================================
DROP TRIGGER IF EXISTS on_user_created_early_adopter ON public.users;
DROP FUNCTION IF EXISTS public.handle_early_adopter_trial();

-- ============================================================================
-- 2. UPDATE handle_new_user FUNCTION - Set all new users to ACTIVE
-- ============================================================================
-- Semua user baru akan langsung mendapat status 'active' dengan akses unlimited

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
    'active',           -- Set to active (unlimited access)
    NULL,               -- No trial end date (unlimited)
    NOW()               -- Track when user was created
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. UPDATE existing trial users to ACTIVE (optional)
-- ============================================================================
-- Uncomment jika ingin mengubah semua existing trial users menjadi active
-- WARNING: Ini akan memberikan akses unlimited ke semua user yang sedang trial
--
-- UPDATE public.users
-- SET
--   account_status = 'active',
--   trial_ends_at = NULL
-- WHERE account_status = 'trial';

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Setelah menjalankan migration ini:
-- 1. Semua user baru akan langsung mendapat status 'active'
-- 2. Tidak ada lagi trial 30 hari
-- 3. Tidak ada lagi early adopter benefits (semua sama)
-- 4. Akses unlimited gratis untuk semua orang
--
-- Jika ingin rollback ke sistem trial:
-- - Jalankan ulang migration-trial-system.sql atau early_adopter_rewards.sql
--

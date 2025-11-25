-- Migration: Early Adopter Rewards
-- Description: Memberikan lifetime premium untuk 20 pengguna pertama
-- Created: 2025-11-25

-- ============================================================================
-- 0. CLEANUP: Drop existing trigger and function if they exist
-- ============================================================================
DROP TRIGGER IF EXISTS on_user_created_early_adopter ON public.users;
DROP FUNCTION IF EXISTS public.handle_early_adopter_trial();

-- ============================================================================
-- 1. CREATE FUNCTION: handle_early_adopter_trial
-- ============================================================================
-- Function ini akan mengecek jumlah user dan memberikan unlimited trial
-- untuk 20 pengguna pertama

CREATE OR REPLACE FUNCTION public.handle_early_adopter_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Hitung total user yang sudah ada di database
  SELECT count(*) INTO user_count FROM public.users;

  -- Jika user saat ini kurang dari 20, berikan lifetime premium
  IF user_count < 20 THEN
    -- Set trial_ends_at ke NULL (unlimited/lifetime trial)
    NEW.trial_ends_at := NULL;

    -- Log untuk debugging (opsional, bisa dihapus jika tidak diperlukan)
    RAISE NOTICE 'Early Adopter #%: Granted lifetime premium access', user_count + 1;
  ELSE
    -- User ke-21 dan seterusnya akan menggunakan default value (30 hari)
    -- Tidak perlu melakukan apa-apa, biarkan NEW.trial_ends_at apa adanya
    RAISE NOTICE 'Regular user #%: Using standard 30-day trial', user_count + 1;
  END IF;

  -- Kembalikan row yang sudah dimodifikasi
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. CREATE TRIGGER: on_user_created_early_adopter
-- ============================================================================
-- Trigger ini akan dijalankan sebelum setiap INSERT pada tabel users

CREATE TRIGGER on_user_created_early_adopter
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_early_adopter_trial();

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Cara kerja:
-- 1. Saat user baru insert ke tabel users
-- 2. Trigger on_user_created_early_adopter dijalankan BEFORE INSERT
-- 3. Function handle_early_adopter_trial() dipanggil
-- 4. Function mengecek jumlah user saat ini
-- 5. Jika < 20: set trial_ends_at = NULL (lifetime premium)
-- 6. Jika >= 20: biarkan default value database (30 hari)
-- 7. Row diinsert dengan nilai yang sudah dimodifikasi
--
-- Untuk rollback/remove trigger dan function:
-- DROP TRIGGER IF EXISTS on_user_created_early_adopter ON public.users;
-- DROP FUNCTION IF EXISTS public.handle_early_adopter_trial();
--
-- Untuk mengecek user yang mendapat early adopter benefit:
-- SELECT id, email, trial_ends_at, created_at
-- FROM public.users
-- WHERE trial_ends_at IS NULL
-- ORDER BY created_at ASC;

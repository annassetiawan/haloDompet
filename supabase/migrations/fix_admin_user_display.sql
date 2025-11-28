-- ============================================================================
-- FIX Admin User Display - Update Expired Users to Active
-- ============================================================================
-- Description: Mengubah semua user dengan status 'expired' atau 'trial' menjadi 'active'
--              untuk memberikan unlimited free access sesuai dengan sistem baru
-- Created: 2025-11-28
-- Issue: User tidak terlihat di admin panel karena RLS, dan status expired/trial
-- Solution: Update semua user ke active status dengan unlimited access

-- ============================================================================
-- 1. UPDATE all expired and trial users to ACTIVE status
-- ============================================================================
-- Memberikan unlimited access ke semua user yang sebelumnya trial atau expired
UPDATE public.users
SET
  account_status = 'active',
  trial_ends_at = NULL  -- NULL = unlimited access
WHERE account_status IN ('trial', 'expired');

-- ============================================================================
-- 2. CREATE RLS Policy untuk Admin Access
-- ============================================================================
-- Membuat policy agar admin bisa melihat semua user (tidak hanya user mereka sendiri)

-- Drop existing policy if exists
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create new policy for admin access
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    -- Allow if user is an admin
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
--
-- Run these to verify the migration worked:
--
-- 1. Check all user statuses:
-- SELECT account_status, COUNT(*) FROM public.users GROUP BY account_status;
--
-- 2. Check admin access:
-- SELECT * FROM public.admin_users;
--
-- 3. Verify active users:
-- SELECT email, account_status, trial_ends_at FROM public.users WHERE account_status = 'active';
--

-- ============================================
-- 🚨 CRITICAL SECURITY FIX: Enable RLS on admin_users
-- ============================================
-- Migration: Enable Row Level Security untuk tabel admin_users
-- Tanggal: 2025-11-20
-- Tujuan: Mencegah akses tidak sah ke data admin
--
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard
-- 2. Klik "SQL Editor" di sidebar
-- 3. Klik "New Query"
-- 4. Copy-paste seluruh script ini
-- 5. Klik "Run" atau tekan Cmd/Ctrl + Enter
-- ============================================

-- ============================================
-- STEP 1: Drop semua policy lama yang bermasalah
-- ============================================
-- Hapus policy lama yang punya circular dependency
-- atau yang terlalu permissive
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow authenticated users to view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log" ON public.audit_log;

-- ============================================
-- STEP 2: ENABLE Row Level Security
-- ============================================
-- Aktifkan RLS untuk keamanan maksimal
-- Setelah RLS enabled, default behavior = DENY ALL
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE READ POLICY (SELECT Only)
-- ============================================
-- Policy: User hanya bisa SELECT baris milik mereka sendiri
-- Logic: auth.email() harus match dengan kolom email
-- Use case: Saat login, aplikasi bisa cek "apakah email saya admin?"
CREATE POLICY "Users can view their own admin record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.email() = email);

-- ============================================
-- STEP 4: NO WRITE POLICIES
-- ============================================
-- Sengaja TIDAK dibuat policy untuk INSERT/UPDATE/DELETE
-- Artinya: DENY ALL untuk write operations
--
-- Hanya yang bisa write ke tabel ini:
-- ✅ Service Role (backend dengan service_role key)
-- ✅ Admin Supabase Dashboard (SQL Editor)
-- ❌ Client apps (meskipun authenticated)
--
-- Untuk menambah admin baru, gunakan SQL Editor:
--
-- INSERT INTO public.admin_users (email)
-- VALUES ('admin@example.com');
--
-- (user_id akan auto-populate dari auth.users berdasarkan email)

-- ============================================
-- STEP 5: FIX audit_log RLS
-- ============================================
-- Pastikan audit_log juga punya RLS yang benar
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Hanya admin yang bisa view audit log
-- Check: email user ada di tabel admin_users
CREATE POLICY "Only admins can view audit log"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE email = auth.email()
    )
  );

-- Policy: Hanya admin yang bisa insert audit log
CREATE POLICY "Only admins can insert audit log"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin_users
      WHERE email = auth.email()
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Jalankan query ini untuk verifikasi setup sudah benar

-- 1. Cek RLS status (harus TRUE)
SELECT
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE tablename IN ('admin_users', 'audit_log')
  AND schemaname = 'public';

-- Expected output:
-- | schemaname | tablename    | RLS Enabled |
-- |------------|--------------|-------------|
-- | public     | admin_users  | true        |
-- | public     | audit_log    | true        |

-- 2. Cek policies yang aktif
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as "Operation",
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies
WHERE tablename IN ('admin_users', 'audit_log')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected policies:
-- admin_users:
--   - "Users can view their own admin record" (SELECT)
-- audit_log:
--   - "Only admins can view audit log" (SELECT)
--   - "Only admins can insert audit log" (INSERT)

-- 3. Test query (hanya bisa lihat baris milik sendiri)
-- Jika email Anda bukan admin, hasilnya empty
-- Jika email Anda adalah admin, hasilnya 1 baris
SELECT * FROM public.admin_users;

-- ============================================
-- ✅ MIGRATION SELESAI!
-- ============================================
-- Security Status:
-- ✅ RLS ENABLED di admin_users
-- ✅ READ access: Hanya bisa lihat data sendiri (auth.email() = email)
-- ✅ WRITE access: DENIED (hanya service role / SQL Editor)
-- ✅ RLS ENABLED di audit_log
-- ✅ Audit log: Hanya admin yang bisa akses
--
-- Untuk menambah admin baru:
-- INSERT INTO public.admin_users (email)
-- VALUES ('newemail@example.com');
-- ============================================

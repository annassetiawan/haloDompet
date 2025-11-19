# Reset Data Feature - Troubleshooting Guide

## Error: "Failed to reset wallet balances"

Jika Anda mendapatkan error ini, ikuti langkah-langkah berikut:

### 1. Jalankan Migration SQL (WAJIB)

Anda **HARUS** menjalankan migration SQL terlebih dahulu:

#### a. Migration untuk is_onboarded
1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `supabase/migration-add-is-onboarded.sql`
3. Paste dan **Run** di SQL Editor
4. Verifikasi: Cek bahwa kolom `is_onboarded` sudah ada di tabel `users`

#### b. Fix RLS Policy untuk Wallets
1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `supabase/fix-wallets-rls-update-policy.sql`
3. Paste dan **Run** di SQL Editor
4. Verifikasi: Policy "Users can update own wallets" sudah ada

### 2. Cek Console Browser

Buka Browser Console (F12 → Console) dan lihat log saat mencoba reset data:

```
🗑️ Starting reset data process...
Response status: 500
Response data: { error: "...", details: "..." }
```

Error message detail akan muncul di console. Catat error message tersebut.

### 3. Kemungkinan Penyebab Error

#### A. RLS Policy Tidak Mengizinkan Update
**Gejala:** Error "Failed to reset wallet balances"

**Solusi:**
```sql
-- Jalankan di Supabase SQL Editor:
DROP POLICY IF EXISTS "Users can update own wallets" ON public.wallets;

CREATE POLICY "Users can update own wallets"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### B. Migration is_onboarded Belum Dijalankan
**Gejala:** User terlempar ke onboarding setelah reset

**Solusi:** Jalankan migration `supabase/migration-add-is-onboarded.sql`

#### C. Trigger auto_update_wallet_balance Bermasalah
**Gejala:** Error saat delete transactions

**Solusi:**
```sql
-- Cek trigger:
SELECT * FROM pg_trigger WHERE tgname = 'auto_update_wallet_balance';

-- Jika trigger tidak ada, jalankan migration:
-- supabase/migration-multi-wallet-phase-1.sql
```

### 4. Manual Testing

#### Test 1: Cek RLS Policy
```sql
-- Jalankan di Supabase SQL Editor (sebagai authenticated user):
SELECT * FROM public.wallets WHERE user_id = auth.uid();

-- Coba update:
UPDATE public.wallets
SET balance = 0
WHERE user_id = auth.uid();

-- Jika berhasil, RLS policy OK
-- Jika gagal, jalankan fix-wallets-rls-update-policy.sql
```

#### Test 2: Cek Kolom is_onboarded
```sql
-- Cek apakah kolom exists:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'is_onboarded';

-- Jika kosong, jalankan migration-add-is-onboarded.sql
```

#### Test 3: Reset Data Manual
```sql
-- Manual reset untuk debugging:
BEGIN;

-- 1. Delete transactions
DELETE FROM public.transactions WHERE user_id = auth.uid();

-- 2. Reset wallets
UPDATE public.wallets SET balance = 0 WHERE user_id = auth.uid();

-- 3. Reset user balance
UPDATE public.users SET current_balance = 0 WHERE id = auth.uid();

COMMIT;
```

### 5. Check Server Logs

Jika menjalankan development server, cek terminal logs:

```
🗑️ Resetting all data for user: ...
Found 2 wallets to reset
✅ All transactions deleted
Error resetting wallet balances: ...
```

Error details akan muncul di terminal.

### 6. Restart Development Server

Setelah menjalankan migration SQL:

```bash
# Stop server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart server
npm run dev
```

### 7. Masih Bermasalah?

Jika masih error setelah langkah di atas:

1. Copy **SEMUA** error message dari:
   - Browser Console (F12 → Console)
   - Network tab (F12 → Network → reset request)
   - Terminal/Server logs

2. Check database state:
```sql
-- Cek jumlah wallets user:
SELECT COUNT(*) FROM public.wallets WHERE user_id = auth.uid();

-- Cek jumlah transactions:
SELECT COUNT(*) FROM public.transactions WHERE user_id = auth.uid();

-- Cek user profile:
SELECT id, email, is_onboarded, current_balance FROM public.users WHERE id = auth.uid();
```

3. Share error details untuk debugging lebih lanjut.

## Quick Fix Checklist

- [ ] Jalankan `supabase/migration-add-is-onboarded.sql`
- [ ] Jalankan `supabase/fix-wallets-rls-update-policy.sql`
- [ ] Restart development server
- [ ] Clear browser cache dan reload page
- [ ] Cek browser console untuk error details
- [ ] Test reset data lagi

## Prevention

Untuk mencegah masalah di production:

1. **Selalu jalankan migration** sebelum deploy fitur baru
2. **Test di development** terlebih dahulu
3. **Backup data** sebelum reset (jika production)
4. **Monitoring**: Setup error logging untuk track reset failures

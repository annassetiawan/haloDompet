# Reset Data Feature - Troubleshooting Guide

## Error: "tuple to be updated was already modified by an operation triggered by the current command"

Ini adalah error trigger conflict yang sudah diperbaiki dengan PostgreSQL function.

## Setup Instructions (WAJIB)

Anda **HARUS** menjalankan 3 migration SQL berikut:

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

#### c. Create Reset User Data Function (PENTING!)
1. Buka Supabase Dashboard → SQL Editor
2. Copy isi file `supabase/create-reset-user-data-function.sql`
3. Paste dan **Run** di SQL Editor
4. Verifikasi: Function `reset_user_data` sudah dibuat

**Catatan:** Function ini mengatasi trigger conflict dengan cara disable trigger sementara saat reset data.

### 2. Cek Console Browser

Buka Browser Console (F12 → Console) dan lihat log saat mencoba reset data:

```
🗑️ Starting reset data process...
Response status: 500
Response data: { error: "...", details: "..." }
```

Error message detail akan muncul di console. Catat error message tersebut.

### 3. Kemungkinan Penyebab Error

#### A. Function reset_user_data Belum Dibuat
**Gejala:** Error "function reset_user_data does not exist"

**Solusi:** Jalankan migration `supabase/create-reset-user-data-function.sql`

#### B. Trigger Conflict (FIXED)
**Gejala:** Error "tuple to be updated was already modified by an operation triggered by the current command"

**Solusi:** Error ini sudah diperbaiki dengan PostgreSQL function yang disable trigger sementara. Pastikan Anda sudah menjalankan `create-reset-user-data-function.sql`

#### C. RLS Policy Tidak Mengizinkan Update
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
- [ ] Jalankan `supabase/create-reset-user-data-function.sql` (PENTING!)
- [ ] Restart development server
- [ ] Clear browser cache dan reload page
- [ ] Cek browser console untuk error details
- [ ] Test reset data lagi

## How Reset Data Works (Technical)

The reset process uses a PostgreSQL function `reset_user_data()` that:

1. **Loops through each transaction** and deletes one by one
2. Each DELETE triggers `auto_update_wallet_balance` separately (no batch conflict)
3. After all deletions, **force reset wallet balances** to 0
4. **Resets user balance** to 0

### Why One-by-One?

**Batch DELETE Problem:**
```sql
-- This causes conflict:
DELETE FROM transactions WHERE user_id = 'xxx';
-- Trigger fires for ALL rows in single statement
-- Multiple transactions with same wallet_id → tries to UPDATE same wallet multiple times
-- PostgreSQL: "tuple already modified" error
```

**FOR LOOP Solution:**
```sql
-- This works:
FOR transaction_id IN SELECT id FROM transactions...
LOOP
  DELETE FROM transactions WHERE id = transaction_id;  -- Single row
  -- Trigger fires once, updates wallet
  -- Next iteration: separate statement, no conflict
END LOOP;
```

Each DELETE in the loop is a **separate statement**, so triggers don't conflict with each other.

## Prevention

Untuk mencegah masalah di production:

1. **Selalu jalankan migration** sebelum deploy fitur baru
2. **Test di development** terlebih dahulu
3. **Backup data** sebelum reset (jika production)
4. **Monitoring**: Setup error logging untuk track reset failures

# 🚀 Supabase Setup Guide - HaloDompet

Panduan lengkap setup Supabase dari awal sampai siap production.

---

## 📋 Prerequisites

- Akun Google (untuk OAuth)
- Akun Supabase (gratis): https://supabase.com
- Vercel deployment sudah jalan

---

## Step 1️⃣: Buat Supabase Project (5 menit)

### 1. Buka Supabase Dashboard
- Go to: https://supabase.com/dashboard
- Login dengan GitHub/Google

### 2. Create New Project
- Klik **"New Project"**
- Isi form:
  ```
  Organization: [pilih atau buat baru]
  Name: halodompet
  Database Password: [buat password kuat, SIMPAN INI!]
  Region: Southeast Asia (Singapore)
  ```
- Klik **"Create new project"**
- Tunggu ~2 menit (setup database)

### 3. Dapatkan API Credentials
Setelah project ready:

1. Klik **"Settings"** (icon ⚙️ di sidebar kiri bawah)
2. Klik **"API"**
3. Copy credentials ini:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   ```

---

## Step 2️⃣: Setup Google OAuth (10 menit)

### 1. Buka Google Cloud Console
- Go to: https://console.cloud.google.com
- Login dengan akun Google

### 2. Create New Project (atau pakai existing)
- Klik dropdown project di top bar
- Klik **"New Project"**
- Name: `HaloDompet`
- Klik **"Create"**

### 3. Enable Google+ API
- Di sidebar: **APIs & Services** > **Library**
- Search: "Google+ API"
- Klik hasil pertama
- Klik **"Enable"**

### 4. Configure OAuth Consent Screen (LENGKAP - JANGAN SKIP!)
- Di sidebar: **APIs & Services** > **OAuth consent screen**
- User Type: **External**
- Klik **"Create"**

**⚠️ PENTING: Isi form dengan LENGKAP, jangan skip field apapun!**

Fill in form:
```
App name: HaloDompet
User support email: [your email]

App domain (opsional tapi disarankan):
  Application home page: https://your-app.vercel.app
  Application privacy policy link: https://your-app.vercel.app
  Application terms of service link: https://your-app.vercel.app

Authorized domains:
  vercel.app
  supabase.co

Developer contact information:
  Email addresses: [your email]
```

- Klik **"Save and Continue"**

**Scopes (WAJIB):**
- Klik **"Add or Remove Scopes"**
- Cari dan centang scopes ini:
  - ✅ `.../auth/userinfo.email`
  - ✅ `.../auth/userinfo.profile`
  - ✅ `openid`
- Klik **"Update"**
- Klik **"Save and Continue"**

**Test Users (WAJIB untuk Testing mode):**
- Klik **"+ Add Users"**
- Masukkan **email Google Anda** yang akan login (e.g., `yourname@gmail.com`)
- Klik **"Add"**
- Klik **"Save and Continue"**
- Review summary
- Klik **"Back to Dashboard"**

**📌 Catatan:**
- App akan dalam status **"Testing"** - ini normal
- **HANYA test users yang bisa login** saat mode Testing
- Untuk production (semua orang bisa login), nanti perlu "Publish App"

### 5. Create OAuth 2.0 Credentials
**⚠️ CRITICAL: Redirect URI harus PERSIS dari Supabase!**

**BEFORE creating credentials, get the callback URL from Supabase:**

1. **Buka Supabase Dashboard dulu**
2. Go to: **Authentication** > **Providers**
3. Scroll ke **Google** (belum perlu enable)
4. **COPY** the **"Callback URL (for OAuth)"**:
   ```
   Format: https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
   ```
   **SIMPAN URL INI!** ← Akan dipakai di step berikutnya

**NOW create Google OAuth credentials:**

- Di Google Console sidebar: **APIs & Services** > **Credentials**
- Klik **"+ Create Credentials"** > **OAuth client ID**

Fill in:
```
Application type: Web application
Name: HaloDompet Web

Authorized JavaScript origins:
  - https://xxxxxxxxxxxxx.supabase.co

Authorized redirect URIs:
  - https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
```

**⚠️ SANGAT PENTING:**
- Paste PERSIS callback URL yang di-copy dari Supabase
- JANGAN tambahkan Vercel domain di sini (tidak perlu!)
- JANGAN typo di `/auth/v1/callback` (harus lowercase, dengan /v1/)
- Ganti `xxxxxxxxxxxxx` dengan Supabase project ID Anda

- Klik **"Create"**
- **COPY** Client ID dan Client Secret (akan muncul popup)

### 6. Configure di Supabase - Google Provider
Kembali ke Supabase Dashboard:

1. Go to: **Authentication** > **Providers**
2. Scroll ke **Google**
3. Toggle **ON** (enabled)
4. Paste:
   ```
   Client ID: [dari Google Console]
   Client Secret: [dari Google Console]
   ```
5. Klik **"Save"**

### 7. Configure Site URL & Redirect URLs
**PENTING:** Ini langkah yang sering terlewat dan menyebabkan redirect ke localhost!

1. Go to: **Authentication** > **URL Configuration**
2. Set **Site URL**:
   ```
   https://your-app.vercel.app
   ```
   *Ganti dengan domain Vercel Anda!*

3. Set **Redirect URLs** (tambahkan semua):
   ```
   https://your-app.vercel.app/**
   http://localhost:3000/**
   ```
   *Klik "Add URL" untuk setiap entry*

4. Klik **"Save"**

**Penjelasan:**
- **Site URL** = domain utama production Anda
- **Redirect URLs** = semua domain yang boleh redirect setelah login
- Wildcard `/**` mengizinkan semua path di domain tersebut

---

## Step 3️⃣: Setup Database Schema (3 menit)

### 1. Buka SQL Editor
- Di Supabase sidebar kiri: **SQL Editor**
- Klik **"New Query"**

### 2. Copy-Paste Schema
- Buka file: `supabase/schema.sql` (di project)
- Copy **SEMUA** isi file
- Paste ke SQL Editor
- Klik **"Run"** atau tekan `Ctrl/Cmd + Enter`

### 3. Verify Tables Created
Run query ini untuk verifikasi:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Harusnya muncul:
- `users`
- `transactions`

### 4. Check Triggers & RLS
```sql
-- Check triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

Semua table harusnya punya `rowsecurity = true`

---

## Step 4️⃣: Configure Environment Variables (2 menit)

### Di Vercel Dashboard:

1. Buka: https://vercel.com/dashboard
2. Pilih project **halodompet**
3. Go to: **Settings** > **Environment Variables**

### Tambahkan 3 variables:

#### 1. GEMINI_API_KEY
```
Name: GEMINI_API_KEY
Value: [your existing Gemini API key]
Environment: Production, Preview, Development
```

#### 2. NEXT_PUBLIC_SUPABASE_URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxx.supabase.co
Environment: Production, Preview, Development
```

#### 3. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGc... [anon key dari Supabase]
Environment: Production, Preview, Development
```

### Klik **"Save"**

### Redeploy
- Go to: **Deployments** tab
- Klik **⋯** (3 dots) pada deployment terakhir
- Klik **"Redeploy"**
- Tunggu ~2 menit

---

## Step 5️⃣: Testing (5 menit)

### 1. Test Login
- Buka deployed URL: https://halodompet.vercel.app
- Should redirect to `/login`
- Klik **"Login dengan Google"**
- Pilih akun Google
- Should redirect to `/onboarding`

### 2. Test Onboarding
- Isi saldo awal: `1000000`
- Pilih mode: **Simple** atau **Webhook**
- Klik **"Mulai"**
- Should redirect to `/` (dashboard)

### 3. Verify Database
Kembali ke Supabase:
- Go to: **Table Editor** > **users**
- Should see 1 row with your email

### 4. Test Voice Recording
- Di dashboard, klik tombol rekam (mic button)
- Allow microphone access
- Ucapkan: **"Beli kopi dua lima ribu"**
- Should see success message

### 5. Check Transaction Saved
- Klik icon **History** (📜)
- Should see transaksi "Beli kopi" - Rp 25,000

Di Supabase:
- Go to: **Table Editor** > **transactions**
- Should see 1 row

### 6. Check Balance Updated
- Back to dashboard (/)
- Balance should show: Rp 975,000 (1,000,000 - 25,000)

---

## ✅ Setup Complete Checklist

- [ ] Supabase project created
- [ ] Google OAuth configured
- [ ] Database schema executed
- [ ] Tables created (users, transactions)
- [ ] RLS policies enabled
- [ ] Triggers created
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] Login works
- [ ] Onboarding works
- [ ] Voice recording works
- [ ] Transaction saved to database
- [ ] Balance auto-updates

---

## 🐛 Troubleshooting

### 🚨 "Error 400: redirect_uri_mismatch" (MOST COMMON!)
**Pesan error:**
```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

**Penyebab:** Redirect URI di Google Console tidak match dengan callback URL Supabase

**Fix (Step-by-step):**

1. **Dapatkan Callback URL dari Supabase:**
   - Go to: Supabase Dashboard > **Authentication** > **Providers**
   - Scroll ke **Google**
   - Copy **"Callback URL (for OAuth)"**
   - Format: `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`

2. **Update Google Cloud Console:**
   - Go to: **APIs & Services** > **Credentials**
   - Klik **OAuth Client ID** yang sudah dibuat
   - Di **Authorized redirect URIs**, pastikan ada PERSIS:
     ```
     https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback
     ```
   - **HAPUS** redirect URI lain jika ada (e.g., Vercel domain)
   - Klik **"Save"**

3. **Common Mistakes:**
   - ❌ Typo: `auth/V1/callback` (huruf besar V)
   - ❌ Typo: `auth/callback` (tanpa /v1/)
   - ❌ Salah domain: pakai Vercel domain bukan Supabase
   - ❌ HTTP instead of HTTPS
   - ✅ Correct: `https://xxxxx.supabase.co/auth/v1/callback`

4. **Wait & Test:**
   - Tunggu 1-2 menit
   - Clear cache atau buka Incognito
   - Coba login lagi

### 🚨 "Access blocked: This app's request is invalid" (without redirect_uri error)
**Penyebab:** OAuth Consent Screen tidak dikonfigurasi lengkap atau Test User belum ditambahkan

**Fix (Step-by-step):**

1. **Cek Status App di Google Console:**
   - Go to: APIs & Services > OAuth consent screen
   - Pastikan status: **"Testing"** atau **"In production"**
   - Jika belum ada status, konfigurasi belum selesai!

2. **Tambahkan Test Users (WAJIB saat Testing mode):**
   - Di halaman OAuth consent screen
   - Scroll ke bagian **"Test users"**
   - Klik **"+ Add Users"**
   - Masukkan email Google yang akan login (e.g., `yourname@gmail.com`)
   - Klik **"Save"**

3. **Pastikan Scopes Sudah Benar:**
   - Kembali ke OAuth consent screen
   - Klik **"Edit App"**
   - Di step "Scopes", pastikan ada:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Klik **"Update"** dan **"Save and Continue"**

4. **Cek Authorized Domains:**
   - Di OAuth consent screen
   - Pastikan **Authorized domains** ada:
     - `vercel.app`
     - `supabase.co`

5. **Wait & Retry:**
   - Tunggu 5 menit setelah perubahan
   - Clear browser cache atau buka Incognito
   - Coba login lagi

6. **Jika masih error, coba Publish App:**
   - Go to: OAuth consent screen
   - Klik **"Publish App"**
   - Confirm **"Prepare for verification"**
   - Status berubah jadi "In production"
   - Sekarang semua orang bisa login (tidak perlu test users)

### 🚨 Login redirect ke localhost:3000
**Penyebab:** Redirect URLs belum dikonfigurasi dengan benar

**Fix (Step-by-step):**

1. **Google Cloud Console:**
   - Go to: APIs & Services > Credentials
   - Klik OAuth Client ID yang sudah dibuat
   - Di **Authorized redirect URIs**, pastikan ada:
     ```
     https://xxxxx.supabase.co/auth/v1/callback
     https://your-app.vercel.app/auth/callback
     ```
   - Klik **"Save"**

2. **Supabase Dashboard:**
   - Go to: Authentication > URL Configuration
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:**
     ```
     https://your-app.vercel.app/**
     http://localhost:3000/**
     ```
   - Klik **"Save"**

3. **Test lagi** - refresh page dan coba login

### Error: "Unauthorized" saat login
**Fix:**
1. Check Google OAuth redirect URI di Google Console
2. Harus ada: `https://xxxxx.supabase.co/auth/v1/callback`
3. Pastikan Client ID dan Secret sudah benar di Supabase

### Error: "relation users does not exist"
**Fix:**
1. Re-run SQL schema di Supabase SQL Editor
2. Check schema file: `supabase/schema.sql`

### Error: Voice recording tidak menyimpan
**Fix:**
1. Check browser console (F12)
2. Pastikan environment variables sudah set
3. Redeploy di Vercel

### Error: Balance tidak update
**Fix:**
1. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger
   WHERE tgname = 'auto_update_balance';
   ```
2. Re-run schema jika trigger tidak ada

---

## 📊 Verify Setup with SQL

Run these queries di Supabase SQL Editor:

```sql
-- 1. Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. Check your user exists
SELECT id, email, initial_balance, current_balance, mode
FROM public.users;

-- 3. Check transactions
SELECT id, item, amount, category, date
FROM public.transactions
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- 5. Verify balance calculation
SELECT
  u.email,
  u.initial_balance,
  u.current_balance,
  u.initial_balance - u.current_balance as total_spent,
  (SELECT COUNT(*) FROM transactions WHERE user_id = u.id) as transaction_count
FROM users u;
```

---

## 🎯 Quick Commands

### Reset Everything (DANGER!)
```sql
-- DROP semua (hati-hati!)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Re-run schema.sql setelah ini
```

### View Recent Activity
```sql
SELECT
  t.created_at,
  t.item,
  t.amount,
  t.category,
  u.email
FROM transactions t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC
LIMIT 10;
```

### Check User's Balance
```sql
SELECT
  email,
  initial_balance,
  current_balance,
  (initial_balance - current_balance) as spent
FROM users;
```

---

## 📞 Support

Jika masih error:

1. **Check Vercel Logs:**
   - Vercel Dashboard > Deployment > View Function Logs

2. **Check Supabase Logs:**
   - Supabase Dashboard > Logs (sidebar)

3. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for errors in Console tab

4. **Verify Environment Variables:**
   ```bash
   # Di local, check .env.local
   cat .env.local

   # Should have:
   GEMINI_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

---

## 🎉 Done!

Setelah semua step ini, HaloDompet sudah **production-ready**:

✅ Authentication working
✅ Database connected
✅ Voice recording saving to DB
✅ Balance auto-calculating
✅ History showing data
✅ Reports working
✅ Settings functional

**Happy tracking! 💰🎤**

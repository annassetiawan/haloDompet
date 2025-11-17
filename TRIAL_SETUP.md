# HaloDompet - Trial System Setup Guide

## 🚀 Quick Start

Sistem trial otomatis memberikan akses 30 hari kepada setiap user baru yang signup dengan Google.

---

## 📋 Setup Steps

### 1. Run Database Migration

Buka Supabase Dashboard → SQL Editor → New Query

Copy dan paste isi file `supabase/migration-trial-system.sql`, lalu klik **Run**.

Migration ini akan:
- ✅ Menambah kolom trial ke tabel `users`
- ✅ Membuat index untuk performa
- ✅ Update function `handle_new_user()` agar auto-set trial 30 hari
- ✅ Membuat tabel `admin_users` dan `audit_log`

### 2. Fix RLS Policy (IMPORTANT!)

Ada bug di RLS policy yang menyebabkan infinite recursion. Jalankan fix ini:

**Buka Supabase Dashboard → SQL Editor → New Query**

Copy dan paste isi file `supabase/fix-admin-rls.sql`, lalu klik **Run**.

Fix ini akan:
- ✅ Disable RLS di tabel `admin_users` (aman karena cuma isi email admin)
- ✅ Fix policy di `audit_log` table
- ✅ Menghilangkan infinite recursion error

**Verify:** Jalankan `SELECT * FROM public.admin_users;` - harus berhasil tanpa error.

### 3. Add Admin User
### 4. Add Admin User

Setelah migration selesai, tambahkan diri kamu sebagai admin:

```sql
-- Ganti dengan user_id dan email kamu dari auth.users
INSERT INTO public.admin_users (user_id, email)
VALUES ('your-user-id-here', 'your-email@gmail.com');
```

**Cara dapat user_id:**
1. Login ke aplikasi dengan Google
2. Buka Supabase Dashboard → Authentication → Users
3. Copy UUID kamu

### 5. Test Trial System

1. **New User Signup:**
   - Logout dari aplikasi
   - Login dengan email Google baru
   - Setelah onboarding, cek toast: "Trial 30 hari aktif 🎉"
   - Cek database: `trial_ends_at` harus otomatis terisi

2. **Trial Warning Banner:**
   - Update user di database: set `trial_ends_at` jadi 5 hari dari sekarang
   - Reload dashboard
   - Harus muncul warning banner kuning di atas

3. **Trial Expired:**
   - Update user: set `trial_ends_at` jadi kemarin
   - Reload dashboard
   - Harus redirect ke `/trial-expired`

4. **Admin Panel:**
   - Akses `/admin`
   - Harus lihat daftar semua users
   - Test extend trial, activate, dan block

---

## 🔧 How It Works

### User Flow
```
User signup Google
  ↓
Supabase trigger: handle_new_user()
  ↓
Auto-create profile dengan:
  - account_status = 'trial'
  - trial_ends_at = NOW() + 30 days
  - trial_started_at = NOW()
  ↓
User complete onboarding
  ↓
Toast: "Trial 30 hari aktif 🎉"
  ↓
User bisa akses app selama 30 hari
```

### Trial Check Flow
```
User akses dashboard
  ↓
loadUserProfile()
  ↓
Check: isTrialExpired()?
  YES → Redirect /trial-expired
  NO → Continue
  ↓
Check: shouldShowWarning()?
  YES → Show warning banner
  NO → Normal dashboard
```

### Admin Actions
- **Extend Trial:** Perpanjang trial_ends_at +30 hari
- **Activate:** Set account_status = 'active' (unlimited access)
- **Block:** Set account_status = 'blocked' (no access)

---

## 📁 File Structure

```
supabase/
  ├── schema.sql                    # Original schema
  └── migration-trial-system.sql    # Trial system migration ✨

lib/
  └── trial.ts                      # Helper functions untuk trial

components/
  ├── trial-guard.tsx               # Server component untuk check trial
  └── trial-warning-banner.tsx      # Warning banner component

app/
  ├── page.tsx                      # Dashboard dengan trial check
  ├── onboarding/page.tsx           # Toast "Trial 30 hari aktif"
  ├── trial-expired/page.tsx        # Halaman trial habis ✨
  └── admin/
      └── page.tsx                  # Admin panel ✨

app/api/admin/
  ├── extend-trial/route.ts         # API extend trial
  ├── activate-user/route.ts        # API activate user
  └── block-user/route.ts           # API block user

types/
  └── index.ts                      # Updated User interface
```

---

## 🎯 Admin Panel Features

**URL:** `/admin`

**Access:** Hanya user di tabel `admin_users`

**Features:**
- ✅ View all users dengan trial status
- ✅ Extend trial (+30 days)
- ✅ Activate user (unlimited access)
- ✅ Block user (no access)
- ✅ Audit log (semua actions tercatat)

**Desktop View:** Table dengan semua info
**Mobile View:** Cards dengan actions

---

## ⚙️ Configuration

### Environment Variables (Optional)

Tidak ada env var tambahan yang diperlukan. Semuanya otomatis!

### Customization

**Ubah durasi trial:**
```sql
-- Di migration-trial-system.sql, line 22
trial_ends_at = NOW() + INTERVAL '30 days'
                                  ^^ ubah ini
```

**Ubah email admin support:**
```tsx
// components/trial-warning-banner.tsx & app/trial-expired/page.tsx
mailto:support@halodompet.com
       ^^ ubah ini
```

---

## 🐛 Troubleshooting

### User tidak dapat trial otomatis
- Cek: Apakah migration sudah dijalankan?
- Cek: Apakah function `handle_new_user()` sudah updated?
- Test: Insert manual user baru di Supabase

### Warning banner tidak muncul
- Cek: Apakah `trial_ends_at` kurang dari 7 hari?
- Cek: Apakah `account_status` = 'trial'?
- Cek console browser untuk errors

### Admin panel tidak bisa diakses
- Cek: Apakah email kamu ada di `admin_users`?
- Cek: Apakah `user_id` di `admin_users` benar?
- Cek browser console untuk errors

### Trial tidak expired otomatis
- Ini normal! Cek baru dilakukan saat user login
- User harus refresh/login ulang untuk dicek
- Atau bisa setup cron job (opsional)

---

## 📊 Database Schema

### users table (updated)
```sql
id                  UUID PRIMARY KEY
email               TEXT
account_status      TEXT DEFAULT 'trial'      ✨ NEW
trial_ends_at       TIMESTAMPTZ                ✨ NEW
trial_started_at    TIMESTAMPTZ                ✨ NEW
invited_by          TEXT                       ✨ NEW
initial_balance     DECIMAL
current_balance     DECIMAL
created_at          TIMESTAMPTZ
```

### admin_users table (new)
```sql
id          UUID PRIMARY KEY
user_id     UUID REFERENCES auth.users
email       TEXT
created_at  TIMESTAMPTZ
```

### audit_log table (new)
```sql
id              UUID PRIMARY KEY
admin_id        UUID REFERENCES admin_users
action          TEXT
target_user_id  UUID REFERENCES users
old_value       JSONB
new_value       JSONB
created_at      TIMESTAMPTZ
```

---

## 🎉 You're Done!

Trial system sudah siap digunakan. Setiap user baru otomatis dapat 30 hari trial.

**Next Steps:**
1. Test dengan akun baru
2. Tambahkan admin users
3. Monitor via admin panel
4. Invite teman-teman untuk beta testing!

**Questions?** Check audit_log untuk tracking semua admin actions.

# Admin Panel Setup Guide

## Masalah yang Diperbaiki

Sebelumnya, halaman `/admin` mengalami 2 masalah:
1. **User tidak terlihat**: Row Level Security (RLS) memblokir admin untuk melihat data user lain
2. **Status expired**: User yang dibuat sebelum migrasi menunjukkan status 'expired' bukan 'active'

## Solusi yang Diimplementasikan

### 1. API Endpoint dengan Service Role
Dibuat endpoint `/api/admin/users` yang menggunakan Supabase service role key untuk bypass RLS.

**File yang ditambahkan:**
- `app/api/admin/users/route.ts` - API endpoint untuk fetch semua user
- `lib/supabase/admin.ts` - Helper untuk membuat admin client dengan service role

### 2. Update Admin Page
File `app/admin/page.tsx` diupdate untuk menggunakan API endpoint baru.

### 3. Database Migration
File `supabase/migrations/fix_admin_user_display.sql` untuk:
- Update semua user 'trial' dan 'expired' menjadi 'active'
- Menambahkan RLS policy untuk admin access

## Cara Setup

### 1. Tambahkan Service Role Key ke Environment Variables

Edit file `.env.local` dan tambahkan:

```env
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

**Cara mendapatkan Service Role Key:**
1. Buka Supabase Dashboard
2. Pergi ke Settings > API
3. Copy **service_role** key (⚠️ JANGAN gunakan anon key!)
4. Paste ke `.env.local`

⚠️ **WARNING**: Service role key memiliki akses penuh ke database. JANGAN commit ke git atau expose di client-side!

### 2. Jalankan Migration di Supabase

1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Buka file `supabase/migrations/fix_admin_user_display.sql`
4. Copy seluruh isi file
5. Paste di SQL Editor
6. Klik **Run**

Migration ini akan:
- ✅ Update semua user ke status 'active'
- ✅ Menambahkan RLS policy untuk admin

### 3. Tambahkan Admin User

Jalankan SQL berikut di Supabase SQL Editor (ganti dengan user ID dan email Anda):

```sql
INSERT INTO public.admin_users (user_id, email)
VALUES ('your-user-id-from-auth-users', 'your-email@example.com');
```

**Cara mendapatkan User ID:**
```sql
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
```

### 4. Restart Development Server

```bash
npm run dev
```

### 5. Test Admin Panel

1. Login dengan akun admin
2. Pergi ke `/admin`
3. Anda seharusnya bisa melihat semua user dengan status yang benar

## Verifikasi

Jalankan query berikut untuk verifikasi:

```sql
-- 1. Cek status semua user
SELECT account_status, COUNT(*)
FROM public.users
GROUP BY account_status;

-- 2. Cek admin users
SELECT * FROM public.admin_users;

-- 3. Cek active users
SELECT email, account_status, trial_ends_at
FROM public.users
WHERE account_status = 'active';
```

## Troubleshooting

### User masih tidak terlihat di admin panel

1. ✅ Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah ditambahkan ke `.env.local`
2. ✅ Restart development server setelah menambahkan env variable
3. ✅ Cek console browser untuk error message
4. ✅ Pastikan Anda sudah terdaftar di tabel `admin_users`

### Status user masih 'expired'

1. ✅ Pastikan migration `fix_admin_user_display.sql` sudah dijalankan
2. ✅ Jalankan manual query:
   ```sql
   UPDATE public.users
   SET account_status = 'active', trial_ends_at = NULL
   WHERE account_status IN ('trial', 'expired');
   ```

### Error "Forbidden: Not an admin"

Anda belum ditambahkan sebagai admin. Jalankan:
```sql
INSERT INTO public.admin_users (user_id, email)
VALUES ('your-user-id', 'your-email@example.com');
```

## Security Notes

- ⚠️ Service role key memberikan akses penuh ke database
- ✅ Hanya gunakan di server-side code (API routes)
- ✅ JANGAN expose di client-side
- ✅ JANGAN commit ke git
- ✅ Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke `.gitignore` pattern

## File yang Diubah

- ✅ `app/admin/page.tsx` - Update untuk menggunakan API endpoint
- ✅ `app/api/admin/users/route.ts` - New API endpoint
- ✅ `lib/supabase/admin.ts` - New admin client helper
- ✅ `supabase/migrations/fix_admin_user_display.sql` - New migration
- ✅ `.env.local.example` - Added SUPABASE_SERVICE_ROLE_KEY

# Test Login Bypass (Development Only)
# Gunakan ini untuk test tanpa login Google berkali-kali

## How to Use:

### 1. Login Sekali di Vercel Deployment
- Buka Vercel URL
- Login dengan Google
- Selesaikan onboarding

### 2. Copy Session Cookies

Di Vercel URL, buka DevTools (F12):
- Tab: **Application** → **Cookies**
- Copy nilai dari cookies berikut:
  - `sb-access-token`
  - `sb-refresh-token`

### 3. Paste di Localhost/Ngrok

Di localhost:3000 atau ngrok URL, buka DevTools (F12):
- Tab: **Console**
- Paste dan run script ini (ganti dengan cookie values kamu):

```javascript
// Replace values dengan cookie values dari Vercel
document.cookie = "sb-access-token=YOUR_ACCESS_TOKEN_HERE; path=/; domain=localhost";
document.cookie = "sb-refresh-token=YOUR_REFRESH_TOKEN_HERE; path=/; domain=localhost";

// Refresh page
location.reload();
```

### 4. Done!

Sekarang kamu sudah login di localhost tanpa perlu OAuth lagi!

---

## Permanent Fix: Update Supabase OAuth Config

Untuk permanent solution, update di Supabase Dashboard:

1. **Dashboard** → **Authentication** → **URL Configuration**
2. Tambah ke **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/**
   https://*.ngrok-free.app/**
   ```
3. **Save**

Setelah itu, Google OAuth akan work di localhost dan ngrok!

---

## Tips:

- ✅ Session cookies valid untuk beberapa hari
- ✅ Cukup copy sekali, bisa test berkali-kali
- ✅ Ga perlu quota Vercel untuk testing
- ⚠️ Cookies specific untuk domain (localhost vs ngrok berbeda)
- ⚠️ Jangan share cookies (contains auth tokens)

---

## Environment Variables Check

Pastikan juga `.env.local` sudah benar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIza...
```

Values harus sama dengan yang di Vercel!

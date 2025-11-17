# Setup Gemini AI untuk HaloDompet

## 📋 Langkah-langkah Setup

### 1️⃣ Dapatkan Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Login dengan akun Google Anda
3. Klik **"Create API Key"** atau **"Get API Key"**
4. Pilih project atau buat project baru
5. Copy API key yang muncul (format: `AIza...`)

> **💡 Tips:** Gemini API memiliki free tier yang cukup generous untuk penggunaan pribadi

### 2️⃣ Setup untuk Development (Local)

1. Copy file `.env.local.example` ke `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` dan paste API key Anda:
   ```env
   GEMINI_API_KEY=AIzaSyAbc123...YourActualAPIKey
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. Restart development server:
   ```bash
   npm run dev
   ```

### 3️⃣ Setup untuk Production (Vercel)

#### Opsi A: Via Vercel Dashboard (Recommended)

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **haloDompet**
3. Klik tab **Settings**
4. Klik **Environment Variables** di sidebar kiri
5. Tambahkan environment variable baru:
   - **Key:** `GEMINI_API_KEY`
   - **Value:** `AIzaSyAbc123...` (paste API key Anda)
   - **Environment:** Pilih **Production**, **Preview**, dan **Development**
6. Klik **Save**
7. Redeploy aplikasi:
   - Kembali ke tab **Deployments**
   - Klik titik tiga (...) pada deployment terakhir
   - Pilih **Redeploy**

#### Opsi B: Via Vercel CLI

```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login ke Vercel
vercel login

# Set environment variable
vercel env add GEMINI_API_KEY

# Saat diminta, paste API key Anda
# Pilih environment: Production, Preview, Development

# Deploy ulang
vercel --prod
```

### 4️⃣ Verifikasi Setup

#### Test di Local:
1. Buka http://localhost:3000
2. Login ke aplikasi
3. Klik icon ✨ (Sparkles) di navbar
4. Ketik pertanyaan atau klik suggested question
5. AI harus merespons dalam beberapa detik

#### Test di Production:
1. Buka URL production Anda (e.g., https://halo-dompet.vercel.app)
2. Login ke aplikasi
3. Klik icon ✨ di navbar
4. Test chat dengan AI

### 🔍 Troubleshooting

#### Error: "Failed to get response"
- ✅ Pastikan `GEMINI_API_KEY` sudah di-set
- ✅ Pastikan API key valid dan aktif
- ✅ Check Vercel logs: `vercel logs --follow`

#### Error: "API key not valid"
- ✅ Buat API key baru di Google AI Studio
- ✅ Pastikan tidak ada space atau karakter tambahan
- ✅ Pastikan menggunakan key yang benar (starts with `AIza`)

#### AI tidak merespons dengan data user
- ✅ Pastikan ada transaksi di database
- ✅ Check console untuk errors
- ✅ Pastikan Supabase connection berfungsi

### 📊 Gemini API Limits (Free Tier)

- **Rate Limit:** 60 requests per minute
- **Quota:** 1500 requests per day
- **Context Window:** 32K tokens
- **Cost:** FREE untuk penggunaan pribadi

> **💡 Tips:** Jika melebihi free tier, upgrade ke paid plan di [Google Cloud Console](https://console.cloud.google.com/)

### 🎯 Best Practices

1. **Jangan commit `.env.local`** ke git (sudah ada di `.gitignore`)
2. **Rotate API keys secara berkala** untuk keamanan
3. **Monitor usage** di Google AI Studio dashboard
4. **Set up alerts** jika mendekati quota limit
5. **Gunakan different keys** untuk development dan production

### 🔒 Security

- ✅ API key hanya disimpan di server-side
- ✅ Tidak pernah di-expose ke client
- ✅ Request dibatasi hanya untuk authenticated users
- ✅ User data tidak di-share ke pihak ketiga

### 📝 Environment Variables Checklist

Pastikan semua env variables berikut sudah di-set di Vercel:

- [x] `GEMINI_API_KEY` - untuk AI advisor
- [x] `NEXT_PUBLIC_SUPABASE_URL` - untuk database
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - untuk auth

### 🆘 Need Help?

Jika masih ada masalah:
1. Check [Gemini API Documentation](https://ai.google.dev/docs)
2. Check [Vercel Documentation](https://vercel.com/docs/environment-variables)
3. Check browser console untuk error messages
4. Check Vercel deployment logs

---

**Happy coding with AI! 🤖✨**

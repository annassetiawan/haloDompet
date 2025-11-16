# 🚀 Setup HaloDompet - Panduan Lengkap

Selamat datang! Dokumen ini akan memandu Anda untuk menjalankan HaloDompet di komputer lokal Anda.

## 📋 Prasyarat

Pastikan sudah terinstall:
- ✅ Node.js v18 atau lebih baru ([Download di sini](https://nodejs.org/))
- ✅ Git ([Download di sini](https://git-scm.com/))
- ✅ Browser Chrome (untuk Web Speech API)

---

## 🛠 Langkah 1: Clone & Install

```bash
# Clone repository (kalau belum)
git clone <URL_REPOSITORY_ANDA>
cd haloDompet

# Install dependencies
npm install
```

---

## 🔑 Langkah 2: Setup Gemini API Key

### Cara Mendapatkan API Key (GRATIS):

1. Buka [Google AI Studio](https://ai.google.dev/)
2. Klik **"Get API Key in Google AI Studio"**
3. Login dengan akun Google Anda
4. Klik **"Create API Key"**
5. Copy API key yang muncul

### Setup di Proyek:

```bash
# 1. Copy file template
cp .env.local.example .env.local

# 2. Edit file .env.local
# Ganti YOUR_API_KEY_HERE dengan API key Anda
```

File `.env.local` Anda harus terlihat seperti ini:
```
GEMINI_API_KEY=AIzaSyAaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRr
```

---

## 🎤 Langkah 3: Jalankan Development Server

```bash
npm run dev
```

Buka browser Chrome dan akses: **http://localhost:3000**

---

## 🔗 Langkah 4: Setup n8n Webhook (Opsional untuk Testing Lokal)

Untuk testing lokal, Anda bisa menggunakan webhook.site sebagai dummy webhook:

1. Buka [webhook.site](https://webhook.site/)
2. Copy URL yang diberikan (contoh: `https://webhook.site/abc-123-def`)
3. Di HaloDompet:
   - Klik ikon ⚙️ (Settings) di pojok kanan atas
   - Paste URL webhook
   - Klik **Simpan**

Sekarang setiap kali Anda merekam, data JSON akan muncul di webhook.site!

---

## 🧪 Langkah 5: Testing

1. **Izinkan Akses Mikrofon**: Browser akan meminta izin akses mikrofon saat pertama kali
2. **Klik Tombol Mikrofon** di tengah halaman
3. **Ucapkan**: "Beli kopi 25000" atau "Makan siang 50000"
4. **Lihat Hasil**: Cek di webhook.site, data JSON akan muncul!

### Contoh Output JSON:
```json
{
  "item": "Kopi",
  "amount": 25000,
  "category": "Makanan",
  "date": "2025-11-16",
  "timestamp": "2025-11-16T10:30:00.000Z",
  "originalText": "Beli kopi 25000"
}
```

---

## 🚀 Deploy ke Vercel (Hosting Gratis)

### Cara Deploy:

1. **Push ke GitHub** (kalau belum):
   ```bash
   git add .
   git commit -m "Setup complete"
   git push
   ```

2. **Buka [Vercel](https://vercel.com/)**
   - Login dengan GitHub
   - Klik **"Import Project"**
   - Pilih repository `haloDompet`

3. **Tambahkan Environment Variable**:
   - Di Vercel Dashboard → Settings → Environment Variables
   - Tambahkan:
     - **Name**: `GEMINI_API_KEY`
     - **Value**: API key Anda
   - Klik **Save**

4. **Deploy!**
   - Klik **Deploy**
   - Tunggu ~2 menit
   - Website Anda online! 🎉

URL Anda akan berbentuk: `https://halodompet-xxx.vercel.app`

---

## 🐛 Troubleshooting

### ❌ "Browser tidak mendukung Web Speech API"
**Solusi**: Gunakan browser **Chrome**, **Edge**, atau **Opera**. Safari dan Firefox tidak support.

### ❌ "GEMINI_API_KEY belum diset"
**Solusi**:
1. Pastikan file `.env.local` ada di root folder
2. Pastikan isi file benar (tidak ada spasi tambahan)
3. Restart development server (`Ctrl+C` lalu `npm run dev` lagi)

### ❌ "Gagal mengirim ke n8n webhook"
**Solusi**:
1. Cek URL webhook benar (harus dimulai dengan `https://`)
2. Test webhook dengan tools seperti Postman
3. Pastikan n8n webhook Anda bisa menerima POST request

### ❌ Build error di Vercel
**Solusi**:
1. Pastikan `GEMINI_API_KEY` sudah ditambahkan di Vercel Environment Variables
2. Re-deploy dari Vercel dashboard

---

## 📱 Cara Pakai di HP

1. Buka website di Chrome Mobile: `https://halodompet-xxx.vercel.app`
2. Klik **"Add to Home Screen"**
3. Sekarang HaloDompet ada di home screen HP Anda seperti aplikasi!

---

## 🎯 Next Steps

Setelah setup berhasil:
1. Setup n8n workflow Anda (bisa di Railway, Render, atau self-hosted)
2. Hubungkan n8n ke Google Sheets / Notion
3. Mulai catat pengeluaran setiap hari!

---

## 💬 Butuh Bantuan?

Jika ada masalah, cek:
- File `docs/NOTES.md` untuk detail teknis
- File `docs/CLAUDE.md` untuk panduan development

Selamat mencoba! 🚀

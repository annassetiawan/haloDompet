# 🎤 HaloDompet

**Catat keuangan secara otomatis dengan suara!**

HaloDompet adalah aplikasi web yang membantu Anda mencatat pengeluaran dengan cepat menggunakan voice recording. Cukup ucapkan pengeluaran Anda, dan AI akan mengekstrak data ke format JSON yang bisa dikirim ke n8n untuk otomasi lebih lanjut (Google Sheets, Notion, dll).

## ✨ Fitur

- 🎤 **Voice Recording** - Web Speech API untuk voice-to-text (Bahasa Indonesia)
- 🤖 **AI Processing** - Gemini 2.5 Flash untuk ekstraksi data keuangan
- 🔗 **n8n Integration** - Kirim data otomatis ke n8n webhook
- 💾 **LocalStorage** - Webhook URL tersimpan di browser
- 🎨 **Modern UI** - Built with Next.js, Tailwind CSS, dan shadcn/ui
- 📱 **Mobile Ready** - Responsive design untuk desktop & mobile

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd haloDompet
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local dan isi dengan API key Anda
# Dapatkan API key gratis di: https://aistudio.google.com/apikey
```

File `.env.local`:
```
GEMINI_API_KEY=your_api_key_here
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📖 Cara Pakai

1. **Setup Webhook URL**: Klik ikon ⚙️ dan masukkan n8n webhook URL Anda
2. **Klik Tombol Mikrofon**: Izinkan akses mikrofon saat diminta
3. **Ucapkan Pengeluaran**: Contoh: "Beli kopi 25000"
4. **Data Terkirim!**: JSON otomatis dikirim ke webhook Anda

### Contoh Output JSON

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

## 🌐 Deploy ke Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/haloDompet)

### Manual Deployment

1. Push repository ke GitHub
2. Login ke [Vercel](https://vercel.com)
3. Import project dari GitHub
4. Tambahkan Environment Variable:
   - `GEMINI_API_KEY`: API key dari Google AI Studio
5. Deploy!

## 🛠 Tech Stack

- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **AI**: Google Gemini 2.5 Flash
- **Speech**: Web Speech API (Chrome)

## 📚 Dokumentasi

- [`SETUP.md`](./SETUP.md) - Panduan lengkap setup & troubleshooting
- [`docs/PRD-HaloDompet-MVP.md`](./docs/PRD-HaloDompet-MVP.md) - Product Requirements
- [`docs/Technical Design Document.md`](./docs/Technical%20Design%20Document.md) - Desain Teknis

## 🐛 Debug Endpoints

- `/api/list-models` - List semua Gemini models yang tersedia
- `/api/test-gemini` - Test multiple Gemini models

## 📝 License

MIT

## 🙏 Acknowledgments

Built with [Claude Code](https://claude.ai/code) - AI-powered development assistant

---

**⭐ Kalau project ini berguna, kasih star ya!**

# NOTES.md - Instruksi Agen AI untuk HaloDompet

## 🎯 Ikhtisar Proyek

Anda sedang membangun **HaloDompet** untuk seseorang dengan **pengalaman *coding* terbatas** (Vibe-coder). Tolong:
* Jelaskan konsep rumit dengan bahasa sederhana.
* Sediakan kode yang berfungsi dengan komentar yang jelas.
* Fokus pada *tools* gratis dan *setup* yang paling sederhana.
* Rayakan setiap kemajuan kecil!

## 📚 Apa yang Kita Bangun

**Aplikasi:** HaloDompet
**Tujuan:** "Membantu anak muda mencatat keuangan secara otomatis..."
**Tumpukan Teknologi (Tech Stack):**
* **Frontend:** **Next.js** (Framework React modern) & **shadcn/ui** (Komponen UI)
* **Backend:** **Next.js Serverless Functions** (Kode *backend* yang berjalan di Vercel)
* **Speech-to-Text:** **Web Speech API** (Fitur gratis di *browser* Chrome)
* **Text-to-JSON:** **Gemini API** (AI Google untuk mengekstrak data)
* **Deployment:** **Vercel** (*Hosting* gratis yang terhubung ke GitHub)
* **Penyimpanan URL:** **LocalStorage** (*Database* mini di *browser* Anda)

**Tujuan Pembelajaran:** Anda akan paham cara kerja *website* modern (Frontend, Backend, API) dan cara mengotomatiskan tugas.

## 🛠 Instruksi Setup

### Cek Prasyarat
```bash
# Pastikan ini sudah terinstal (tanya AI jika bingung)
node --version  # Seharusnya v18 atau lebih baru
git --version   # Versi berapa pun
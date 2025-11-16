# Technical Design Document: HaloDompet MVP

Dokumen ini menjelaskan BAGAIMANA kita akan membangun HaloDompet.
**Fokus Utama:** Menggunakan AI (Claude Code) untuk menulis 100% kode, dengan tumpukan teknologi (tech stack) modern, gratis, dan sangat sulit untuk "dirusak".

## 🛠 Pendekatan yang Direkomendasikan

### 🏆 Rekomendasi Utama: Stack Vercel + Next.js + AI

Ini adalah *stack* "Vibe-coder" profesional di tahun 2025.

* **Mengapa ini sempurna untuk Anda:**
    1.  **AI-Friendly:** Claude Code SANGAT AHLI dengan Next.js dan shadcn/ui. Anda bisa memintanya membuat seluruh halaman.
    2.  **Gratis:** Vercel (untuk hosting), Next.js (framework), dan shadcn/ui (komponen) semuanya gratis.
    3.  **Memenuhi Syarat PRD:** Ini adalah satu-satunya cara untuk menggunakan **shadcn/ui** (wajib) secara efektif.
    4.  **Anti-Rusak:** *Deployment* di Vercel terhubung dengan Git. Jika Anda "merusak" sesuatu, Anda bisa kembali ke versi sebelumnya dengan satu klik. Ini mengatasi kekhawatiran terbesar Anda.

### Perbandingan Opsi Alternatif

| Opsi | Kelebihan | Kekurangan | Biaya | Waktu ke MVP |
| :--- | :--- | :--- | :--- | :--- |
| **Vercel + Next.js (Rekomendasi)** | **Memenuhi semua syarat (shadcn, gratis, AI-friendly)** | Perlu AI untuk menulis kode (sesuai rencana Anda) | **Rp 0** | 1-2 minggu |
| [cite_start]Platform No-Code (Bubble, Softr) [cite: 12] | Visual, tidak ada kode | **Tidak bisa menggunakan shadcn/ui.** Terkunci di platform mereka. | Rp 0 (terbatas) | 1-2 minggu |
| Wordpress + Plugin | Banyak plugin | Kuno, lambat, SUSAH untuk dihubungkan ke AI/n8n. | Rp 0 (terbatas) | 3-4 minggu |

**Keputusan:** Kita menggunakan **Vercel + Next.js**.

## 📋 Daftar Persiapan Proyek

### Langkah 1: Buat Akun (Gratis)
* [ ] **GitHub:** (Wajib) Tempat menyimpan kode Anda.
* [ ] **Vercel:** (Wajib) Tempat *hosting website* Anda. Hubungkan ke akun GitHub Anda.
* [ ] **Google AI Studio:** (Wajib) Untuk mendapatkan kunci API Gemini gratis (untuk ekstraksi JSON).
* [ ] **Railway atau Render:** (Wajib) Untuk *hosting* n8n Anda secara gratis.

### Langkah 2: Pengaturan Asisten AI (Claude Code)
* [ ] Anda sudah menggunakan **Claude Code**. Pastikan Anda memberinya *file* `PRD-HaloDompet-MVP.md` dan *file* ini (`TechDesign-HaloDompet-MVP.md`) sebagai konteks.

### Langkah 3: Inisialisasi Proyek (Minta AI Melakukannya)
Anda akan memberi tahu Claude Code: "Buatkan saya proyek Next.js baru dan siapkan shadcn/ui."

Perintah yang akan dijalankan AI:
```bash
# 1. Membuat proyek Next.js baru
npx create-next-app@latest halodompet --typescript --tailwind --eslint --app

# 2. Masuk ke folder
cd halodompet

# 3. Inisialisasi shadcn/ui (pilih default)
npx shadcn-ui@latest init

🏗 Membangun Fitur Anda (Sesuai PRD)

Ini adalah alur kerja yang jauh lebih sederhana yang memenuhi semua kebutuhan Anda:

Alur Kerja Sederhana (Simple Flow):

    Frontend: Pengguna menekan tombol. Web Speech API (di browser) mendengarkan dan mengubah suara menjadi TEKS ("beli makanan 20000").

Frontend: Mengirim TEKS ini ke backend.

Backend: Menerima TEKS. Memanggil Gemini API untuk mengubah TEKS -> JSON.

Backend: Mengambil JSON dan mengirimkannya ke n8n Webhook Anda.

Ini menghilangkan kebutuhan untuk mengurus file audio yang rumit. Jauh lebih mudah bagi AI untuk dibangun.

Fitur 1: Perekaman Suara Sederhana (Frontend)

Kompleksitas: ⭐⭐☆☆☆ (Mudah)

Cara membangun dengan Claude Code:

    Prompt untuk AI: "Buat halaman utama (app/page.tsx) menggunakan shadcn/ui. Buat satu tombol Button besar di tengah dengan ikon mikrofon. Saat tombol diklik, gunakan Web Speech API peramban untuk mendengarkan suara saya."

    Prompt Lanjutan: "Setelah Web Speech API mendapatkan hasil teks (misal: 'beli kopi 20000'), panggil fungsi serverless kita di /api/process."

Fitur 2 & 3: Pemrosesan AI (Text-to-JSON) & Koneksi n8n (Backend)

Kompleksitas: ⭐⭐☆☆☆ (Mudah dengan AI)

Cara membangun dengan Claude Code:

    Prompt untuk AI: "Buatkan saya route handler Next.js (Serverless Function) di app/api/process/route.ts."

    Isi Fungsi (Minta AI):

        Fungsi ini menerima TEKS dari frontend.

        Fungsi ini memanggil Gemini API dengan prompt: "Ekstrak data JSON (item, jumlah) dari teks ini: [TEKS PENGGUNA]".

Fungsi ini menerima respons JSON dari Gemini.

Fungsi ini mengambil JSON tersebut dan mengirimkannya (via fetch) ke n8n Webhook URL saya.

🎨 Implementasi Desain (Vibe: Simple, Modern, Profesional)

    Perpustakaan: Kita wajib menggunakan shadcn/ui.

    Prompt untuk AI:

        "Gunakan komponen shadcn/ui Button untuk semua tombol."

        "Gunakan shadcn/ui Dialog untuk halaman pengaturan."

        "Gunakan shadcn/ui Input untuk menyimpan URL n8n."

        "Pastikan temanya gelap (dark mode) dan terlihat profesional."

📊 Database & Penyimpanan Data

Kabar Baik: Untuk MVP penggunaan pribadi, Anda tidak perlu database!

    Bagaimana cara menyimpan n8n Webhook URL? Kita akan menggunakan localStorage peramban.

    Prompt untuk AI: "Di halaman pengaturan (Dialog shadcn), buat satu Input untuk 'n8n Webhook URL'. Saat disimpan, simpan URL itu ke localStorage peramban."

    Kenapa? Ini 100% gratis, instan, dan sempurna untuk MVP Vibe-coder. Tidak perlu repot dengan Supabase atau Vercel KV hanya untuk satu URL.

🤖 Strategi Bantuan AI (Menggunakan Claude Code)

Anda adalah director-nya. Gunakan prompt ini.
Tugas	AI Tool Terbaik	Contoh Prompt
Perencanaan/Arsitektur	Claude Code	"Bagaimana cara terbaik menghubungkan Web Speech API ke serverless function?"
Menulis Kode Halaman	Claude Code	"Tulis kode lengkap untuk app/page.tsx. Gunakan shadcn/ui Button untuk memicu Web Speech API."
Memperbaiki Bug	Claude Code	"Kode saya error: [tempel error]. Ini kode saya: [tempel kode]. Apa yang salah?"
Membuat Backend	Claude Code	"Tulis kode lengkap untuk app/api/process/route.ts yang memanggil API Gemini dan n8n webhook."

🚀 Rencana Deployment (Anti-Rusak)

Platform yang Direkomendasikan: Vercel

    Kenapa: Gratis, terhubung langsung ke GitHub, dan dibuat oleh perusahaan yang sama dengan Next.js.

    Langkah Deployment:

        Minta AI: "Buatkan saya repositori GitHub dan unggah kode ini."

        Buka Vercel, klik "Import Project", pilih repositori GitHub Anda.

        Tambahkan Kunci API: Di pengaturan Vercel, tambahkan GEMINI_API_KEY Anda.

        Klik Deploy.

    Mengatasi Kekhawatiran Anda: Jika Anda "merusak" website-nya, Anda cukup masuk ke Vercel, pilih deployment lama yang masih berfungsi, dan klik "Redeploy". Selesai. Masalah teratasi dalam 30 detik.

💰 Rincian Biaya (Target: Rp 0)

Fase Pengembangan (Membangun)

Layanan	Tier Gratis	Anda Butuh
Next.js / shadcn/ui	Open Source	Gratis
Claude Code	(Sesuai akses Anda)	Gratis
GitHub	Repositori privat	Gratis
Total		Rp 0

Fase Produksi (Setelah Launch)

Layanan	Tier Gratis	Estimasi 1000 Pengguna
Hosting (Vercel)	Sangat besar	Rp 0
AI (Gemini API)	Tier gratis (misal: Google AI Studio)	Rp 0
Automation (n8n)	

Self-host di Railway (tier gratis)

	Rp 0
Total		Rp 0

⚠️ Batasan Penting

    Web Speech API: Fitur ini (yang membuat semuanya jadi mudah) mungkin hanya berfungsi di peramban berbasis Chrome (Chrome, Edge, Opera). Ini adalah pertukaran yang sepadan demi kesederhanaan.

    Ketergantungan AI: Anda 100% bergantung pada Claude Code untuk menulis dan memperbaiki. Jika Claude down, proyek Anda berhenti.

✅ Daftar Sukses (Mengatasi Kekhawatiran Anda)

Sebelum Mulai

    [ ] Semua akun (GitHub, Vercel, AI Studio, Railway) sudah dibuat.

    [ ] Anda paham bahwa Anda akan mengarahkan AI, bukan coding manual.

Selama Pengembangan

    [ ] Selalu "Save Game": Setelah 1 fitur berhasil, minta AI untuk "simpan kode ini ke GitHub". Ini adalah save point Anda.

    [ ] Tes di Vercel, bukan hanya di lokal.

Sebelum Launch

    [ ] Fitur 1 (Tombol rekam) berfungsi.

    [ ] Fitur 2 (Ekstraksi JSON) berfungsi.

    [ ] Fitur 3 (Koneksi n8n) berfungsi.

    [ ] Data muncul di Google Sheets/Notion Anda (via n8n).

    [ ] Desain shadcn/ui terlihat "Simple, Modern, Profesional".
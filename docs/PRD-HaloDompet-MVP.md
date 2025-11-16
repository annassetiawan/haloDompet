# Product Requirements Document: HaloDompet MVP

## 🎯 Ikhtisar Produk

**Nama Aplikasi:** HaloDompet
**Tagline:** "Membantu anak muda mencatat keuangan secara otomatis dengan financial AI advisor."
**Target Peluncuran:** "Membangun versi yang berfungsi penuh untuk penggunaan pribadi."
[cite_start]**Target Waktu:** Beberapa minggu 

## 👥 Siapa Penggunanya

### Pengguna Utama: "Budi" (Pekerja Melek Teknologi)
Budi adalah seorang pekerja sibuk yang melek teknologi. Dia paham nilai dari pencatatan keuangan, tapi benci proses manualnya. Dia lebih suka sesuatu yang cepat, otomatis, dan tidak mengganggu alur kerjanya.

**Masalah (Pain Point) Saat Ini:**
* Malas membuka aplikasi *budgeting* hanya untuk satu entri data.
* Sering lupa mencatat pengeluaran kecil.
* Merasa aplikasi yang ada terlalu ribet untuk kebutuhan sederhana.

**Apa yang Dia Butuhkan:**
* Cara super cepat untuk mencatat pengeluaran (< 5 detik).
* Sistem yang "atur sekali, lalu lupakan" (otomatis).
* Data yang rapi dan terstruktur di tempat pilihannya sendiri (bukan di dalam aplikasi).

### Kisah Pengguna Contoh
"Kenalkan Budi, seorang *developer* sibuk yang baru saja membeli 'Nasi Goreng 30.000'. Dia frustrasi karena benci membuka aplikasi *budgeting* hanya untuk mencatat ini. Dia menemukan HaloDompet dan langsung menyambungkannya ke Google Sheets-nya via n8n. Sambil berjalan, dia membuka website HaloDompet, menekan tombol, dan berkata: 'Beli makan siang nasi goreng 30000.' Sekarang Budi senang karena dia tahu datanya sudah otomatis masuk ke Google Sheets-nya bahkan sebelum dia sampai di meja kerjanya."

## 🔧 Masalah yang Diselesaikan

[cite_start]Pencatatan pengeluaran manual itu membosankan dan penuh friksi[cite: 2]. Banyak orang (terutama Gen Z dan Milenial yang sibuk) gagal melacak keuangan mereka bukan karena tidak mau, tetapi karena *tools* yang ada terlalu ribet untuk digunakan setiap saat.

**Mengapa Solusi yang Ada Gagal:**
* **Aplikasi Manual (YNAB, dll.):** Terlalu banyak langkah. Perlu membuka aplikasi, klik tambah, pilih kategori, ketik jumlah.
* [cite_start]**Aplikasi Suara Lainnya (Voicash, TalkieMoney):** [cite: 10] Mereka mungkin punya *input* suara, tapi sering kali "mengunci" data pengguna di dalam ekosistem mereka sendiri.
* [cite_start]**Solusi Kami (HaloDompet):** Kami fokus pada *input* suara yang instan [cite: 5] [cite_start]dan **fleksibilitas ekspor data total** melalui n8n[cite: 7]. Kami bukan *dashboard* lain, kami adalah *input* tercepat untuk *dashboard* ANDA.

## 🎬 Perjalanan Pengguna

### Penemuan → Penggunaan Pertama → Sukses

1.  **Penemuan & Pengaturan (Setup)**
    * Budi menemukan HaloDompet.
    * Dia masuk ke halaman Pengaturan dan menempelkan *webhook URL* n8n miliknya.
    * Dia menyimpan *bookmark* HaloDompet di *homescreen* ponselnya.

2.  **Penggunaan Inti (5 Detik)**
    * Budi membeli sesuatu.
    * Dia membuka *bookmark* HaloDompet.
    * Dia menekan tombol rekam dan berbicara.
    * Dia menutup *website*.

3.  **Momen Sukses (Otomatis)**
    * [cite_start]Di *backend*, HaloDompet mengubah suara itu menjadi JSON[cite: 6].
    * [cite_start]JSON itu dikirim ke *webhook* n8n Budi[cite: 7].
    * [cite_start]n8n memprosesnya dan menambah baris baru di Google Sheets Budi[cite: 9].
    * Budi, tanpa melakukan apa-apa lagi, melihat pengeluarannya tercatat rapi.

## ✨ Fitur MVP

### 🔴 Wajib Ada (Must Have) untuk Peluncuran

#### 1. Perekaman Suara Sederhana
* [cite_start]**Apa:** Satu tombol rekam besar di *website* yang menggunakan API Web Speech [cite: 5] atau serupa untuk menangkap audio dari *browser* pengguna.
* **User Story:** Sebagai Budi, saya ingin bisa langsung merekam suara saya begitu membuka *website* agar saya bisa mencatat secepat mungkin.
* **Kriteria Sukses:**
    * [ ] Pengguna bisa menekan tombol untuk mulai dan berhenti merekam.
    * [ ] Hasil rekaman audio dikirim ke *backend* untuk diproses.
* **Prioritas:** P0 (Kritis)

#### 2. Pemrosesan AI (Suara ke JSON)
* [cite_start]**Apa:** Layanan *backend* (menggunakan *tier* gratis API AI) yang menerima *file* audio dan mengubahnya menjadi data JSON terstruktur[cite: 6].
* **User Story:** Sebagai Budi, saya ingin ucapan "makan siang 30000" dipahami sebagai `{ "item": "makan siang", "jumlah": 30000 }` secara otomatis.
* **Kriteria Sukses:**
    * [ ] Audio "beli kopi 25000" berhasil diubah jadi teks.
    * [cite_start][ ] Teks berhasil diekstraksi menjadi format JSON yang konsisten[cite: 6].
* **Prioritas:** P0 (Kritis)

#### 3. Koneksi Otomatis n8n
* [cite_start]**Apa:** Halaman pengaturan sederhana di mana pengguna bisa memasukkan satu *webhook URL* n8n[cite: 7].
* **User Story:** Sebagai Budi, saya ingin semua data JSON saya dikirim secara otomatis ke *workflow* n8n saya agar saya bisa mengontrol data saya sendiri.
* **Kriteria Sukses:**
    * [ ] Ada 1 *input field* di *website* untuk menyimpan *URL webhook* pengguna.
    * [ ] Setelah pemrosesan AI, data JSON dikirim ke *URL* tersebut.
* **Prioritas:** P0 (Kritis)

### 🚫 TIDAK ADA di MVP (Simpan untuk Nanti)
* **AI Financial Advisor:** (Fitur *tagline* ini akan disimpan untuk v2. Fokus v1 adalah *pencatatan*).
* **Dashboard Internal:** (Tidak ada grafik, tidak ada riwayat di dalam HaloDompet. Pengguna pakai *dashboard* mereka sendiri).
* [cite_start]**Aplikasi Mobile Native (iOS/Android):** (Fokus di *website* responsif dulu).
* **Manajemen Kategori:** (Kategori ditentukan oleh AI atau diserahkan ke n8n pengguna).

[cite_start]*Alasan: Menjaga MVP tetap fokus pada 3 fitur inti dan bisa diluncurkan dalam "beberapa minggu".*

## 📊 Cara Mengukur Keberhasilan

### Metrik Sukses Peluncuran (30 Hari Pertama)
| Metrik | Target | Ukuran |
| --- | --- | --- |
| **Tingkat Penggunaan Pribadi** | Dipakai setiap hari selama 1 minggu penuh | (Oleh Anda sendiri) |
| **Tingkat Keberhasilan Pemrosesan** | > 95% | (Jumlah rekaman sukses / Jumlah total rekaman) |

## 🎨 Tampilan & Nuansa (Look & Feel)

**Vibe Desain:** Simple, Modern, Profesional.

**Prinsip Visual:**
1.  **Fokus:** Hanya ada satu aksi utama di layar (tombol rekam).
2.  **Minimalis:** Tidak ada elemen yang tidak perlu.
3.  **Profesional:** Tipografi yang bersih, palet warna terbatas, terasa bisa diandalkan.

**Perpustakaan UI (UI Library):**
* Wajib menggunakan **shadcn/ui** untuk membangun komponen *frontend*.

**Halaman Utama:**

[Halaman Website HaloDompet] ┌─────────────────────────┐ │ HaloDompet [Pengaturan ⚙️]│ ├─────────────────────────┤ │ │ │ │ │ [Tombol REKAM │ │ Besar 🔴] │ │ │ │ │ ├─────────────────────────┤ │ Status: Siap Merekam │ └─────────────────────────┘


## ⚡ Pertimbangan Teknis

**Platform:** Website (Responsif, *Mobile-first*) 
**Frontend:** Wajib menggunakan **shadcn/ui**.
**Backend:** *Serverless function* (mungkin di Vercel/Netlify) untuk menangani audio dan memanggil API AI.
**Otomatisasi:** n8n (*self-host* atau *cloud*)[cite: 8].
**Database:** Minimal (mungkin hanya untuk menyimpan *webhook URL* pengguna)[cite: 9].

## 💰 Bujet & Batasan

**Bujet Pengembangan:** Rp 0 (Menggunakan *tools* gratis) 
**Bujet Operasional Bulanan:** Rp 0 (Menggunakan *tier* gratis API, Vercel, dan n8n *self-host*) [cite: 19]
**Timeline:** Peluncuran MVP dalam "beberapa minggu" 
**Tim:** *Solo Vibe-coder* (dengan bantuan AI [cite: 14])

## ✅ Definisi "Selesai" untuk MVP

MVP siap diluncurkan (untuk penggunaan pribadi) ketika:
* [ ] 3 fitur "Wajib Ada" berfungsi penuh.
* [ ] Pengguna bisa mengatur *webhook* n8n mereka.
* [ ] Pengguna bisa merekam suara dan data JSON-nya muncul di *workflow* n8n.
* [ ] *Website* bisa diakses dan berfungsi di *browser* Chrome (Desktop & Mobile).
* [ ] Desain sudah menerapkan *vibe* "Simple, Modern, Profesional" menggunakan **shadcn**.

## 📝 Langkah Selanjutnya

Setelah PRD ini disetujui:
1.  Buat Dokumen Desain Teknis (Bagian III).
2.  Siapkan lingkungan pengembangan (*frontend* & *backend*).
3.  Bangun MVP dengan bantuan AI.
4.  Tes secara pribadi.
5.  Mulai gunakan setiap hari! 🎉

---
*Dokumen dibuat: 16 November 2025*
*Status: Draf - Siap untuk Desain Teknis*
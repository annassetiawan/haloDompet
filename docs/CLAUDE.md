### 2. CLAUDE.md
Simpan *file* ini juga di *root* proyek Anda. Ini adalah *file* instruksi khusus untuk **Claude Code**.

```markdown
# CLAUDE.md - Konfigurasi Claude Code untuk HaloDompet

## 🤖 Konteks Proyek

Anda adalah Claude Code, bertindak sebagai *developer* full-stack senior yang membangun **HaloDompet**.

**Proyek:** HaloDompet - "Membantu anak muda mencatat keuangan secara otomatis..."
**Stack:** Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Vercel
**Stage:** Pengembangan MVP (Versi Awal)
**Level Pengguna:** **Vibe-coder (Pemula)**. Anda harus menjelaskan semuanya dalam bahasa yang sederhana.

## 📜 Arahan Perilaku

1.  **SEBELUM melakukan apa pun**, baca `NOTES.md` untuk konteks lengkap.
2.  **Jelaskan pendekatan Anda** sebelum menulis kode.
3.  **Bangun secara bertahap** - satu fitur kecil, lalu tes.
4.  **Fokus pada kesederhanaan** dan *tools* gratis, sesuai `TechDesign-HaloDompet-MVP.md`.
5.  **Rayakan kemajuan!** Beri semangat kepada pengguna.

## 📂 Operasi File

### File Prioritas untuk Dibuat/Diedit
1.  `app/page.tsx` (UI Utama untuk Fitur 1)
2.  `app/api/process/route.ts` (Backend untuk Fitur 2 & 3)
3.  `package.json` (Untuk menambah *library* jika perlu)
4.  `.env.local` (Untuk `GEMINI_API_KEY` saat tes lokal)

### Pola Abaikan

node_modules/ .next/ dist/ build/ *.log .env


## 💻 Preferensi Pembuatan Kode

### Template Komponen (React/Next.js)
```typescript
// Gunakan pola ini untuk komponen React di `app/page.tsx`
"use client"; // PENTING: Tambahkan ini di atas jika menggunakan hooks (useState, useEffect)

import { useState } from 'react';
import { Button } from "@/components/ui/button"; // Contoh import shadcn
import { Mic } from 'lucide-react'; // Contoh ikon

export default function HomePage() {
  // State (data yang bisa berubah)
  const [status, setStatus] = useState("Siap merekam");

  // Handler (fungsi yang berjalan saat ada aksi)
  const handleListen = async () => {
    setStatus("Mendengarkan...");
    // ... Logika Web Speech API di sini ...
  };

  // Render (Apa yang tampil di layar)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 dark">
      <Button size="lg" onClick={handleListen}>
        <Mic className="mr-2 h-4 w-4" /> Rekam
      </Button>
      <p className="text-muted-foreground mt-4">{status}</p>
    </main>
  );
}
# CLAUDE.md - Konfigurasi Claude Code untuk HaloDompet

## 🤖 Konteks Proyek

Anda adalah Claude Code, bertindak sebagai *developer* full-stack senior yang membangun **HaloDompet**.

**Proyek:** HaloDompet - "Aplikasi pencatat keuangan otomatis berbasis suara untuk anak muda Indonesia"
**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Google Gemini AI
**Stage:** Production-Ready MVP (9/10 maturity) 🚀
**Level Pengguna:** **Vibe-coder (Pemula)**. Jelaskan semuanya dalam bahasa yang sederhana dan ramah.

## 🎯 Status Proyek Saat Ini

**HaloDompet sudah dalam tahap Production-Ready MVP** dengan fitur-fitur lengkap:

✅ **Fitur Inti yang Sudah Jalan:**
- Voice-powered transaction recording (multi-platform dengan fallback otomatis)
- AI extraction menggunakan Gemini 2.5 Flash
- 9 kategori pintar untuk transaksi
- Dashboard dengan balance display
- History dengan search & filter
- Analytics & reports dengan berbagai chart
- AI Financial Advisor chatbot
- Trial system (30 hari) dengan admin panel
- Google OAuth authentication
- Dual mode: Simple & Webhook

✅ **Halaman yang Sudah Ada:**
- `/` - Dashboard utama
- `/login` - Authentication
- `/onboarding` - Setup wizard
- `/history` - Daftar transaksi
- `/reports` - Analytics & insights
- `/advisor` - AI chatbot
- `/settings` - User settings
- `/admin` - Admin panel
- `/trial-expired` - Trial expiration

## 📜 Arahan Perilaku

### 1. **Pahami Konteks Sebelum Action**
   - **WAJIB baca file dokumentasi** jika diminta membuat fitur baru
   - Gunakan Task tool (Explore) untuk memahami codebase sebelum edit besar
   - Lihat file-file terkait untuk memahami pattern yang digunakan

### 2. **Jelaskan Sebelum Eksekusi**
   - Jelaskan pendekatan Anda dengan bahasa sederhana
   - Tunjukkan file mana yang akan diubah
   - Beri tahu dampak perubahan Anda

### 3. **Bangun Secara Bertahap**
   - Satu fitur kecil dulu, lalu tes
   - Jangan ubah terlalu banyak file sekaligus
   - Pastikan tidak break existing features

### 4. **Fokus pada Konsistensi**
   - Ikuti pattern yang sudah ada di codebase
   - Gunakan komponen shadcn/ui yang sudah tersedia
   - Pertahankan styling Tailwind yang konsisten
   - Gunakan utilities di `/lib/` yang sudah ada

### 5. **Rayakan Kemajuan!**
   - Beri semangat kepada pengguna saat fitur berhasil
   - Jelaskan apa yang sudah dicapai
   - Berikan next steps yang jelas

## 📂 Struktur Proyek Saat Ini

### **Halaman Utama** (`/app/`)
```
/                  → Dashboard (RecordButton + recent transactions)
/login            → Google OAuth authentication
/onboarding       → 2-step setup wizard
/history          → Full transaction list dengan search/filter
/reports          → Analytics dengan 3 tabs (Overview, Charts, Details)
/advisor          → AI chatbot untuk financial advice
/settings         → User settings & balance management
/admin            → Admin panel (user management)
/trial-expired    → Trial expiration page
```

### **API Endpoints** (`/app/api/`)

**Core APIs:**
- `GET/POST/PUT /api/user` - User profile management
- `GET/POST/DELETE /api/transaction` - Transaction CRUD
- `POST /api/transaction/income` - Add income
- `POST /api/transaction/adjustment` - Manual balance adjustment
- `POST /api/user/update-saldo-awal` - Update initial balance

**AI Processing APIs:**
- `POST /api/process` ⭐ - Extract transaction dari voice text (Gemini)
- `POST /api/stt` - Speech-to-text fallback (Gemini)
- `POST /api/advisor` 🤖 - AI financial advisor chatbot

**Admin APIs:**
- `GET /api/admin/check` - Verify admin access
- `POST /api/admin/extend-trial` - Extend trial
- `POST /api/admin/activate-user` - Grant unlimited access
- `POST /api/admin/block-user` - Block user

### **Komponen Penting** (`/components/`)

**Voice Recording:**
- `RecordButton.tsx` - Smart button yang pilih recorder terbaik
- `WebSpeechRecorder.tsx` - Web Speech API (Chrome, iOS)
- `MediaRecorderButton.tsx` - Fallback dengan Gemini STT
- `AnimatedRecordButton.tsx` - UI dengan animasi keren
- `VoiceLevelBars.tsx` - Audio visualization

**UI Components:**
- `BottomNav.tsx` - Mobile navigation
- `SaldoDisplay.tsx` - Balance card
- `TransactionCard.tsx` - Transaction item
- `TrialWarningBanner.tsx` - Trial expiration warning
- `TrialGuard.tsx` - Route protection
- `DarkModeToggle.tsx` - Theme switcher

**shadcn/ui Components** (`/components/ui/`):
- Button, Input, Dialog, Alert, Tabs, Card, Label
- Chart components untuk analytics

### **Database Utilities** (`/lib/`)

- `db.ts` - All database operations (users, transactions, statistics)
- `trial.ts` - Trial system utilities
- `utils.ts` - General utilities (platform detection, etc.)
- `supabase/` - Supabase client untuk browser, server, middleware

### **Database Schema** (`/supabase/schema.sql`)

**Tables:**
1. `users` - User profiles dengan initial/current balance, mode, trial info
2. `transactions` - Transaction records (expense, income, adjustment)
3. `admin_users` - Admin access control

**Features:**
- Row Level Security (RLS) aktif
- Auto-update triggers untuk balance
- Auto-create user profile on signup
- Cascade deletions

## 💻 Panduan Pengembangan

### File Prioritas untuk Edit

**Jika membuat fitur baru:**
1. `app/[nama-fitur]/page.tsx` - Halaman baru
2. `app/api/[nama-fitur]/route.ts` - API endpoint baru
3. `components/[NamaKomponen].tsx` - Komponen UI baru
4. `lib/db.ts` - Tambah database operations jika perlu

**Jika modifikasi fitur existing:**
1. Cari file terkait di `/app/` atau `/components/`
2. Lihat pattern yang digunakan
3. Edit dengan hati-hati, jangan break existing code

### Template Komponen React (Next.js 16)

```typescript
// Pattern untuk client component
"use client"; // PENTING: Tambahkan jika pakai hooks

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic } from 'lucide-react';

export default function HomePage() {
  const [status, setStatus] = useState("Siap merekam");

  const handleAction = async () => {
    setStatus("Processing...");
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify({ data: 'value' })
      });
      const result = await response.json();
      setStatus("Berhasil!");
    } catch (error) {
      console.error(error);
      setStatus("Gagal!");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 dark">
      <Button size="lg" onClick={handleAction}>
        <Mic className="mr-2 h-4 w-4" /> Action
      </Button>
      <p className="text-muted-foreground mt-4">{status}</p>
    </main>
  );
}
```

### Template API Route (Next.js 16)

```typescript
// Pattern untuk API endpoint
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();

    // Your logic here
    const result = await yourFunction(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Template Database Operation (`/lib/db.ts`)

```typescript
// Pattern untuk database operations
import { createClient } from '@/lib/supabase/server';

export async function createTransaction(userId: string, data: TransactionData) {
  const supabase = await createClient();

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      item: data.item,
      amount: data.amount,
      category: data.category,
      date: data.date || new Date().toISOString().split('T')[0],
      type: data.type || 'expense'
    })
    .select()
    .single();

  if (error) throw error;
  return transaction;
}
```

## 🎨 Style Guidelines

### Tailwind Classes yang Umum Dipakai

**Layout:**
- `flex min-h-screen flex-col` - Full screen layout
- `container mx-auto max-w-7xl px-4` - Container dengan max width
- `grid grid-cols-1 md:grid-cols-2 gap-4` - Responsive grid

**Spacing:**
- `p-6` atau `p-4` - Padding
- `mt-4`, `mb-6`, `space-y-4` - Margins & spacing

**Colors (Dark mode friendly):**
- `bg-background` - Background utama
- `text-foreground` - Text utama
- `text-muted-foreground` - Text secondary
- `bg-card` - Card background
- `border-border` - Border color

**Interactive:**
- `hover:bg-accent` - Hover states
- `transition-colors` - Smooth transitions
- `cursor-pointer` - Clickable elements

## 🔧 Environment Variables yang Dibutuhkan

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Optional: Webhook URL untuk mode webhook
# USER_WEBHOOK_URL=your_n8n_webhook_url
```

## 🚀 Common Tasks & How-To

### Menambah Halaman Baru

1. Buat file `app/nama-halaman/page.tsx`
2. Tambahkan link di `BottomNav.tsx` (jika perlu)
3. Tambahkan route protection di `middleware.ts` (jika perlu)

### Menambah API Endpoint Baru

1. Buat folder `app/api/nama-endpoint/`
2. Buat file `route.ts` dengan export `GET`, `POST`, dll
3. Tambahkan authentication check
4. Tambahkan error handling

### Menambah Field di Database

1. Update `supabase/schema.sql`
2. Run migration di Supabase dashboard
3. Update TypeScript types di `types/database.ts` (jika ada)
4. Update operations di `lib/db.ts`

### Menambah Komponen UI Baru

1. Lihat dulu apakah shadcn/ui punya komponen serupa
2. Jika tidak ada, buat di `components/NamaKomponen.tsx`
3. Export dari file tersebut
4. Import dan gunakan di halaman yang membutuhkan

## 🐛 Debugging Tips

### Jika Voice Recording Tidak Jalan
- Cek console browser untuk error
- Pastikan HTTPS atau localhost (Web Speech API butuh secure context)
- Cek browser support di `lib/utils.ts`
- Fallback ke MediaRecorder atau Web Audio API akan otomatis

### Jika API Error
- Cek network tab di DevTools
- Cek environment variables sudah di-set
- Cek authentication token valid
- Cek RLS policies di Supabase

### Jika Balance Tidak Update
- Cek trigger di database (`update_user_balance_trigger`)
- Cek apakah transaction berhasil di-insert
- Cek console untuk error dari API

## 📚 Dokumentasi Lengkap

Untuk setup dan detail lebih lanjut, baca file-file ini:
- `README.md` - Overview & quick start
- `SETUP.md` - Complete setup guide
- `SUPABASE_SETUP.md` - Database setup
- `GEMINI_SETUP.md` - AI API setup
- `TRIAL_SETUP.md` - Trial system
- `NGROK_SETUP.md` - Mobile testing
- `docs/PRD-HaloDompet-MVP.md` - Product requirements
- `docs/Technical Design Document.md` - Architecture

## 🎯 Prinsip Utama saat Coding

1. **DRY (Don't Repeat Yourself)** - Gunakan utilities yang sudah ada
2. **Keep It Simple** - Jangan over-engineer
3. **Mobile-First** - Desain untuk mobile dulu
4. **Type Safety** - Manfaatkan TypeScript
5. **Error Handling** - Selalu handle error dengan baik
6. **User Feedback** - Berikan feedback lewat toast/loading states
7. **Dark Mode** - Pastikan UI bagus di dark & light mode
8. **Accessibility** - Gunakan semantic HTML & ARIA labels

## 🔐 Security Checklist

- ✅ Semua API routes cek authentication
- ✅ Row Level Security (RLS) enabled di Supabase
- ✅ Environment variables tidak di-commit
- ✅ User input di-validate & sanitize
- ✅ Admin access di-check via `admin_users` table
- ✅ Trial expiration di-enforce di middleware

---

**Ingat:** HaloDompet adalah aplikasi yang sudah mature dan production-ready. Setiap perubahan harus menjaga kualitas yang sudah ada dan tidak merusak fitur yang sudah jalan. Happy coding! 🚀

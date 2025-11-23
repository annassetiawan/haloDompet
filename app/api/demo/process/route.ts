import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Default demo categories
const DEMO_EXPENSE_CATEGORIES = [
  'Makanan',
  'Transportasi',
  'Belanja',
  'Hiburan',
  'Tagihan',
  'Kesehatan',
  'Lainnya',
];

const DEMO_INCOME_CATEGORIES = [
  'Gaji',
  'Bonus',
  'Investasi',
  'Penjualan',
  'Hadiah',
  'Lainnya',
];

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Coba lagi dalam 1 jam.',
          type: 'rate_limit'
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitMap.get(ip)?.resetTime || Date.now()),
          }
        }
      );
    }

    const { text } = await request.json();

    // Validasi input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text harus diisi' },
        { status: 400 }
      );
    }

    // Validasi Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Panggil Gemini API untuk ekstraksi JSON
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0];

    const expenseCategoryList = DEMO_EXPENSE_CATEGORIES.join(', ');
    const incomeCategoryList = DEMO_INCOME_CATEGORIES.join(', ');

    const prompt = `
Kamu adalah asisten AI yang mengekstrak data keuangan dari teks bahasa Indonesia.
Kamu bisa menangani PEMASUKAN (Income) dan PENGELUARAN (Expense).

INFORMASI PENTING:
- Tanggal hari ini adalah: ${today}
- Kamu HARUS menggunakan tanggal ini untuk field "date"

Tugas kamu:
1. Deteksi apakah transaksi adalah PEMASUKAN atau PENGELUARAN dari konteks kalimat
2. Ekstrak informasi dari teks yang diberikan
3. Format output dalam JSON dengan struktur:
   {
     "item": "nama barang/jasa/sumber pendapatan",
     "amount": angka (tanpa titik atau koma),
     "category": "kategori sesuai tipe transaksi",
     "type": "income" atau "expense",
     "date": "${today}",
     "location": "lokasi transaksi (jika disebutkan, jika tidak isi null)",
     "payment_method": "metode pembayaran (jika disebutkan, jika tidak isi null)",
     "wallet_name": "nama dompet/rekening (jika disebutkan, jika tidak isi null)"
   }

DETEKSI TIPE TRANSAKSI:
A. EXPENSE (Pengeluaran) - jika mengandung kata:
   - "beli", "bayar", "jajan", "keluar", "belanja", "buat", "untuk"
   - "isi" (bensin/pulsa), "parkir", "tol", "grab", "gojek"
   - "langganan", "membership", "subscription"
   Set: "type": "expense"

B. INCOME (Pemasukan) - jika mengandung kata:
   - "dapat", "terima", "gaji", "bonus", "masuk", "diterima"
   - "jual", "hasil jual", "penjualan", "transfer masuk"
   - "komisi", "hadiah", "untung", "profit", "dividen"
   Set: "type": "income"

KATEGORI YANG TERSEDIA:

KATEGORI PEMASUKAN (untuk type: "income"):
${DEMO_INCOME_CATEGORIES.map((cat, idx) => `${idx + 1}. "${cat}"`).join('\n')}

KATEGORI PENGELUARAN (untuk type: "expense"):
${DEMO_EXPENSE_CATEGORIES.map((cat, idx) => `${idx + 1}. "${cat}"`).join('\n')}

Pilih kategori yang paling sesuai. Jika tidak ada yang cocok, pilih "Lainnya".

DETEKSI WALLET/DOMPET (Opsional):
- Jika user menyebut nama bank/e-wallet, ekstrak sebagai "wallet_name"
- Contoh: "masuk ke BCA" → "wallet_name": "BCA"
- Contoh: "pakai Gopay" → "wallet_name": "Gopay"
- Nama wallet umum: BCA, Mandiri, BRI, BNI, Gopay, OVO, Dana, ShopeePay, LinkAja
- Jika tidak disebutkan, set null

Aturan Ekstraksi:
- Field "date" WAJIB diisi dengan: "${today}"
- Amount harus angka murni (contoh: 25000, bukan "25.000")
- Jika tidak ada informasi amount, set amount ke 0
- Location: nama toko/tempat jika disebutkan
- Payment method: cara bayar jika disebutkan
- Wallet name: nama dompet/rekening jika disebutkan

Contoh PENGELUARAN:
Input: "Beli kopi 25000 di fore bayar dengan gopay"
Output: {"item": "Kopi", "amount": 25000, "category": "Makanan", "type": "expense", "location": "Fore", "payment_method": "Gopay", "wallet_name": "Gopay", "date": "${today}"}

Input: "Isi bensin 50rb"
Output: {"item": "Bensin", "amount": 50000, "category": "Transportasi", "type": "expense", "location": null, "payment_method": null, "wallet_name": null, "date": "${today}"}

Contoh PEMASUKAN:
Input: "Dapat gaji 8 juta masuk BCA"
Output: {"item": "Gaji Bulanan", "amount": 8000000, "category": "Gaji", "type": "income", "location": null, "payment_method": null, "wallet_name": "BCA", "date": "${today}"}

Input: "Jual laptop bekas 3.5 juta"
Output: {"item": "Jual Laptop Bekas", "amount": 3500000, "category": "Penjualan", "type": "income", "location": null, "payment_method": null, "wallet_name": null, "date": "${today}"}

Sekarang proses teks ini:
"${text}"

PENTING: Hanya berikan JSON, tanpa penjelasan atau teks tambahan.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if response was blocked
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('Gemini response blocked or empty');
      return NextResponse.json(
        {
          error: 'AI tidak dapat memproses input. Coba dengan kalimat yang lebih sederhana.',
        },
        { status: 500 }
      );
    }

    let extractedText = response.text();

    // Bersihkan response dari markdown code blocks
    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    let jsonData;
    try {
      jsonData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', extractedText);
      return NextResponse.json(
        {
          error: 'Gagal mengekstrak data dari input',
        },
        { status: 500 }
      );
    }

    // Enforce tanggal hari ini
    jsonData.date = today;
    jsonData.timestamp = new Date().toISOString();
    jsonData.originalText = text;

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: jsonData,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        }
      }
    );

  } catch (error: any) {
    console.error('API Error:', error);

    const errorMessage = error.message || '';

    // Handle specific errors
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      return NextResponse.json(
        { error: 'Server AI sedang sibuk. Coba lagi sebentar.' },
        { status: 503 }
      );
    }

    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      return NextResponse.json(
        { error: 'Quota terlampaui. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Terjadi kesalahan. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}

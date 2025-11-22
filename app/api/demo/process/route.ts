import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Simple in-memory rate limiting
// TODO: For production, use Redis or edge config for distributed rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const maxRequests = 5;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    const resetTime = now + oneHour;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count += 1;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return 'dev-ip';
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Anda telah mencapai batas demo (5x per jam). Silakan login untuk akses penuh!',
          resetTime: resetDate.toISOString()
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetDate.toISOString()
          }
        }
      );
    }

    const { text } = await request.json();

    // Validasi input
    if (!text) {
      return NextResponse.json(
        { error: 'Text harus diisi' },
        { status: 400 }
      );
    }

    // Validasi Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset' },
        { status: 500 }
      );
    }

    // Default categories for demo (tidak fetch dari database)
    const defaultExpenseCategories = [
      'Makanan',
      'Transportasi',
      'Belanja',
      'Hiburan',
      'Tagihan',
      'Kesehatan',
      'Pendidikan',
      'Lainnya'
    ];

    const defaultIncomeCategories = [
      'Gaji',
      'Bonus',
      'Investasi',
      'Penjualan',
      'Hadiah',
      'Lainnya'
    ];

    const expenseCategoryList = defaultExpenseCategories.join(', ');
    const incomeCategoryList = defaultIncomeCategories.join(', ');

    // Panggil Gemini API untuk ekstraksi JSON
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0];

    console.log('[DEMO] Processing text:', text);

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
     "wallet_name": "nama dompet/rekening (jika disebutkan, jika tidak isi 'Tunai')"
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
${defaultIncomeCategories.map((cat, idx) => `${idx + 1}. "${cat}"`).join('\n')}

Pilih salah satu kategori pemasukan di atas yang paling sesuai dengan transaksi.
Jika tidak ada yang sesuai, pilih "Lainnya".

KATEGORI PENGELUARAN (untuk type: "expense"):
${defaultExpenseCategories.map((cat, idx) => `${idx + 1}. "${cat}"`).join('\n')}

Pilih salah satu kategori pengeluaran di atas yang paling sesuai dengan transaksi.
Jika tidak ada yang sesuai, pilih "Lainnya"

DETEKSI WALLET/DOMPET (Opsional):
- Jika user menyebut nama bank/e-wallet, ekstrak sebagai "wallet_name"
- Contoh: "masuk ke BCA" → "wallet_name": "BCA"
- Contoh: "pakai Gopay" → "wallet_name": "Gopay"
- Contoh: "dari rekening Mandiri" → "wallet_name": "Mandiri"
- Nama wallet umum: BCA, Mandiri, BRI, BNI, Gopay, OVO, Dana, ShopeePay, LinkAja
- Jika tidak disebutkan, set "Tunai"

Aturan Pemilihan Kategori:
- Pilih kategori yang PALING SPESIFIK berdasarkan item dan tipe
- Untuk expense: gunakan kategori pengeluaran
- Untuk income: gunakan kategori pemasukan
- Field "date" WAJIB diisi dengan: "${today}"
- Amount harus angka murni (contoh: 25000, bukan "25.000")
- Jika tidak ada informasi amount, set amount ke 0

Contoh-contoh PENGELUARAN (Expense):
Input: "Beli kopi 25000 di fore"
Output: {"item": "Kopi", "amount": 25000, "category": "Makanan", "type": "expense", "location": "Fore", "payment_method": null, "wallet_name": "Tunai", "date": "${today}"}

Input: "Isi bensin 50000"
Output: {"item": "Bensin", "amount": 50000, "category": "Transportasi", "type": "expense", "location": null, "payment_method": null, "wallet_name": "Tunai", "date": "${today}"}

Contoh-contoh PEMASUKAN (Income):
Input: "Dapat bonus 5 juta"
Output: {"item": "Bonus", "amount": 5000000, "category": "Bonus", "type": "income", "location": null, "payment_method": null, "wallet_name": "Tunai", "date": "${today}"}

Sekarang proses teks ini:
"${text}"

PENTING:
1. Field "date" HARUS "${today}" (tanggal hari ini)
2. Deteksi "type" dengan BENAR (income atau expense) berdasarkan konteks
3. Pilih kategori yang TEPAT sesuai dengan tipe transaksi
4. Jika tidak ada wallet disebutkan, gunakan "Tunai"
5. Hanya berikan JSON, tanpa penjelasan atau teks tambahan
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if response was blocked
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('[DEMO] Gemini response blocked or empty');
      return NextResponse.json(
        {
          error: 'AI tidak dapat memproses input. Coba dengan kalimat yang lebih sederhana.',
        },
        { status: 500 }
      );
    }

    let extractedText = response.text();
    console.log('[DEMO] Gemini raw response:', extractedText);

    // Bersihkan response dari markdown code blocks
    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse JSON
    let jsonData;
    try {
      jsonData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('[DEMO] Error parsing response:', extractedText);
      return NextResponse.json(
        {
          error: 'Gagal mengekstrak JSON dari response AI',
          aiResponse: extractedText
        },
        { status: 500 }
      );
    }

    // Validasi dan enforce tanggal hari ini
    jsonData.date = today;
    jsonData.timestamp = new Date().toISOString();
    jsonData.originalText = text;

    // Pastikan wallet_name tidak null (default ke "Tunai")
    if (!jsonData.wallet_name) {
      jsonData.wallet_name = "Tunai";
    }

    console.log('[DEMO] Extracted JSON:', jsonData);

    // Return success response dengan rate limit headers
    return NextResponse.json({
      success: true,
      data: jsonData,
      message: 'Data berhasil diproses! Ini adalah mode demo - data tidak disimpan.',
      demo: true
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
      }
    });

  } catch (error: any) {
    console.error('[DEMO] API Error:', error);

    // Handle specific errors
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Model AI tidak tersedia' },
        { status: 404 }
      );
    }

    if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      return NextResponse.json(
        { error: 'Server AI sedang penuh. Coba lagi sebentar.' },
        { status: 503 }
      );
    }

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'API quota terlampaui. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

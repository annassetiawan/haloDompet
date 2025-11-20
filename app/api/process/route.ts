import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/db';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, webhookUrl } = await request.json();

    // Validasi input - hanya text yang wajib, webhookUrl optional
    if (!text) {
      return NextResponse.json(
        { error: 'Text harus diisi' },
        { status: 400 }
      );
    }

    // Validasi Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset. Tambahkan di .env.local' },
        { status: 500 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // Fetch dynamic categories from database
    const expenseCategories = await getCategories(authUser.id, 'expense');
    const incomeCategories = await getCategories(authUser.id, 'income');

    // Build category lists for prompt
    const expenseCategoryList = expenseCategories.map(c => c.name).join(', ');
    const incomeCategoryList = incomeCategories.map(c => c.name).join(', ');

    // Panggil Gemini API untuk ekstraksi JSON
    // Menggunakan Gemini 2.5 Flash Lite (model terbaru yang tersedia)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0];

    console.log('Processing text:', text);
    console.log('Expense categories:', expenseCategoryList);
    console.log('Income categories:', incomeCategoryList);

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
${incomeCategories.map((cat, idx) => `${idx + 1}. "${cat.name}"`).join('\n')}

Pilih salah satu kategori pemasukan di atas yang paling sesuai dengan transaksi.
Jika tidak ada yang sesuai dan ada kategori "Lainnya", pilih "Lainnya".

KATEGORI PENGELUARAN (untuk type: "expense"):
${expenseCategories.map((cat, idx) => `${idx + 1}. "${cat.name}"`).join('\n')}

Pilih salah satu kategori pengeluaran di atas yang paling sesuai dengan transaksi.
Jika tidak ada yang sesuai dan ada kategori "Lainnya", pilih "Lainnya"

DETEKSI WALLET/DOMPET (Opsional):
- Jika user menyebut nama bank/e-wallet, ekstrak sebagai "wallet_name"
- Contoh: "masuk ke BCA" → "wallet_name": "BCA"
- Contoh: "pakai Gopay" → "wallet_name": "Gopay"
- Contoh: "dari rekening Mandiri" → "wallet_name": "Mandiri"
- Nama wallet umum: BCA, Mandiri, BRI, BNI, Gopay, OVO, Dana, ShopeePay, LinkAja
- Jika tidak disebutkan, set null

Aturan Pemilihan Kategori:
- Pilih kategori yang PALING SPESIFIK berdasarkan item dan tipe
- Untuk expense: gunakan kategori pengeluaran
- Untuk income: gunakan kategori pemasukan
- Field "date" WAJIB diisi dengan: "${today}"
- Amount harus angka murni (contoh: 25000, bukan "25.000")
- Jika tidak ada informasi amount, set amount ke 0

Aturan Ekstraksi dari Input Natural:
- User bisa memberikan input detail seperti lokasi, metode pembayaran, wallet, dll
- EKSTRAK: item utama, amount, type, category, location, payment_method, wallet_name
- Location: nama toko/tempat (fore, pertamina, guardian, uniqlo, warteg, mall, gramedia, dll)
- Payment method: cara bayar (gopay, ovo, cash, kartu kredit, transfer BCA, shopee paylater, dll)
- Wallet name: nama dompet/rekening (BCA, Mandiri, Gopay, OVO, dll)
- Jika location, payment_method, atau wallet_name tidak disebutkan, set null

Contoh-contoh PENGELUARAN (Expense):
Input: "Beli kopi 25000 di fore bayar dengan gopay"
Output: {"item": "Kopi", "amount": 25000, "category": "Makanan", "type": "expense", "location": "Fore", "payment_method": "Gopay", "wallet_name": "Gopay", "date": "${today}"}

Input: "Isi bensin 50000 di pertamina pakai ovo"
Output: {"item": "Bensin", "amount": 50000, "category": "Transportasi", "type": "expense", "location": "Pertamina", "payment_method": "OVO", "wallet_name": "OVO", "date": "${today}"}

Input: "Langganan Netflix premium 186000 bayar pakai kartu kredit"
Output: {"item": "Netflix Premium", "amount": 186000, "category": "Hiburan", "type": "expense", "location": null, "payment_method": "Kartu Kredit", "wallet_name": null, "date": "${today}"}

Input: "Bayar wifi indihome bulan ini 300000 transfer BCA"
Output: {"item": "Wifi Indihome", "amount": 300000, "category": "Tagihan", "type": "expense", "location": null, "payment_method": "Transfer BCA", "wallet_name": "BCA", "date": "${today}"}

Contoh-contoh PEMASUKAN (Income):
Input: "Dapat bonus tahunan 5 juta masuk ke rekening BCA"
Output: {"item": "Bonus Tahunan", "amount": 5000000, "category": "Bonus", "type": "income", "location": null, "payment_method": null, "wallet_name": "BCA", "date": "${today}"}

Input: "Terima gaji bulan ini 8 juta di mandiri"
Output: {"item": "Gaji Bulanan", "amount": 8000000, "category": "Gaji", "type": "income", "location": null, "payment_method": null, "wallet_name": "Mandiri", "date": "${today}"}

Input: "Jual laptop bekas 3500000 transfer gopay"
Output: {"item": "Jual Laptop Bekas", "amount": 3500000, "category": "Penjualan", "type": "income", "location": null, "payment_method": "Transfer Gopay", "wallet_name": "Gopay", "date": "${today}"}

Input: "Dapat hadiah ulang tahun 500000 cash"
Output: {"item": "Hadiah Ulang Tahun", "amount": 500000, "category": "Hadiah", "type": "income", "location": null, "payment_method": "Cash", "wallet_name": null, "date": "${today}"}

Input: "Dividen saham 2 juta masuk BCA"
Output: {"item": "Dividen Saham", "amount": 2000000, "category": "Investasi", "type": "income", "location": null, "payment_method": null, "wallet_name": "BCA", "date": "${today}"}

Input: "Freelance design 1500000 transfer BRI"
Output: {"item": "Freelance Design", "amount": 1500000, "category": "Penjualan", "type": "income", "location": null, "payment_method": "Transfer BRI", "wallet_name": "BRI", "date": "${today}"}

Sekarang proses teks ini:
"${text}"

PENTING:
1. Field "date" HARUS "${today}" (tanggal hari ini)
2. Deteksi "type" dengan BENAR (income atau expense) berdasarkan konteks
3. Pilih kategori yang TEPAT sesuai dengan tipe transaksi
4. Ekstrak "wallet_name" jika disebutkan (BCA, Mandiri, Gopay, dll)
5. Hanya berikan JSON, tanpa penjelasan atau teks tambahan
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Check if response was blocked
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('Gemini response blocked or empty:', JSON.stringify(response));
      return NextResponse.json(
        {
          error: 'AI tidak dapat memproses input. Coba dengan kalimat yang lebih sederhana.',
          details: 'Response was blocked or empty'
        },
        { status: 500 }
      );
    }

    let extractedText = response.text();

    console.log('Gemini raw response:', extractedText);

    // Bersihkan response dari markdown code blocks jika ada
    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Cleaned response:', extractedText);

    // Parse JSON
    let jsonData;
    try {
      jsonData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', extractedText);
      return NextResponse.json(
        {
          error: 'Gagal mengekstrak JSON dari response AI',
          aiResponse: extractedText
        },
        { status: 500 }
      );
    }

    // Validasi dan enforce tanggal hari ini
    // Override apapun tanggal yang diberikan Gemini dengan tanggal hari ini
    jsonData.date = today;

    // Tambahkan timestamp
    jsonData.timestamp = new Date().toISOString();
    jsonData.originalText = text;

    console.log('Extracted JSON:', jsonData);

    // Kirim ke n8n webhook (hanya jika webhookUrl ada - untuk mode webhook)
    let webhookData = null;
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        });

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text();
          console.error('Webhook error:', errorText);
          // Jangan return error, karena data sudah berhasil di-extract
          // User tetap bisa simpan ke database
          console.warn('Webhook failed but continuing...');
        } else {
          webhookData = await webhookResponse.json().catch(() => ({}));
        }
      } catch (webhookError) {
        console.error('Webhook request failed:', webhookError);
        // Continue anyway - webhook optional
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: jsonData,
      webhookResponse: webhookData,
      message: webhookUrl
        ? 'Data berhasil diproses dan dikirim ke webhook!'
        : 'Data berhasil diproses!',
    });

  } catch (error: any) {
    console.error('API Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Check for specific Gemini API errors
    const errorMessage = error.message || '';

    // Model not found
    if (errorMessage.includes('404') || errorMessage.includes('not found') || errorMessage.includes('is not found')) {
      return NextResponse.json(
        {
          error: 'Model AI tidak tersedia',
          details: 'Model yang digunakan tidak tersedia di API key Anda. Silakan cek model yang tersedia atau perbarui kode.',
          errorType: 'ModelNotFound'
        },
        { status: 404 }
      );
    }

    // Service overloaded / unavailable
    if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('Service Unavailable')) {
      return NextResponse.json(
        {
          error: 'Server AI sedang penuh',
          details: 'Model Gemini sedang overload. Tunggu beberapa detik lalu coba lagi, atau ganti ke model lain.',
          errorType: 'ServiceOverloaded'
        },
        { status: 503 }
      );
    }

    // Rate limit / quota exceeded
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return NextResponse.json(
        {
          error: 'Gemini API quota terlampaui',
          details: 'API key Anda telah mencapai batas gratis. Silakan cek https://ai.google.dev/gemini-api/docs/quota atau ganti dengan API key baru.',
          errorType: 'QuotaExceeded'
        },
        { status: 429 }
      );
    }

    // API key invalid
    if (errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return NextResponse.json(
        {
          error: 'Gemini API key tidak valid',
          details: 'Periksa GEMINI_API_KEY di file .env.local Anda. Dapatkan API key baru di https://aistudio.google.com/apikey',
          errorType: 'InvalidAPIKey'
        },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        errorType: error.name
      },
      { status: 500 }
    );
  }
}

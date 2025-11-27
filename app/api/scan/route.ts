import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { getCategories } from '@/lib/db';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    // Validasi input
    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data harus diisi' },
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

    // Build category lists for prompt
    const expenseCategoryList = expenseCategories.map(c => c.name).join(', ');

    // Panggil Gemini API untuk OCR dan ekstraksi JSON
    // Menggunakan model yang sama dengan process route
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0];

    console.log('Processing receipt image...');
    console.log('Expense categories:', expenseCategoryList);

    // Extract base64 data (remove data:image/xxx;base64, prefix if exists)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = `
# SISTEM PROMPT: Receipt OCR - HaloDompet

## 🎯 TUGAS UTAMA
Kamu adalah mesin OCR khusus untuk membaca struk belanja/receipt. Analisis gambar struk dan ekstrak informasi transaksi dengan akurat.

## 📋 OUTPUT FORMAT (JSON ONLY - NO MARKDOWN!)
{
  "item": "Nama Merchant/Toko (misal: Alfamart, Indomaret, Starbucks)",
  "amount": number - total harga (angka murni tanpa separator),
  "date": "${today}" - gunakan tanggal hari ini,
  "category": "Pilih dari kategori yang tersedia di bawah",
  "type": "expense",
  "location": "Nama toko + cabang jika ada (misal: Alfamart Sudirman)",
  "payment_method": "Metode pembayaran jika tertera (misal: Cash, Debit BCA, QRIS)"
}

## 📊 KATEGORI PENGELUARAN YANG TERSEDIA:
${expenseCategories.map((cat, idx) => `${idx + 1}. ${cat.name}`).join('\n')}

## 🔍 INSTRUKSI EKSTRAKSI:

### 1. Merchant/Item (PRIORITAS TERTINGGI)
- Cari nama toko/merchant di bagian atas struk
- Biasanya ditulis dengan huruf besar atau bold
- Contoh: "ALFAMART", "INDOMARET", "STARBUCKS", "MCDONALD'S"
- Jika tidak jelas, cari nama brand atau logo yang terlihat

### 2. Total Amount (WAJIB)
- Cari kata kunci: "TOTAL", "GRAND TOTAL", "AMOUNT", "BAYAR"
- Ambil angka TERBESAR di struk (biasanya di bagian bawah)
- HARUS berupa angka murni (misal: 150000, bukan "150.000" atau "150rb")
- Jika ada beberapa angka total (subtotal, tax, dll), ambil yang paling akhir/grand total
- Jika tidak menemukan angka yang jelas, return 0

### 3. Date
- Cari tanggal di struk (format bisa DD/MM/YYYY, DD-MM-YYYY, dll)
- **NAMUN:** Untuk field "date" output, SELALU gunakan tanggal hari ini: "${today}"
- Jangan gunakan tanggal dari struk, karena user mungkin scan struk lama

### 4. Category
- Analisis jenis merchant dan pilih kategori yang PALING SESUAI
- Panduan:
  * Alfamart, Indomaret, minimarket → "Belanja Kebutuhan"
  * Restoran, cafe, warung → "Makanan"
  * Starbucks, Kopi Kenangan, coffee shop → "Makanan"
  * SPBU, Pertamina, Shell → "Transportasi"
  * Pharmacy, Apotek → "Kesehatan"
  * Clothing store, fashion → "Gaya Hidup"
  * Cinema, bioskop → "Hiburan"
- **PENTING:** HANYA pilih dari list kategori di atas. Jangan membuat kategori baru!
- Jika ragu, gunakan "Lainnya"

### 5. Location
- Gabungkan nama merchant dengan cabang/lokasi jika ada
- Contoh: "Alfamart Sudirman", "Starbucks Grand Indonesia"
- Jika tidak ada info cabang, cukup nama merchant saja

### 6. Payment Method
- Cari kata kunci: "CASH", "DEBIT", "CREDIT", "QRIS", "E-WALLET"
- Jika ada nama bank (BCA, Mandiri, dll), sertakan: "Debit BCA"
- Jika tidak tertera, gunakan null

## ⚠️ CRITICAL RULES:

1. Output HANYA JSON murni - TIDAK BOLEH ada markdown wrapper triple backtick json atau triple backtick
2. Amount HARUS number - Bukan string, bukan ada separator
3. Category HARUS dari list - Jangan ngarang kategori baru
4. Type SELALU "expense" - Ini struk pengeluaran
5. Date SELALU "${today}" - Jangan pakai tanggal dari struk
6. Jika gambar tidak jelas/bukan struk:
   Return: {"error": "Gambar tidak jelas atau bukan struk belanja", "item": null, "amount": 0, "category": "Lainnya", "type": "expense", "date": "${today}", "location": null, "payment_method": null}

## 📝 CONTOH OUTPUT:

### Contoh 1: Struk Alfamart
{"item": "Alfamart", "amount": 47500, "date": "${today}", "category": "Belanja Kebutuhan", "type": "expense", "location": "Alfamart Sudirman", "payment_method": "Cash"}

### Contoh 2: Struk Starbucks
{"item": "Starbucks", "amount": 85000, "date": "${today}", "category": "Makanan", "type": "expense", "location": "Starbucks Grand Indonesia", "payment_method": "Debit BCA"}

### Contoh 3: Struk SPBU
{"item": "Pertamina", "amount": 50000, "date": "${today}", "category": "Transportasi", "type": "expense", "location": "SPBU Pertamina", "payment_method": "Cash"}

### Contoh 4: Gambar tidak jelas
{"error": "Gambar tidak jelas atau bukan struk belanja", "item": null, "amount": 0, "category": "Lainnya", "type": "expense", "date": "${today}", "location": null, "payment_method": null}

## 🚀 EKSEKUSI:
Sekarang analisis gambar struk yang diberikan dan ekstrak informasinya dalam format JSON yang tepat!

**INGAT:** Output HANYA JSON murni, tidak ada teks tambahan apapun!
`;

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg', // Default to jpeg, bisa juga png/webp
        data: base64Data,
      },
    };

    // Generate content with image and prompt
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;

    // Check if response was blocked
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error('Gemini response blocked or empty:', JSON.stringify(response));
      return NextResponse.json(
        {
          error: 'AI tidak dapat memproses gambar. Coba dengan foto yang lebih jelas.',
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
          error: 'Gagal membaca struk. Coba foto dengan pencahayaan yang lebih baik.',
          aiResponse: extractedText
        },
        { status: 500 }
      );
    }

    // Check if there's an error from OCR
    if (jsonData.error) {
      return NextResponse.json(
        { error: jsonData.error },
        { status: 400 }
      );
    }

    // Validasi data yang wajib ada
    if (!jsonData.amount || jsonData.amount === 0) {
      return NextResponse.json(
        { error: 'Tidak dapat membaca total harga dari struk. Coba foto lebih jelas atau gunakan Input Manual.' },
        { status: 400 }
      );
    }

    // Enforce tanggal hari ini
    jsonData.date = today;

    // Ensure type is expense
    jsonData.type = 'expense';

    console.log('Extracted transaction data:', jsonData);

    // Return extracted data without saving to database
    // User will review and confirm before saving
    return NextResponse.json({
      success: true,
      data: jsonData,
      message: 'Struk berhasil di-scan! Silakan review sebelum menyimpan.',
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

    // Service overloaded / unavailable
    if (errorMessage.includes('503') || errorMessage.includes('overloaded') || errorMessage.includes('Service Unavailable')) {
      return NextResponse.json(
        {
          error: 'Server AI sedang sibuk. Tunggu sebentar dan coba lagi ya.',
          details: 'Gemini AI is currently overloaded',
          errorType: 'ServiceOverloaded'
        },
        { status: 503 }
      );
    }

    // Rate limit / quota exceeded
    if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('Too Many Requests')) {
      return NextResponse.json(
        {
          error: 'Quota AI terlampaui. Coba lagi nanti atau gunakan Input Manual.',
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
          details: 'Periksa GEMINI_API_KEY di file .env.local',
          errorType: 'InvalidAPIKey'
        },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Gagal memproses gambar. Coba lagi atau gunakan Input Manual.',
        details: error.message,
        errorType: error.name
      },
      { status: 500 }
    );
  }
}

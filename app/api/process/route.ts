import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // Panggil Gemini API untuk ekstraksi JSON
    // Menggunakan Gemini 2.5 Flash (model terbaru yang tersedia di API key Anda)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
Kamu adalah asisten AI yang mengekstrak data keuangan dari teks bahasa Indonesia.

INFORMASI PENTING:
- Tanggal hari ini adalah: ${today}
- Kamu HARUS menggunakan tanggal ini untuk field "date"

Tugas kamu:
1. Ekstrak informasi dari teks yang diberikan
2. Format output dalam JSON dengan struktur:
   {
     "item": "nama barang/jasa",
     "amount": angka (tanpa titik atau koma),
     "category": "kategori pengeluaran",
     "date": "${today}"
   }

KATEGORI YANG TERSEDIA DAN CONTOHNYA:
1. "Makanan" - untuk makanan, minuman, kopi, snack, makan siang, sarapan, makan malam
   Contoh: kopi, nasi goreng, burger, pizza, teh, jus, cemilan, makan siang

2. "Transportasi" - untuk bensin, parkir, tol, ojek online, taksi, grab, gojek, KRL, bus
   Contoh: bensin, parkir, tol, grab, gojek, ojol, tiket kereta, isi bensin

3. "Belanja" - untuk pakaian, baju, sepatu, aksesoris, gadget, elektronik, alat tulis
   Contoh: baju, celana, sepatu, tas, charger, headphone, mouse, pulpen

4. "Hiburan" - untuk bioskop, game, konser, streaming, spotify, netflix, youtube premium
   Contoh: tiket bioskop, langganan spotify, netflix, game, topup mobile legends

5. "Kesehatan" - untuk obat, dokter, rumah sakit, vitamin, masker, hand sanitizer
   Contoh: paracetamol, vitamin C, periksa dokter, rapid test, masker

6. "Tagihan" - untuk listrik, air, internet, wifi, pulsa, token listrik, BPJS
   Contoh: bayar listrik, token PLN, wifi, pulsa, paket data, BPJS

7. "Pendidikan" - untuk buku, kursus, les, seminar, workshop, udemy, coursera
   Contoh: beli buku, kursus online, les privat, workshop

8. "Olahraga" - untuk gym, fitness, sepeda, yoga, membership gym, jersey
   Contoh: membership gym, sepatu lari, yoga class, jersey

9. "Lainnya" - untuk yang tidak masuk kategori di atas

Aturan Pemilihan Kategori:
- Pilih kategori yang PALING SPESIFIK berdasarkan item
- Jangan selalu menggunakan "Makanan" atau "Lainnya"
- Perhatikan kata kunci di contoh setiap kategori
- Field "date" WAJIB diisi dengan: "${today}"
- Amount harus angka murni (contoh: 25000, bukan "25.000")
- Jika tidak ada informasi amount, set amount ke 0

Aturan Ekstraksi dari Input Natural:
- User bisa memberikan input detail seperti lokasi, metode pembayaran, dll
- EKSTRAK HANYA: item utama dan amount
- ABAIKAN: lokasi toko, metode pembayaran (gopay, ovo, cash, dll), detail lainnya
- Fokus pada BARANG/JASA yang dibeli dan JUMLAH uangnya

Contoh-contoh Input Natural:
Input: "Beli kopi 25000 di fore bayar dengan gopay"
Output: {"item": "Kopi", "amount": 25000, "category": "Makanan", "date": "${today}"}

Input: "Isi bensin 50000 di pertamina pakai ovo"
Output: {"item": "Bensin", "amount": 50000, "category": "Transportasi", "date": "${today}"}

Input: "Langganan Netflix premium 186000 bayar pakai kartu kredit"
Output: {"item": "Netflix Premium", "amount": 186000, "category": "Hiburan", "date": "${today}"}

Input: "Beli vitamin C 35000 di guardian bayar cash"
Output: {"item": "Vitamin C", "amount": 35000, "category": "Kesehatan", "date": "${today}"}

Input: "Bayar wifi indihome bulan ini 300000 transfer BCA"
Output: {"item": "Wifi Indihome", "amount": 300000, "category": "Tagihan", "date": "${today}"}

Input: "Parkir di mall 5000"
Output: {"item": "Parkir", "amount": 5000, "category": "Transportasi", "date": "${today}"}

Input: "Makan siang di warteg 15000 bayar cash"
Output: {"item": "Makan Siang", "amount": 15000, "category": "Makanan", "date": "${today}"}

Input: "Beli baju di uniqlo 250000 pakai shopee paylater"
Output: {"item": "Baju", "amount": 250000, "category": "Belanja", "date": "${today}"}

Input: "Gojek ke kantor 25000"
Output: {"item": "Gojek", "amount": 25000, "category": "Transportasi", "date": "${today}"}

Input: "Beli buku atomic habits 95000 di gramedia"
Output: {"item": "Buku Atomic Habits", "amount": 95000, "category": "Pendidikan", "date": "${today}"}

Sekarang proses teks ini:
"${text}"

PENTING:
1. Field "date" HARUS "${today}" (tanggal hari ini)
2. Pilih kategori yang TEPAT, jangan asal pilih "Makanan" atau "Lainnya"
3. Hanya berikan JSON, tanpa penjelasan atau teks tambahan
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let extractedText = response.text();

    // Bersihkan response dari markdown code blocks jika ada
    extractedText = extractedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

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
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { text, webhookUrl } = await request.json();

    // Validasi input
    if (!text || !webhookUrl) {
      return NextResponse.json(
        { error: 'Text dan webhookUrl harus diisi' },
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
    // Menggunakan Gemini 2.0 Flash (model terbaru dan lebih cepat)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
Kamu adalah asisten AI yang mengekstrak data keuangan dari teks bahasa Indonesia.

Tugas kamu:
1. Ekstrak informasi dari teks yang diberikan
2. Format output dalam JSON dengan struktur:
   {
     "item": "nama barang/jasa",
     "amount": angka (tanpa titik atau koma),
     "category": "kategori pengeluaran",
     "date": "tanggal hari ini dalam format YYYY-MM-DD"
   }

Aturan:
- Jika kategori tidak disebutkan, tebak berdasarkan konteks item
- Kategori umum: "Makanan", "Transportasi", "Belanja", "Hiburan", "Kesehatan", "Lainnya"
- Amount harus angka murni (contoh: 25000, bukan "25.000")
- Jika tidak ada informasi amount, set amount ke 0

Contoh input: "Beli kopi 25000"
Contoh output:
{
  "item": "Kopi",
  "amount": 25000,
  "category": "Makanan",
  "date": "${new Date().toISOString().split('T')[0]}"
}

Sekarang proses teks ini:
"${text}"

PENTING: Hanya berikan JSON, tanpa penjelasan atau teks tambahan.
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

    // Tambahkan timestamp
    jsonData.timestamp = new Date().toISOString();
    jsonData.originalText = text;

    console.log('Extracted JSON:', jsonData);

    // Kirim ke n8n webhook
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
      return NextResponse.json(
        {
          error: 'Gagal mengirim ke n8n webhook',
          webhookStatus: webhookResponse.status,
          webhookError: errorText
        },
        { status: 500 }
      );
    }

    const webhookData = await webhookResponse.json().catch(() => ({}));

    // Return success response
    return NextResponse.json({
      success: true,
      data: jsonData,
      webhookResponse: webhookData,
      message: 'Data berhasil diproses dan dikirim ke n8n!',
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

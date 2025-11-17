import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTransactions, getTransactionStats } from '@/lib/db'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        {
          error: 'AI service not configured',
          details: 'GEMINI_API_KEY belum di-set. Silakan tambahkan API key di environment variables. Lihat GEMINI_SETUP.md untuk panduan lengkap.'
        },
        { status: 503 }
      )
    }

    // Get user's transaction data for context
    const transactions = await getTransactions(user.id, { limit: 50 })
    const stats = await getTransactionStats(user.id)

    // Build context from transaction data
    const contextData = {
      totalTransactions: stats.totalTransactions,
      totalSpent: stats.totalSpent,
      averageTransaction: stats.averageTransaction,
      topCategories: stats.categorySummary.slice(0, 5).map(cat => ({
        category: cat.category,
        total: cat.total,
        count: cat.count,
      })),
      recentTransactions: transactions.slice(0, 10).map(t => ({
        item: t.item,
        amount: t.amount,
        category: t.category,
        date: t.date,
      })),
    }

    // Build system prompt with user's financial data
    const systemPrompt = `Kamu adalah HaloDompet AI, asisten keuangan pribadi yang ramah dan membantu.

Data Keuangan User (Semua waktu):
- Total Transaksi: ${stats.totalTransactions}
- Total Pengeluaran: Rp ${stats.totalSpent.toLocaleString('id-ID')}
- Rata-rata per Transaksi: Rp ${stats.averageTransaction.toLocaleString('id-ID')}

Top 5 Kategori Pengeluaran:
${stats.categorySummary.slice(0, 5).map((cat, i) =>
  `${i + 1}. ${cat.category}: Rp ${cat.total.toLocaleString('id-ID')} (${cat.count} transaksi)`
).join('\n')}

Tugas kamu:
1. Bantu user memahami pola pengeluaran mereka
2. Berikan saran praktis untuk menghemat
3. Jawab pertanyaan tentang keuangan dengan data yang ada
4. Gunakan bahasa Indonesia yang santai tapi profesional
5. Selalu berikan jawaban yang spesifik berdasarkan data user
6. Jika user bertanya tentang kategori tertentu, analisis data kategori tersebut

Catatan Penting:
- Gunakan emoji yang relevan untuk membuat percakapan lebih menarik
- Berikan tips yang actionable, bukan sekedar teori
- Jika ada pola spending yang concerning, sampaikan dengan bijak
- Format angka dengan Rp dan separator ribuan
`

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    // Build conversation history for context
    const chatHistory = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    // Start chat with history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Siap membantu! Saya sudah memahami data keuangan Anda. Ada yang ingin Anda tanyakan tentang pengeluaran Anda?' }],
        },
        ...chatHistory,
      ],
    })

    // Send user message
    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({
      success: true,
      response,
      context: contextData, // Send context data back for UI display if needed
    })
  } catch (error) {
    console.error('AI Advisor API error:', error)

    // Better error messages
    let errorMessage = 'Terjadi kesalahan saat berkomunikasi dengan AI'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    // Check for specific Gemini API errors
    if (errorDetails.includes('API_KEY_INVALID')) {
      errorMessage = 'API key tidak valid'
      errorDetails = 'Gemini API key yang Anda gunakan tidak valid. Silakan periksa kembali API key di environment variables.'
    } else if (errorDetails.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Quota API telah habis'
      errorDetails = 'Quota Gemini API untuk hari ini sudah habis. Silakan coba lagi besok atau upgrade ke paid plan.'
    } else if (errorDetails.includes('RATE_LIMIT')) {
      errorMessage = 'Terlalu banyak request'
      errorDetails = 'Anda mengirim terlalu banyak pesan. Silakan tunggu beberapa saat sebelum mencoba lagi.'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}

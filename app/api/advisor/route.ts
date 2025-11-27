import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTransactions, getTransactionStats } from '@/lib/db'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Types
interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface CategorySummary {
  category: string
  total: number
  count: number
  percentage: number
}

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW = 60 * 1000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT) return false
  userLimit.count++
  return true
}

// Build system prompt
function buildSystemPrompt(stats: any, categories: CategorySummary[], recentTransactions: any[]): string {
  const highestCategory = categories[0]

  return `Kamu adalah Dompie, asisten keuangan pribadi di HaloDompet.

## Gaya Komunikasi
- Bahasa Indonesia santai tapi profesional
- Respons singkat dan to-the-point (max 100 kata kecuali diminta detail)
- Gunakan emoji secukupnya (1-2 per respons)
- Supportive, tidak menghakimi
- PENTING: Gunakan markdown minimal - HANYA bold (**) untuk angka/jumlah uang atau poin penting
- Jangan gunakan bold untuk setiap kategori atau kata - terlalu banyak bold membuat sulit dibaca

## Data Keuangan User

### Ringkasan
- Total: ${stats.totalTransactions} transaksi
- Pengeluaran: Rp ${stats.totalSpent.toLocaleString('id-ID')}
- Rata-rata: Rp ${stats.averageTransaction.toLocaleString('id-ID')}/transaksi

### Top Kategori
${categories.map((cat, i) =>
    `${i + 1}. ${cat.category}: Rp ${cat.total.toLocaleString('id-ID')} (${cat.percentage.toFixed(1)}%)`
  ).join('\n')}

### Transaksi Terakhir
${recentTransactions.slice(0, 5).map(t =>
    `- ${t.item}: Rp ${t.amount.toLocaleString('id-ID')} [${t.category}]`
  ).join('\n')}

## Panduan
- Jawab dengan data spesifik jika ditanya
- Berikan 2-3 tips actionable jika diminta saran
${highestCategory && highestCategory.percentage > 40 ?
    `- ⚠️ Kategori "${highestCategory.category}" = ${highestCategory.percentage.toFixed(0)}% dari total (cukup tinggi)` : ''}
- Jangan mengarang data yang tidak ada
- Format: "Rp X.XXX.XXX"`
}

function sanitizeMessage(message: string): string {
  return message.trim().slice(0, 2000).replace(/[<>]/g, '')
}

// Streaming endpoint
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limited', retryAfter: 60 }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const body = await request.json()
    const { message, conversationHistory = [], stream = true } = body

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedMessage = sanitizeMessage(message)

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'AI service not configured',
          details: 'GEMINI_API_KEY belum di-set. Silakan tambahkan API key di environment variables. Lihat GEMINI_SETUP.md untuk panduan lengkap.'
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Fetch data
    const [transactions, stats] = await Promise.all([
      getTransactions(user.id, { limit: 50 }),
      getTransactionStats(user.id)
    ])

    const categories: CategorySummary[] = stats.categorySummary.slice(0, 5).map(cat => ({
      category: cat.category,
      total: cat.total,
      count: cat.count,
      percentage: stats.totalSpent > 0 ? (cat.total / stats.totalSpent) * 100 : 0
    }))

    const recentTransactions = transactions.slice(0, 10).map(t => ({
      item: t.item,
      amount: t.amount,
      category: t.category,
      date: t.date,
    }))

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    })

    const systemPrompt = buildSystemPrompt(stats, categories, recentTransactions)

    // Build history
    const recentHistory = conversationHistory.slice(-10)
    const chatHistory = recentHistory.map((msg: Message) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }))

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Halo! Aku Dompie. Ada yang mau kamu tanyakan tentang keuanganmu? 😊' }] },
        ...chatHistory,
      ],
    })

    // Streaming response
    if (stream) {
      const result = await chat.sendMessageStream(sanitizedMessage)

      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                // Send as Server-Sent Events format
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            }
            // Send done signal
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          } catch (error) {
            console.error('[Stream Error]', error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Non-streaming fallback
    const result = await chat.sendMessage(sanitizedMessage)
    const response = result.response.text()

    return new Response(
      JSON.stringify({
        success: true,
        response,
        context: {
          totalTransactions: stats.totalTransactions,
          totalSpent: stats.totalSpent,
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[AI Advisor Error]', error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    let statusCode = 500
    let errorResponse = { error: 'Terjadi kesalahan', code: 'INTERNAL_ERROR' }

    if (message.includes('API_KEY')) {
      statusCode = 503
      errorResponse = { error: 'API tidak valid', code: 'INVALID_KEY' }
    } else if (message.includes('QUOTA') || message.includes('429')) {
      statusCode = 429
      errorResponse = { error: 'Limit tercapai', code: 'QUOTA_EXCEEDED' }
    } else if (message.includes('SAFETY')) {
      statusCode = 400
      errorResponse = { error: 'Pesan tidak dapat diproses', code: 'BLOCKED' }
    }

    return new Response(
      JSON.stringify(errorResponse),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      status: process.env.GEMINI_API_KEY ? 'healthy' : 'degraded',
      service: 'ai-advisor-stream',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

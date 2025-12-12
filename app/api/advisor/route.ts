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

// Helper to convert month code to Indonesian month name
function getMonthName(monthCode: string): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const [year, month] = monthCode.split('-')
  return `${months[parseInt(month) - 1]} ${year}`
}

// Build system prompt
function buildSystemPrompt(stats: any, categories: CategorySummary[], recentTransactions: any[], monthlyCategories: Map<string, Map<string, number>>): string {
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

### Ringkasan Keuangan
- Pemasukan: Rp ${stats.totalIncome.toLocaleString('id-ID')} (${stats.totalIncomeTransactions} transaksi)
- Pengeluaran: Rp ${stats.totalSpent.toLocaleString('id-ID')} (${stats.totalTransactions} transaksi)
- Arus Kas Bersih: Rp ${stats.netCashFlow.toLocaleString('id-ID')} ${stats.netCashFlow >= 0 ? '✅' : '⚠️'}
- Rata-rata Pengeluaran: Rp ${stats.averageTransaction.toLocaleString('id-ID')}/transaksi

### Top Kategori Pengeluaran
${categories.map((cat, i) =>
    `${i + 1}. ${cat.category}: Rp ${cat.total.toLocaleString('id-ID')} (${cat.percentage.toFixed(1)}%)`
  ).join('\n')}

### Transaksi Pengeluaran Terakhir
${recentTransactions.slice(0, 5).map(t =>
    `- ${t.item}: Rp ${t.amount.toLocaleString('id-ID')} [${t.category}]`
  ).join('\n')}

### Pengeluaran Per Bulan (6 Bulan Terakhir)
${stats.monthlyData.map((m: any) => {
  const monthCats = Array.from(monthlyCategories.get(m.month)?.entries() || [])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  const catsStr = monthCats.map(([cat, amt]) => `${cat} Rp ${amt.toLocaleString('id-ID')}`).join(', ')
  return `- ${getMonthName(m.month)}: Total Rp ${m.total.toLocaleString('id-ID')} (${m.count}x)\n  Kategori: ${catsStr || 'Tidak ada'}`
}).join('\n')}

## Panduan
- Data di atas HANYA menampilkan PENGELUARAN (tidak termasuk saldo awal atau adjustment)
- Pemasukan dan pengeluaran sudah dipisahkan dengan benar
- Arus Kas Bersih = Pemasukan - Pengeluaran
- Kamu BISA menjawab pertanyaan tentang pengeluaran bulan tertentu dari data "Pengeluaran Per Bulan"
- Jika ditanya "pengeluaran bulan X berapa", lihat data bulanan di atas
- Jika ditanya kategori per bulan, lihat "Terbesar" di data bulanan
- Jawab dengan data spesifik jika ditanya
- Berikan 2-3 tips actionable jika diminta saran
${highestCategory && highestCategory.percentage > 40 ?
    `- ⚠️ Kategori "${highestCategory.category}" = ${highestCategory.percentage.toFixed(0)}% dari total pengeluaran (cukup tinggi)` : ''}
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

    // Fetch data - separate income and expenses for accurate AI analysis
    const supabaseClient = await createClient()

    // Fetch all transactions first
    const allTransactions = await getTransactions(user.id, { limit: 100 })

    // Separate transactions by type
    // Separate transactions by type
    const expenseTransactions = allTransactions.filter(t => t.type === 'expense' && t.category !== 'Transfer Keluar')
    const incomeTransactions = allTransactions.filter(t => t.type === 'income' && t.category !== 'Transfer Masuk')

    // Calculate expense stats
    const totalSpent = expenseTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    const totalExpenseTransactions = expenseTransactions.length
    const averageExpense = totalExpenseTransactions > 0 ? totalSpent / totalExpenseTransactions : 0

    // Calculate income stats
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
    const totalIncomeTransactions = incomeTransactions.length

    // Group by category (expenses only)
    const categoryMap = new Map<string, { total: number; count: number }>()
    expenseTransactions.forEach(t => {
      const existing = categoryMap.get(t.category) || { total: 0, count: 0 }
      categoryMap.set(t.category, {
        total: existing.total + parseFloat(t.amount.toString()),
        count: existing.count + 1,
      })
    })

    const categorySummaryRaw = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total)

    // Group by month (last 6 months)
    const monthlyExpenses = new Map<string, { total: number; count: number; income: number }>()
    const monthlyCategories = new Map<string, Map<string, number>>()

    // Process expenses by month
    expenseTransactions.forEach(t => {
      const monthKey = t.date.substring(0, 7) // YYYY-MM format
      const existing = monthlyExpenses.get(monthKey) || { total: 0, count: 0, income: 0 }
      monthlyExpenses.set(monthKey, {
        total: existing.total + parseFloat(t.amount.toString()),
        count: existing.count + 1,
        income: existing.income
      })

      // Track categories per month
      if (!monthlyCategories.has(monthKey)) {
        monthlyCategories.set(monthKey, new Map())
      }
      const monthCats = monthlyCategories.get(monthKey)!
      const catTotal = monthCats.get(t.category) || 0
      monthCats.set(t.category, catTotal + parseFloat(t.amount.toString()))
    })

    // Add income to monthly data
    incomeTransactions.forEach(t => {
      const monthKey = t.date.substring(0, 7)
      const existing = monthlyExpenses.get(monthKey) || { total: 0, count: 0, income: 0 }
      monthlyExpenses.set(monthKey, {
        ...existing,
        income: existing.income + parseFloat(t.amount.toString())
      })
    })

    // Sort months and get last 6 months
    const monthlyData = Array.from(monthlyExpenses.entries())
      .map(([month, data]) => ({
        month,
        ...data,
        netFlow: data.income - data.total
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6)

    const stats = {
      totalSpent,
      totalTransactions: totalExpenseTransactions,
      averageTransaction: averageExpense,
      totalIncome,
      totalIncomeTransactions,
      netCashFlow: totalIncome - totalSpent,
      categorySummary: categorySummaryRaw,
      monthlyData,
      monthlyCategories
    }

    const categories: CategorySummary[] = stats.categorySummary.slice(0, 5).map(cat => ({
      category: cat.category,
      total: cat.total,
      count: cat.count,
      percentage: stats.totalSpent > 0 ? (cat.total / stats.totalSpent) * 100 : 0
    }))

    const recentTransactions = expenseTransactions.slice(0, 10).map(t => ({
      item: t.item,
      amount: t.amount,
      category: t.category,
      date: t.date,
    }))

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
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

    const systemPrompt = buildSystemPrompt(stats, categories, recentTransactions, stats.monthlyCategories) + 
    "\n\nPENTING: Roasting dengan pedas tapi lucu. Gunakan bahasa santai dan emoji. Komentari saldo, pemasukan, dan pengeluaran."

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
          let chunkCount = 0;
          try {
            for await (const chunk of result.stream) {
              const text = chunk.text()
              if (text) {
                chunkCount++;
                // Send as Server-Sent Events format
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
              }
            }
            
            if (chunkCount === 0) {
              throw new Error('AI returned empty response');
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

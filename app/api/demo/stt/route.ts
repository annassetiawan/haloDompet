import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 20 // 20 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip)

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Coba lagi dalam 1 jam.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitMap.get(ip)?.resetTime || Date.now()),
          }
        }
      )
    }

    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        {
          success: false,
          error: 'STT service not configured',
        },
        { status: 503 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.error('No audio file in request')
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Log file info
    console.log('Demo STT - Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (audioFile.size > maxSize) {
      console.error('File too large:', audioFile.size)
      return NextResponse.json(
        { success: false, error: 'File terlalu besar. Maksimal 10MB' },
        { status: 400 }
      )
    }

    // Validate file is not empty
    if (audioFile.size === 0) {
      console.error('File is empty')
      return NextResponse.json(
        { success: false, error: 'File audio kosong' },
        { status: 400 }
      )
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Audio = buffer.toString('base64')

    // Get file MIME type
    const mimeType = audioFile.type || 'audio/webm'
    console.log('Processing audio with MIME type:', mimeType)

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Prepare audio part for Gemini
    const audioPart = {
      inlineData: {
        data: base64Audio,
        mimeType: mimeType,
      },
    }

    // Transcribe audio using Gemini
    const prompt = `Transkripsi audio ini ke teks bahasa Indonesia.
Audio berisi ucapan tentang pengeluaran atau pembelian.
HANYA berikan teks transkripsi, tanpa penjelasan apapun.
Contoh format yang diharapkan: "beli kopi dua puluh ribu" atau "makan siang lima puluh ribu"`

    console.log('Sending to Gemini API for transcription...')
    const result = await model.generateContent([prompt, audioPart])
    console.log('Gemini API response received')

    const response = result.response
    const text = response.text().trim()

    console.log('Transcription result:', {
      length: text.length,
      preview: text.substring(0, 100)
    })

    if (!text) {
      console.warn('Empty transcription returned')
      return NextResponse.json(
        { success: false, error: 'Suara tidak terdeteksi atau tidak jelas' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        text: text,
      },
      {
        headers: {
          'X-RateLimit-Remaining': String(remaining),
        }
      }
    )

  } catch (error) {
    console.error('Demo STT API error:', error)

    let errorMessage = 'Terjadi kesalahan saat memproses audio'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    // Handle specific Gemini API errors
    if (errorDetails.includes('API_KEY_INVALID')) {
      errorMessage = 'Service temporarily unavailable'
    } else if (errorDetails.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Quota API telah habis. Coba lagi besok.'
    } else if (errorDetails.includes('RATE_LIMIT')) {
      errorMessage = 'Terlalu banyak request. Tunggu sebentar.'
    } else if (errorDetails.includes('UNSUPPORTED_MEDIA')) {
      errorMessage = 'Format audio tidak didukung'
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

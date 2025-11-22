import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Simple in-memory rate limiting (same as demo/process)
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
  const maxRequests = 10; // More generous for STT since it's just transcription

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
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

  return 'dev-ip';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting for demo
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetTime);
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: 'Demo terbatas 10x per jam. Silakan login untuk akses penuh!'
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetDate.toISOString()
          }
        }
      );
    }

    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('[DEMO STT] GEMINI_API_KEY is not set')
      return NextResponse.json(
        {
          error: 'STT service not configured',
          details: 'GEMINI_API_KEY belum di-set'
        },
        { status: 503 }
      )
    }

    // Parse multipart form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.error('[DEMO STT] No audio file in request')
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Log file info
    console.log('[DEMO STT] Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (audioFile.size > maxSize) {
      console.error('[DEMO STT] File too large:', audioFile.size)
      return NextResponse.json(
        { error: 'File terlalu besar. Maksimal 10MB' },
        { status: 400 }
      )
    }

    // Validate file is not empty
    if (audioFile.size === 0) {
      console.error('[DEMO STT] File is empty')
      return NextResponse.json(
        { error: 'File audio kosong' },
        { status: 400 }
      )
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Audio = buffer.toString('base64')

    // Get file MIME type
    const mimeType = audioFile.type || 'audio/webm'
    console.log('[DEMO STT] Processing audio with MIME type:', mimeType)

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

    console.log('[DEMO STT] Sending to Gemini API for transcription...')
    const result = await model.generateContent([prompt, audioPart])
    console.log('[DEMO STT] Gemini API response received')

    const response = result.response
    const text = response.text().trim()

    console.log('[DEMO STT] Transcription result:', {
      length: text.length,
      preview: text.substring(0, 100)
    })

    if (!text) {
      console.warn('[DEMO STT] Empty transcription returned')
      return NextResponse.json(
        { error: 'Suara tidak terdeteksi atau tidak jelas' },
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
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString()
        }
      }
    )

  } catch (error) {
    console.error('[DEMO STT] API error:', error)

    let errorMessage = 'Terjadi kesalahan saat memproses audio'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    // Handle specific Gemini API errors
    if (errorDetails.includes('API_KEY_INVALID')) {
      errorMessage = 'API key tidak valid'
    } else if (errorDetails.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Quota API telah habis'
    } else if (errorDetails.includes('RATE_LIMIT')) {
      errorMessage = 'Terlalu banyak request'
    } else if (errorDetails.includes('UNSUPPORTED_MEDIA')) {
      errorMessage = 'Format audio tidak didukung'
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}

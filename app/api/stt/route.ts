import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json(
        {
          error: 'STT service not configured',
          details: 'GEMINI_API_KEY belum di-set. Silakan tambahkan API key di environment variables.'
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
        { error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Log file info
    console.log('Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (audioFile.size > maxSize) {
      console.error('File too large:', audioFile.size)
      return NextResponse.json(
        { error: 'File terlalu besar. Maksimal 10MB' },
        { status: 400 }
      )
    }

    // Validate file is not empty
    if (audioFile.size === 0) {
      console.error('File is empty')
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
        { error: 'Suara tidak terdeteksi atau tidak jelas' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      text: text,
    })

  } catch (error) {
    console.error('STT API error:', error)

    let errorMessage = 'Terjadi kesalahan saat memproses audio'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'

    // Handle specific Gemini API errors
    if (errorDetails.includes('API_KEY_INVALID')) {
      errorMessage = 'API key tidak valid'
      errorDetails = 'Gemini API key yang Anda gunakan tidak valid. Silakan periksa kembali.'
    } else if (errorDetails.includes('QUOTA_EXCEEDED')) {
      errorMessage = 'Quota API telah habis'
      errorDetails = 'Quota Gemini API untuk hari ini sudah habis. Silakan coba lagi besok.'
    } else if (errorDetails.includes('RATE_LIMIT')) {
      errorMessage = 'Terlalu banyak request'
      errorDetails = 'Anda mengirim terlalu banyak request. Silakan tunggu beberapa saat.'
    } else if (errorDetails.includes('UNSUPPORTED_MEDIA')) {
      errorMessage = 'Format audio tidak didukung'
      errorDetails = 'Format audio yang Anda upload tidak didukung. Gunakan format webm, mp3, atau wav.'
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    )
  }
}

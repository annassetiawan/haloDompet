import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  console.log('🚀 Demo STT API Called')

  try {
    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables')
      return NextResponse.json(
        {
          success: false,
          error: 'Service not configured - GEMINI_API_KEY missing',
        },
        { status: 503 }
      )
    }

    console.log('✅ GEMINI_API_KEY is configured')

    // Parse multipart form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      console.error('❌ No audio file in request')
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      )
    }

    // Log file info
    console.log('📁 Received audio file:', {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
    })

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (audioFile.size > maxSize) {
      console.error('❌ File too large:', audioFile.size)
      return NextResponse.json(
        { success: false, error: 'File terlalu besar. Maksimal 10MB' },
        { status: 400 }
      )
    }

    // Validate file is not empty
    if (audioFile.size === 0) {
      console.error('❌ File is empty')
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
    console.log('🎵 Processing audio with MIME type:', mimeType)

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

    console.log('🤖 Sending to Gemini API for transcription...')
    const result = await model.generateContent([prompt, audioPart])
    console.log('✅ Gemini API response received')

    const response = result.response
    const text = response.text().trim()

    console.log('📝 Transcription result:', {
      length: text.length,
      preview: text.substring(0, 100),
    })

    if (!text) {
      console.warn('⚠️ Empty transcription returned')
      return NextResponse.json(
        { success: false, error: 'Suara tidak terdeteksi atau tidak jelas' },
        { status: 400 }
      )
    }

    console.log('🎉 Success! Returning transcription:', text)

    return NextResponse.json({
      success: true,
      text: text,
    })
  } catch (error) {
    console.error('❌ Demo STT API error:', error)

    let errorMessage = 'Terjadi kesalahan saat memproses audio'
    const errorDetails = error instanceof Error ? error.message : 'Unknown error'

    console.error('Error details:', {
      message: errorDetails,
      stack: error instanceof Error ? error.stack : 'N/A',
    })

    // Handle specific Gemini errors
    if (
      errorDetails.includes('429') ||
      errorDetails.includes('quota') ||
      errorDetails.includes('QUOTA') ||
      errorDetails.includes('RESOURCE_EXHAUSTED')
    ) {
      console.error('⚠️ Gemini STT Quota Exceeded!')
      errorMessage = 'Maaf, AI sedang sibuk. Silakan coba beberapa saat lagi.'
    } else if (errorDetails.includes('API_KEY_INVALID')) {
      errorMessage = 'Service temporarily unavailable - Invalid API Key'
    } else if (errorDetails.includes('RATE_LIMIT')) {
      errorMessage = 'Terlalu banyak request. Tunggu sebentar.'
    } else if (errorDetails.includes('UNSUPPORTED_MEDIA')) {
      errorMessage = 'Format audio tidak didukung'
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}

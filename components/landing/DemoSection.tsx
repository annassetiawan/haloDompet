"use client"

import { useState } from 'react'
import { RecordButton } from '@/components/RecordButton'
import { DemoReceipt } from './DemoReceipt'
import { Loader2, Sparkles } from 'lucide-react'

interface ExtractedData {
  item: string
  amount: number
  category: string
  type: 'income' | 'expense'
  wallet_name?: string
  location?: string | null
  payment_method?: string | null
}

export function DemoSection() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string>('')

  const handleTranscript = async (text: string) => {
    console.log('Transcript received:', text)
    setIsProcessing(true)
    setError(null)
    setExtractedData(null)

    try {
      const response = await fetch('/api/demo/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError(result.message || 'Rate limit tercapai. Silakan login untuk akses penuh!')
        } else {
          setError(result.error || 'Terjadi kesalahan saat memproses data')
        }
        return
      }

      if (result.success && result.data) {
        setExtractedData(result.data)
      } else {
        setError('Gagal mengekstrak data dari ucapan Anda')
      }
    } catch (err) {
      console.error('Error processing demo:', err)
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleError = (errorMessage: string) => {
    console.error('Recording error:', errorMessage)
    setError(errorMessage)
    setIsProcessing(false)
  }

  const handleStatusChange = (status: string) => {
    console.log('Status:', status)
    setStatusMessage(status)
  }

  return (
    <section id="demo" className="relative py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-violet-500/20 bg-violet-500/10">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-500">The Magic Demo</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Lihat AI Bekerja
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Cobain aja dulu. Tekan & bilang:
            </p>
          </div>

          {/* Demo Instructions */}
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-4 bg-muted/50 rounded-2xl border border-border">
              <p className="text-lg md:text-xl font-medium mb-2">
                💬 Contoh: "Beli kopi 25 ribu di Fore"
              </p>
              <p className="text-sm text-muted-foreground">
                atau coba: "Isi bensin 50 ribu" • "Dapat gaji 5 juta"
              </p>
            </div>
          </div>

          {/* Demo Interface */}
          <div className="space-y-8">
            {/* Record Button Area */}
            {!extractedData && (
              <div className="text-center">
                <RecordButton
                  onTranscript={handleTranscript}
                  onError={handleError}
                  onStatusChange={handleStatusChange}
                  isLoading={false}
                />

                {/* Status Message */}
                {statusMessage && !isProcessing && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {statusMessage}
                  </p>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <div className="mt-8 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    <p className="text-lg font-medium">AI sedang berpikir...</p>
                    <p className="text-sm text-muted-foreground">
                      Mengekstrak informasi dari ucapan Anda
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-500 text-sm">{error}</p>
                    {error.includes('Rate limit') && (
                      <a
                        href="/login"
                        className="mt-2 inline-block text-sm text-violet-500 hover:underline"
                      >
                        Login untuk akses unlimited →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Result - Demo Receipt */}
            {extractedData && (
              <div className="space-y-6">
                <DemoReceipt data={extractedData} />

                {/* Try Again Button */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setExtractedData(null)
                      setError(null)
                      setStatusMessage('')
                    }}
                    className="px-6 py-3 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted/50 transition-all"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 mb-4 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Voice Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Teknologi speech-to-text yang akurat untuk bahasa Indonesia
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 mb-4 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Extraction</h3>
              <p className="text-sm text-muted-foreground">
                AI Gemini mendeteksi item, harga, kategori secara otomatis
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 mb-4 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Instant Save</h3>
              <p className="text-sm text-muted-foreground">
                Transaksi tersimpan otomatis. Tidak perlu input manual lagi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

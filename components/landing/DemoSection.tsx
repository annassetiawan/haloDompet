"use client"

import { useState } from 'react'
import { DemoRecordButton } from './DemoRecordButton'
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
    <section id="demo" className="relative py-32 md:py-40">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-300">Coba Sihir AI-nya Sekarang 👇</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
              Lihat{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400">
                AI Bekerja
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Cobain aja dulu. Tekan & bilang:
            </p>
          </div>

          {/* Demo Instructions */}
          <div className="text-center mb-16">
            <div className="inline-block px-8 py-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
              <p className="text-lg md:text-2xl font-bold mb-3 text-white">
                💬 Contoh: "Beli kopi 25 ribu di Fore"
              </p>
              <p className="text-sm text-gray-400">
                atau coba: <span className="text-white font-semibold">"Isi bensin 50 ribu"</span> •{' '}
                <span className="text-white font-semibold">"Dapat gaji 5 juta"</span>
              </p>
            </div>
          </div>

          {/* Demo Interface */}
          <div className="space-y-8">
            {/* Record Button Area */}
            {!extractedData && (
              <div className="text-center">
                <DemoRecordButton
                  onTranscript={handleTranscript}
                  onError={handleError}
                  onStatusChange={handleStatusChange}
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
                  <div className="mt-8 p-5 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                    <p className="text-red-400 font-medium">{error}</p>
                    {error.includes('Rate limit') && (
                      <a
                        href="/login"
                        className="mt-3 inline-block text-sm text-violet-400 hover:text-violet-300 hover:underline"
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
                    className="px-8 py-3 text-sm font-semibold text-white border-2 border-white/20 rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎤</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Voice Recognition</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Teknologi speech-to-text yang akurat untuk bahasa Indonesia
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI Extraction</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI Gemini mendeteksi item, harga, kategori secara otomatis
              </p>
            </div>

            <div className="group p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all">
              <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Instant Save</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Transaksi tersimpan otomatis. Tidak perlu input manual lagi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

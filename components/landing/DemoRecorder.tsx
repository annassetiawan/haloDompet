"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { isSpeechRecognitionSupported } from '@/lib/utils'

interface TransactionData {
  item: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  location: string | null
  payment_method: string | null
  wallet_name: string | null
}

interface DemoRecorderProps {
  onResult?: (data: TransactionData) => void
}

export function DemoRecorder({ onResult }: DemoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState<TransactionData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [recognition, setRecognition] = useState<any>(null)

  const startRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      setError('Browser Anda tidak mendukung Web Speech API. Coba gunakan Chrome atau Edge.')
      return
    }

    setError(null)
    setResult(null)
    setTranscript('')

    // @ts-ignore - Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()

    recognitionInstance.lang = 'id-ID'
    recognitionInstance.continuous = false
    recognitionInstance.interimResults = false

    recognitionInstance.onstart = () => {
      setIsRecording(true)
    }

    recognitionInstance.onresult = async (event: any) => {
      const text = event.results[0][0].transcript
      setTranscript(text)
      setIsRecording(false)
      setIsProcessing(true)

      // Send to demo API
      try {
        const response = await fetch('/api/demo/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Gagal memproses transaksi')
        }

        setResult(data.data)
        onResult?.(data.data)
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan')
      } finally {
        setIsProcessing(false)
      }
    }

    recognitionInstance.onerror = (event: any) => {
      setIsRecording(false)
      setIsProcessing(false)
      setError('Gagal merekam audio. Coba lagi.')
    }

    recognitionInstance.onend = () => {
      setIsRecording(false)
    }

    setRecognition(recognitionInstance)
    recognitionInstance.start()
  }

  const stopRecording = () => {
    if (recognition) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="w-full">
      {/* Recording Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          size="lg"
          className={`
            relative w-20 h-20 rounded-full transition-all duration-200 border-4
            ${isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse border-red-700'
              : isProcessing
              ? 'bg-zinc-800 border-zinc-700'
              : 'bg-emerald-400 hover:bg-emerald-300 border-emerald-600'
            }
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          ) : (
            <Mic className={`w-8 h-8 ${isRecording ? 'text-white' : 'text-black'}`} />
          )}

          {/* Pulse Ring when recording */}
          {isRecording && (
            <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75" />
          )}
        </Button>
      </div>

      {/* Status Text */}
      <div className="text-center mb-4">
        {isRecording && (
          <p className="text-sm text-zinc-500 animate-pulse font-bold">
            Mendengarkan... Ucapkan transaksi Anda
          </p>
        )}
        {isProcessing && (
          <p className="text-sm text-zinc-500 font-bold">
            Memproses dengan AI...
          </p>
        )}
        {!isRecording && !isProcessing && !result && !error && (
          <p className="text-sm text-zinc-600 font-bold">
            Tekan tombol untuk mencoba demo
          </p>
        )}
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-4 p-3 border-2 border-zinc-800 bg-zinc-950">
          <p className="text-xs text-zinc-600 mb-1 font-bold">Yang Anda ucapkan:</p>
          <p className="text-sm text-white font-medium">&quot;{transcript}&quot;</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 border-2 border-red-900 bg-red-950/50 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-400 mb-1">Terjadi Kesalahan</p>
            <p className="text-xs text-red-300 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Result - Digital Receipt */}
      {result && (
        <div className="p-6 border-2 border-emerald-400 bg-zinc-950 shadow-[4px_4px_0_0_rgba(16,185,129,0.5)]">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <p className="text-sm font-black text-emerald-400">Struk Digital</p>
          </div>

          <div className="space-y-3">
            {/* Item */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-zinc-600 font-bold">Item</span>
              <span className="text-sm font-black text-white text-right">{result.item}</span>
            </div>

            {/* Amount */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-zinc-600 font-bold">Jumlah</span>
              <span className={`text-lg font-black ${result.type === 'income' ? 'text-emerald-400' : 'text-orange-400'}`}>
                {result.type === 'income' ? '+' : '-'} {formatCurrency(result.amount)}
              </span>
            </div>

            {/* Type & Category */}
            <div className="flex justify-between items-start">
              <span className="text-sm text-zinc-600 font-bold">Kategori</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 border-2 font-black ${
                  result.type === 'income'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-orange-950 text-orange-400 border-orange-800'
                }`}>
                  {result.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <span className="text-sm font-black text-white">{result.category}</span>
              </div>
            </div>

            {/* Location */}
            {result.location && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-zinc-600 font-bold">Lokasi</span>
                <span className="text-sm font-black text-white text-right">{result.location}</span>
              </div>
            )}

            {/* Payment Method */}
            {result.payment_method && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-zinc-600 font-bold">Metode Bayar</span>
                <span className="text-sm font-black text-white text-right">{result.payment_method}</span>
              </div>
            )}

            {/* Wallet */}
            {result.wallet_name && (
              <div className="flex justify-between items-start">
                <span className="text-sm text-zinc-600 font-bold">Dompet</span>
                <span className="text-sm font-black text-white text-right">{result.wallet_name}</span>
              </div>
            )}

            {/* Date */}
            <div className="flex justify-between items-start pt-3 border-t-2 border-zinc-800">
              <span className="text-sm text-zinc-600 font-bold">Tanggal</span>
              <span className="text-sm text-zinc-500 font-bold">
                {new Date(result.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Demo Notice */}
          <div className="mt-4 pt-4 border-t-2 border-zinc-800">
            <p className="text-xs text-yellow-400 text-center font-bold">
              <span className="inline-block w-2 h-2 bg-yellow-400 mr-2" />
              Ini adalah demo. Data tidak disimpan ke database.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

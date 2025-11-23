"use client"

import { useDemoRecorder } from '@/hooks/useDemoRecorder'
import { Mic, Square, Check, X, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export function LiveDemoSection() {
  const { state, error, result, audioLevel, startRecording, stopRecording, isRecording } = useDemoRecorder()

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <section id="live-demo" className="py-28 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header - asymmetric */}
        <div className="mb-16 max-w-xl">
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-4">
            Coba langsung
          </h2>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Rekam suara kamu dan lihat bagaimana AI mengubahnya jadi catatan keuangan otomatis.
          </p>
        </div>

        {/* Asymmetric grid 40/60 */}
        <div className="grid md:grid-cols-5 gap-12 items-center">
          {/* Left: Instructions - 40% */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Klik tombol rekam</h3>
                  <p className="text-sm text-zinc-400">Izinkan akses mikrofon di browser</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Ngomong natural</h3>
                  <p className="text-sm text-zinc-400">
                    "Beli kopi 25rb pakai GoPay"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Klik lagi untuk stop</h3>
                  <p className="text-sm text-zinc-400">AI langsung proses jadi data terstruktur</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Right: Phone mockup - 60% */}
          <div className="md:col-span-3 flex justify-center">
            <div className="relative">
              {/* Phone glow effect */}
              <div className="absolute inset-0 bg-[#8B5CF6]/20 blur-3xl scale-110" />

              {/* Phone frame */}
              <div className="relative aspect-[9/19.5] w-full max-w-[340px] bg-zinc-900 rounded-[3rem] border-8 border-zinc-800 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-zinc-900 rounded-b-3xl z-10" />

                {/* Screen content */}
                <div className="h-full bg-[#0A0A0A] flex flex-col items-center justify-center p-8 relative">
                  {/* Recording visualization */}
                  {isRecording && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#8B5CF6] rounded-full animate-pulse"
                          style={{
                            height: `${20 + audioLevel * 40 + Math.random() * 20}px`,
                            animationDelay: `${i * 0.1}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Record button */}
                  <button
                    onClick={handleButtonClick}
                    disabled={state === 'processing'}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ease-out ${
                      state === 'recording'
                        ? 'bg-red-500 hover:bg-red-600 scale-110'
                        : state === 'processing'
                        ? 'bg-zinc-700 cursor-not-allowed'
                        : state === 'success'
                        ? 'bg-green-500'
                        : state === 'error'
                        ? 'bg-red-500'
                        : 'bg-[#8B5CF6] hover:bg-[#7C3AED] hover:scale-105'
                    }`}
                  >
                    {state === 'processing' ? (
                      <Loader2 className="w-10 h-10 text-white animate-spin" />
                    ) : state === 'recording' ? (
                      <Square className="w-10 h-10 text-white fill-white" />
                    ) : state === 'success' ? (
                      <Check className="w-10 h-10 text-white" />
                    ) : state === 'error' ? (
                      <X className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>

                  {/* Status text */}
                  <p className="mt-6 text-sm text-zinc-400 text-center">
                    {state === 'idle' && 'Tap untuk mulai'}
                    {state === 'recording' && 'Sedang merekam...'}
                    {state === 'processing' && 'Memproses...'}
                    {state === 'success' && 'Berhasil!'}
                    {state === 'error' && 'Gagal'}
                  </p>

                  {/* Result display */}
                  {result && state === 'success' && (
                    <div className="mt-8 w-full bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-white">
                          {result.type === 'expense' ? '-' : '+'}{formatCurrency(result.amount)}
                        </div>
                        <div className="text-sm text-zinc-500 mt-1">
                          {result.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Item</span>
                          <span className="text-white font-medium">{result.item}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Kategori</span>
                          <span className="text-white">{result.category}</span>
                        </div>
                        {result.payment_method && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Metode</span>
                            <span className="text-white">{result.payment_method}</span>
                          </div>
                        )}
                        {result.wallet_name && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Wallet</span>
                            <span className="text-white">{result.wallet_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

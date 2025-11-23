'use client'

import { useDemoRecorder } from '@/hooks/useDemoRecorder'
import { Mic, Square, Check, X, Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ArrowRight, CheckCircle2, Receipt, Wallet } from 'lucide-react'

export function LiveDemoSection() {
  const {
    state,
    error,
    result,
    audioLevel,
    recordingTime,
    startRecording,
    stopRecording,
    resetDemo,
    isRecording,
  } = useDemoRecorder()

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  return (
    <section id="demo" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none opacity-30" />

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Text Side */}
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-300">
              Live Interactive Demo
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-semibold text-white mb-6 leading-tight">
            Ngomong doang,
            <br />
            <span className="text-zinc-500">langsung kecatet.</span>
          </h2>
          <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
            Gak perlu buka excel, gak perlu ngetik manual. Cukup rekam suara
            kamu kayak lagi kirim VN ke temen. AI HaloDompet bakal ekstrak item,
            harga, kategori, dan dompet yang dipakai.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
                <CheckCircle2 size={14} />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <strong className="text-white block mb-1">
                  Smart Extraction
                </strong>
                Mendeteksi otomatis "Makan siang 25 ribu pakai Gopay".
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Wallet size={14} />
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                <strong className="text-white block mb-1">
                  Multi-Wallet Support
                </strong>
                Otomatis memotong saldo sesuai dompet yang disebutkan.
              </p>
            </div>
          </div>
        </div>

        {/* Phone Mockup Side */}
        <div className="order-1 lg:order-2 flex justify-center relative">
          {/* Phone Frame */}
          <div className="relative w-[320px] h-[640px] bg-[#000] rounded-[3rem] border-[6px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10 z-10">
            {/* Notch & Status Bar */}
            <div className="absolute top-0 inset-x-0 h-8 bg-black z-20 flex justify-center">
              <div className="w-32 h-6 bg-black rounded-b-2xl border-b border-x border-zinc-800/50 absolute top-0"></div>
            </div>
            <div className="px-6 pt-14 pb-6 flex justify-between items-center text-white">
              <span className="text-xs font-medium text-zinc-500">9:41</span>
              <div className="flex gap-1">
                <div className="w-4 h-2.5 border border-zinc-600 rounded-[1px]"></div>
              </div>
            </div>

            {/* App Screen Content */}
            <div className="flex flex-col h-full px-5 relative">
              {/* Header App */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    Total Pengeluaran
                  </p>
                  <h3 className="text-2xl font-bold text-white">
                    Rp 2.450.000
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800"></div>
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 flex flex-col justify-center items-center relative">
                {state === 'idle' && (
                  <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div
                      className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/10 transition-all"
                      onClick={startRecording}
                    >
                      <Mic
                        className="text-white group-hover:text-violet-400 transition-colors"
                        size={32}
                      />
                    </div>
                    <p className="text-sm text-zinc-400">
                      Tap untuk mulai mencatat
                    </p>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl text-xs text-zinc-500 max-w-[200px] mx-auto">
                      "Beli martabak manis 35 ribu pakai OVO"
                    </div>
                  </div>
                )}

                {state === 'recording' && (
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-red-500/20 animate-ping absolute top-0 left-0"></div>
                      <div
                        className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center relative z-10 cursor-pointer hover:scale-95 transition-transform"
                        onClick={stopRecording}
                      >
                        <Square className="text-white fill-current" size={32} />
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-mono text-xl mb-1">
                        00:0{recordingTime}
                      </p>
                      <p className="text-xs text-red-400 animate-pulse">
                        Merekam suara...
                      </p>
                    </div>
                  </div>
                )}

                {state === 'processing' && (
                  <div className="text-center space-y-4">
                    <Loader2
                      className="animate-spin text-violet-500 mx-auto"
                      size={48}
                    />
                    <p className="text-sm text-zinc-400">
                      AI sedang menganalisa...
                    </p>
                  </div>
                )}

                {state === 'success' && result && (
                  <div className="w-full animate-in zoom-in duration-300">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>

                      <div className="flex items-start justify-between mb-4">
                        <div className="bg-zinc-800 p-2 rounded-lg text-zinc-300">
                          <Receipt size={20} />
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                          {result.date}
                        </span>
                      </div>

                      <h4 className="text-white font-medium text-lg mb-1 capitalize">
                        {result.item}
                      </h4>
                      <p className="text-2xl font-bold text-white mb-4">
                        {formatCurrency(result.amount)}
                      </p>

                      <div className="space-y-2 border-t border-zinc-800/50 pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Kategori</span>
                          <span className="text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 capitalize">
                            {result.category}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">Wallet</span>
                          <span className="text-violet-300 capitalize">
                            {result.wallet}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={resetDemo}
                        className="mt-5 w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                      >
                        Simpan Transaksi <ArrowRight size={14} />
                      </button>
                    </div>
                    <p
                      className="text-center mt-4 text-xs text-zinc-500 cursor-pointer hover:text-white transition-colors"
                      onClick={resetDemo}
                    >
                      Batalkan & Coba Lagi
                    </p>
                  </div>
                )}
                {state === 'error' && (
                  <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                      <X className="text-red-400" size={32} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-red-400 text-sm px-4 font-medium">
                        {error || 'Gagal memproses. Coba lagi ya.'}
                      </p>
                      {error?.includes('sibuk') && (
                        <p className="text-xs text-zinc-500 px-4">
                          API demo mencapai batas penggunaan. Tunggu beberapa saat atau coba lagi nanti.
                        </p>
                      )}
                    </div>
                    <button
                      onClick={resetDemo}
                      className="text-xs text-zinc-400 hover:text-white transition-colors underline"
                    >
                      Tutup
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Nav Mock */}
              <div className="h-20 mb-6 border-t border-zinc-800 flex items-center justify-around text-zinc-600">
                <div className="flex flex-col items-center gap-1 text-violet-500">
                  <div className="w-6 h-6 rounded bg-current opacity-20"></div>
                </div>
                <div className="w-6 h-6 rounded bg-zinc-800"></div>
                <div className="w-6 h-6 rounded bg-zinc-800"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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
            <div className="flex flex-col h-full px-5 pb-6 relative">
              {/* Header - Greeting */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">HaloDompet</h1>
                  <p className="text-sm text-zinc-400">Hai, annas 👋</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
                  </svg>
                </button>
              </div>

              {/* Dompet Saya Card */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white text-base font-semibold flex items-center gap-2">
                    Dompet Saya
                    <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </h2>
                  <button className="text-xs text-white flex items-center gap-1">
                    <span>+ Tambah</span>
                  </button>
                </div>

                <div className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 p-4 shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Wallet size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-white/80">Total Aset</p>
                        <p className="text-[10px] text-white/60">2 dompet aktif</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/90 bg-white/10 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>100%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-3xl font-bold text-white">Rp</span>
                    <div className="flex gap-0.5 mt-2">
                      {[1,2,3,4,5,6].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-white"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Content Area */}
              <div className="flex-1 flex flex-col justify-center items-center relative">
                {state === 'idle' && (
                  <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Status Bubble */}
                    <div className="relative mb-4">
                      <div className="bg-zinc-800/80 backdrop-blur-sm rounded-2xl px-4 py-2 text-xs text-zinc-400 inline-block">
                        <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">STATUS</div>
                        <div className="italic">"Tidak ada suara terdeteksi"</div>
                      </div>
                      {/* Speech bubble arrow */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-zinc-800/80"></div>
                    </div>

                    {/* Big Mic Button */}
                    <div
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mx-auto cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-2xl ring-4 ring-zinc-800/50"
                      onClick={startRecording}
                    >
                      <Mic className="text-zinc-400" size={48} />
                    </div>

                    <p className="text-sm text-zinc-400">
                      Tekan untuk merekam
                    </p>

                    {/* Input Manual Button */}
                    <button className="flex items-center gap-2 text-sm text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl px-4 py-3 hover:border-zinc-700 hover:text-zinc-400 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Input Manual</span>
                    </button>

                    {/* Helper Text */}
                    <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 max-w-[240px] mx-auto">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 animate-pulse"></div>
                        <p className="text-xs text-green-400/80 text-left leading-relaxed">
                          Tekan tombol dan ucapkan pemasukan atau pengeluaran Anda
                        </p>
                      </div>
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
              <div className="absolute bottom-0 left-0 right-0 h-16 border-t border-zinc-800/50 flex items-center justify-around px-6 bg-black/50 backdrop-blur-sm">
                {/* Home */}
                <div className="flex flex-col items-center gap-1 text-violet-500">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  </svg>
                  <span className="text-[10px] font-medium">Home</span>
                </div>

                {/* Riwayat */}
                <div className="flex flex-col items-center gap-1 text-zinc-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                  <span className="text-[10px]">Riwayat</span>
                </div>

                {/* Laporan */}
                <div className="flex flex-col items-center gap-1 text-zinc-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                  <span className="text-[10px]">Laporan</span>
                </div>

                {/* Advisor */}
                <div className="flex flex-col items-center gap-1 text-zinc-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  <span className="text-[10px]">Advisor</span>
                </div>

                {/* Setting */}
                <div className="flex flex-col items-center gap-1 text-zinc-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-[10px]">Setting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

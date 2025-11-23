"use client"

import { Mic, Cpu, Archive } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Semudah Mengirim Voice Note
          </h2>
          <p className="text-lg text-zinc-500 font-medium">
            Tiga langkah sederhana untuk mengatur keuanganmu.
          </p>
        </div>

        {/* Bento Grid - 3 Columns */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1 - Rekam */}
          <div className="group relative p-8 border-2 border-zinc-800 bg-zinc-950 hover:border-emerald-400 transition-all duration-200">
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 border-2 border-emerald-400 bg-emerald-400/10">
                <Mic className="w-7 h-7 text-emerald-400" />
              </div>

              {/* Step Number */}
              <div className="text-xs font-black text-emerald-400 mb-3 tracking-wider">STEP 01</div>

              {/* Title */}
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                Rekam Suara
              </h3>

              {/* Description */}
              <p className="text-zinc-500 leading-relaxed mb-4 font-medium">
                Tekan tombol dan ucapkan pengeluaranmu. Contoh: <span className="text-white font-bold">&quot;Beli makan siang 35 ribu pakai OVO&quot;</span>
              </p>

              {/* Visual Illustration */}
              <div className="mt-6 h-16 border-2 border-zinc-800 bg-black flex items-center justify-center overflow-hidden">
                {/* Waveform Animation */}
                <div className="flex items-center gap-1">
                  {[22, 38, 15, 32, 28, 18, 35, 25, 30, 20, 26, 33].map((height, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-400 animate-pulse"
                      style={{
                        height: `${height}px`,
                        animationDelay: `${i * 0.1}s`,
                        opacity: 0.4 + (i % 3) * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - AI Proses */}
          <div className="group relative p-8 border-2 border-zinc-800 bg-zinc-950 hover:border-blue-400 transition-all duration-200">
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 border-2 border-blue-400 bg-blue-400/10">
                <Cpu className="w-7 h-7 text-blue-400" />
              </div>

              {/* Step Number */}
              <div className="text-xs font-black text-blue-400 mb-3 tracking-wider">STEP 02</div>

              {/* Title */}
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                AI Mengekstrak
              </h3>

              {/* Description */}
              <p className="text-zinc-500 leading-relaxed mb-4 font-medium">
                AI mengekstrak item, harga, kategori, dan dompet otomatis dalam <span className="text-white font-bold">hitungan detik</span>.
              </p>

              {/* Visual Illustration */}
              <div className="mt-6 h-16 border-2 border-zinc-800 bg-black flex items-center justify-center overflow-hidden">
                {/* Processing Animation */}
                <div className="relative">
                  <Cpu className="w-10 h-10 text-blue-400/30" />
                  <div className="absolute inset-0 animate-ping">
                    <Cpu className="w-10 h-10 text-blue-400/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Tersimpan */}
          <div className="group relative p-8 border-2 border-zinc-800 bg-zinc-950 hover:border-orange-400 transition-all duration-200">
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 border-2 border-orange-400 bg-orange-400/10">
                <Archive className="w-7 h-7 text-orange-400" />
              </div>

              {/* Step Number */}
              <div className="text-xs font-black text-orange-400 mb-3 tracking-wider">STEP 03</div>

              {/* Title */}
              <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                Langsung Tersimpan
              </h3>

              {/* Description */}
              <p className="text-zinc-500 leading-relaxed mb-4 font-medium">
                Transaksi langsung masuk ke dashboard dan laporan keuanganmu. <span className="text-white font-bold">Beres!</span>
              </p>

              {/* Visual Illustration */}
              <div className="mt-6 h-16 border-2 border-zinc-800 bg-black flex items-center justify-center overflow-hidden p-3">
                {/* Mini Chart */}
                <div className="flex items-end gap-1.5 w-full justify-center">
                  {[40, 60, 45, 75, 50, 85].map((height, i) => (
                    <div
                      key={i}
                      className="w-full bg-orange-400 opacity-60 transition-all duration-1000 animate-pulse"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${i * 0.15}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

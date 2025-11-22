"use client"

import { Mic, Cpu, Archive } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 bg-zinc-950">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Semudah Mengirim Voice Note
          </h2>
          <p className="text-lg text-zinc-400">
            Tiga langkah sederhana untuk mengatur keuanganmu.
          </p>
        </div>

        {/* Bento Grid - 3 Columns */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1 - Rekam */}
          <div className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-purple-900/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              {/* Icon with Glow */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-950/50 border border-purple-900/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                <Mic className="w-7 h-7 text-purple-400" />
              </div>

              {/* Step Number */}
              <div className="text-xs font-bold text-purple-500 mb-3 tracking-wider">STEP 01</div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Rekam Suara
              </h3>

              {/* Description */}
              <p className="text-zinc-400 leading-relaxed mb-4">
                Tekan tombol dan ucapkan pengeluaranmu. Contoh: <span className="text-white font-medium">&quot;Beli makan siang 35 ribu pakai OVO&quot;</span>
              </p>

              {/* Visual Illustration */}
              <div className="mt-6 h-16 rounded-lg bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center overflow-hidden">
                {/* Waveform Animation */}
                <div className="flex items-center gap-1">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-purple-500 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 30 + 10}px`,
                        animationDelay: `${i * 0.1}s`,
                        opacity: 0.4 + Math.random() * 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 - AI Proses */}
          <div className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-purple-900/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              {/* Icon with Glow */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-950/50 border border-purple-900/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                <Cpu className="w-7 h-7 text-purple-400" />
              </div>

              {/* Step Number */}
              <div className="text-xs font-bold text-purple-500 mb-3 tracking-wider">STEP 02</div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                AI Mengekstrak
              </h3>

              {/* Description */}
              <p className="text-zinc-400 leading-relaxed mb-4">
                AI mengekstrak item, harga, kategori, dan dompet otomatis dalam <span className="text-white font-medium">hitungan detik</span>.
              </p>

              {/* Visual Illustration */}
              <div className="mt-6 h-16 rounded-lg bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center overflow-hidden">
                {/* Processing Animation */}
                <div className="relative">
                  <Cpu className="w-10 h-10 text-purple-500/30" />
                  <div className="absolute inset-0 animate-ping">
                    <Cpu className="w-10 h-10 text-purple-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 - Tersimpan */}
          <div className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-purple-900/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
            {/* Glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              {/* Icon with Glow */}
              <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-950/50 border border-purple-900/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                <Archive className="w-7 h-7 text-purple-400" />
              </div>

              {/* Step Number */}
              <div className="text-xs font-bold text-purple-500 mb-3 tracking-wider">STEP 03</div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
                Langsung Tersimpan
              </h3>

              {/* Description */}
              <p className="text-zinc-400 leading-relaxed mb-4">
                Transaksi langsung masuk ke dashboard dan laporan keuanganmu. <span className="text-white font-medium">Beres!</span>
              </p>

              {/* Visual Illustration */}
              <div className="mt-6 h-16 rounded-lg bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center overflow-hidden p-3">
                {/* Mini Chart */}
                <div className="flex items-end gap-1.5 w-full justify-center">
                  {[40, 60, 45, 75, 50, 85].map((height, i) => (
                    <div
                      key={i}
                      className="w-full rounded-t bg-gradient-to-t from-purple-500 to-purple-400 opacity-60"
                      style={{ height: `${height}%` }}
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

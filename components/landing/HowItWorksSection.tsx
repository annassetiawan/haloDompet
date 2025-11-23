"use client"

import { motion } from 'framer-motion'
import { Mic, Cpu, CheckCircle2 } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - Linear Style */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-tight"
            >
              Semudah Mengirim Voice Note.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto"
            >
              Tiga langkah sederhana untuk mengatur keuanganmu.
            </motion.p>
          </div>

          {/* Steps Grid - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Rekam Suara */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-500"
            >
              {/* Subtle Glow on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(400px circle at 50% 50%, rgba(168, 85, 247, 0.08), transparent 40%)',
                  }}
                />
              </div>

              <div className="relative z-10">
                {/* Step Number */}
                <div className="mb-6 text-5xl font-medium text-zinc-800">01</div>

                {/* Icon */}
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-purple-400" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">
                  Rekam Suara
                </h3>

                {/* Description */}
                <p className="text-base text-zinc-400 leading-relaxed mb-6">
                  Tekan tombol dan ucapkan pengeluaranmu. Contoh: "Beli makan siang 35 ribu pakai OVO".
                </p>

                {/* Visual - Waveform */}
                <div className="flex items-center justify-center gap-1 h-16">
                  {[3, 6, 4, 8, 5, 10, 6, 9, 4, 7].map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-purple-500/60 to-purple-400/60 rounded-full"
                      style={{ height: `${height * 4}px` }}
                      animate={{
                        height: [`${height * 4}px`, `${height * 5}px`, `${height * 4}px`],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Step 2: AI Memproses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-500"
            >
              {/* Subtle Glow on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(400px circle at 50% 50%, rgba(168, 85, 247, 0.08), transparent 40%)',
                  }}
                />
              </div>

              <div className="relative z-10">
                {/* Step Number */}
                <div className="mb-6 text-5xl font-medium text-zinc-800">02</div>

                {/* Icon */}
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">
                  AI Memproses
                </h3>

                {/* Description */}
                <p className="text-base text-zinc-400 leading-relaxed mb-6">
                  AI kami mengekstrak item, harga, kategori, dan dompet secara otomatis dalam hitungan detik.
                </p>

                {/* Visual - Processing Animation */}
                <div className="relative h-16 flex items-center justify-center">
                  <motion.div
                    className="w-12 h-12 rounded-xl border-2 border-cyan-500/40 border-t-cyan-400"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  <motion.div
                    className="absolute w-6 h-6 rounded-lg bg-cyan-500/30"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Step 3: Tersimpan Rapi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-500"
            >
              {/* Subtle Glow on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(400px circle at 50% 50%, rgba(168, 85, 247, 0.08), transparent 40%)',
                  }}
                />
              </div>

              <div className="relative z-10">
                {/* Step Number */}
                <div className="mb-6 text-5xl font-medium text-zinc-800">03</div>

                {/* Icon */}
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.2
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </motion.div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">
                  Tersimpan Rapi
                </h3>

                {/* Description */}
                <p className="text-base text-zinc-400 leading-relaxed mb-6">
                  Transaksi langsung masuk ke dashboard dan laporan keuanganmu. Beres!
                </p>

                {/* Visual - Success Chart */}
                <div className="relative h-16 flex items-end justify-center gap-1">
                  {[40, 55, 45, 65, 50, 70, 60].map((height, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-gradient-to-t from-green-500/60 to-green-400/60 rounded-sm"
                      initial={{ height: 0, opacity: 0 }}
                      whileInView={{ height: `${height}%`, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: [0.43, 0.13, 0.23, 0.96]
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

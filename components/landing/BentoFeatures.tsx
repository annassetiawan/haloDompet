"use client"

import { motion } from 'framer-motion'
import { Mic, Wallet, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function BentoFeatures() {
  return (
    <section id="features" className="relative py-24 md:py-32">
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
              Built for simplicity
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-lg text-zinc-400 max-w-2xl mx-auto"
            >
              Semua yang kamu butuhkan untuk mengelola keuangan. Tanpa ribet.
            </motion.p>
          </div>

          {/* Bento Grid - Linear Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Card 1: AI Voice Recording - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8 md:p-12 overflow-hidden hover:border-purple-500/30 transition-all duration-500"
            >
              {/* Subtle Glow on Hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.08), transparent 40%)',
                  }}
                />
              </div>

              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                {/* Left - Content */}
                <div>
                  <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
                    <Mic className="w-6 h-6 text-purple-400" />
                  </div>

                  <h3 className="text-3xl md:text-4xl font-medium text-white mb-4 tracking-tight">
                    Catat dengan suara
                  </h3>

                  <p className="text-lg text-zinc-400 mb-6 leading-relaxed">
                    Bilang aja: "Beli kopi 25 ribu". AI kami langsung menangkap item, harga, dan kategori.
                    Secepat itu.
                  </p>

                  <Link
                    href="#demo"
                    className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors group/link"
                  >
                    Coba sekarang
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Right - Visual Demo */}
                <div className="relative">
                  <div className="relative p-6 rounded-xl border border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
                    {/* Waveform Visualization */}
                    <div className="flex items-center justify-center gap-1 h-32">
                      {[3, 8, 4, 9, 5, 12, 6, 11, 7, 10, 4, 8, 5, 9, 6].map((height, i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-purple-500/80 to-purple-400/80 rounded-full"
                          style={{ height: `${height * 4}px` }}
                          animate={{
                            height: [`${height * 4}px`, `${height * 5}px`, `${height * 4}px`],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>

                    {/* Text Display */}
                    <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                      <p className="text-sm text-zinc-400 mb-1">Terdeteksi:</p>
                      <p className="text-white font-medium">"Beli kopi 25 ribu di Fore"</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Multi-Wallet - Half Width */}
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
                    background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.08), transparent 40%)',
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-cyan-400" />
                </div>

                <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">
                  Multi-Wallet
                </h3>

                <p className="text-base text-zinc-400 leading-relaxed mb-6">
                  Pisahkan uang pribadi, bisnis, atau tabungan. Semua tercatat rapi di satu tempat.
                </p>

                {/* Visual - Wallet Cards */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/30">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500/30 to-purple-600/20" />
                    <div className="flex-1">
                      <div className="text-xs text-white font-medium">Personal</div>
                      <div className="text-[10px] text-zinc-500">Rp 2.5M</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/50 border border-zinc-800/30">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500/30 to-cyan-600/20" />
                    <div className="flex-1">
                      <div className="text-xs text-white font-medium">Business</div>
                      <div className="text-[10px] text-zinc-500">Rp 8.1M</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Insightful Reports - Half Width */}
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
                    background: 'radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.08), transparent 40%)',
                  }}
                />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 mb-6 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>

                <h3 className="text-2xl font-medium text-white mb-3 tracking-tight">
                  Insights & Reports
                </h3>

                <p className="text-base text-zinc-400 leading-relaxed mb-6">
                  Lihat pola pengeluaran, tren bulanan, dan kategori terbesar dalam sekejap.
                </p>

                {/* Visual - Mini Chart */}
                <div className="relative h-24 flex items-end gap-1">
                  {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-pink-500/60 to-pink-400/40 rounded-sm"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">+12.5%</span>
                  <span>vs last month</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}

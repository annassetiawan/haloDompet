"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-40">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">

          {/* Left Column - Text Content */}
          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
              <span className="text-sm text-gray-300 font-medium">Beta • Gratis Selamanya</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] text-white"
            >
              Catat Keuangan
              <br />
              Cuma Modal{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 animate-gradient">
                  Ngomong
                </span>
                {/* Underline decoration */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="12"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 10C50 5 150 5 198 10"
                    stroke="url(#paint0_linear)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#8B5CF6" />
                      <stop offset="0.5" stopColor="#EC4899" />
                      <stop offset="1" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-xl"
            >
              Lupakan spreadsheet membosankan. Biarkan AI yang mencatat, mengkategorikan, dan menganalisis pengeluaranmu.{' '}
              <span className="text-white font-semibold">Secepat mengirim voice note.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/80"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Sekarang (Gratis)
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <a
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-2xl hover:bg-white/5 hover:border-white/30 transition-all"
              >
                Coba Demo
              </a>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-sm text-gray-400"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Tanpa install aplikasi</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Setup 30 detik</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="relative lg:block hidden">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Floating Animation Container */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                {/* Glow Behind Phone */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/40 via-pink-600/40 to-violet-600/40 blur-3xl -z-10 scale-150" />

                {/* Phone Mockup */}
                <div className="relative w-[300px] h-[600px] mx-auto">
                  {/* Phone Frame */}
                  <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-gray-800 to-gray-900 p-3 shadow-2xl">
                    {/* Screen */}
                    <div className="w-full h-full rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-pink-500/20 overflow-hidden border border-white/10 backdrop-blur-sm">
                      {/* Status Bar */}
                      <div className="h-8 bg-black/20 flex items-center justify-between px-6 text-xs text-white/60">
                        <span>9:41</span>
                        <div className="flex gap-1">
                          <div className="w-4 h-4 border border-white/40 rounded-sm" />
                          <div className="w-4 h-4 border border-white/40 rounded-sm" />
                          <div className="w-4 h-4 border border-white/40 rounded-sm" />
                        </div>
                      </div>

                      {/* App Preview Content */}
                      <div className="p-6 space-y-4">
                        <div className="text-center text-white font-bold text-2xl mb-8">
                          haloDompet
                        </div>

                        {/* Balance Card */}
                        <div className="bg-gradient-to-br from-violet-600 to-pink-600 rounded-3xl p-6 shadow-xl">
                          <div className="text-white/80 text-sm mb-2">Total Saldo</div>
                          <div className="text-white text-3xl font-bold mb-4">Rp 5.420.000</div>
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                            </svg>
                            <span>+12.5% bulan ini</span>
                          </div>
                        </div>

                        {/* Transaction List Preview */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <span className="text-xl">🍕</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">Makan Siang</div>
                              <div className="text-white/60 text-xs">Hari ini</div>
                            </div>
                            <div className="text-red-400 font-bold">-50rb</div>
                          </div>

                          <div className="flex items-center gap-3 bg-white/5 rounded-2xl p-4 border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-xl">⛽</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">Bensin</div>
                              <div className="text-white/60 text-xs">Kemarin</div>
                            </div>
                            <div className="text-red-400 font-bold">-100rb</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full" />
                  </div>

                  {/* Floating Particles */}
                  <motion.div
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-10 -left-10 w-20 h-20 bg-violet-500/30 rounded-full blur-2xl"
                  />
                  <motion.div
                    animate={{
                      y: [0, 30, 0],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                    className="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-500/30 rounded-full blur-2xl"
                  />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* User Types - Below Hero */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-24 pt-12 border-t border-white/5"
        >
          <p className="text-center text-gray-400 text-sm mb-6">
            Dipercaya oleh berbagai kalangan
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-xl">🚀</span>
              <span>Startup Founders</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-xl">💼</span>
              <span>Freelancers</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-xl">🎓</span>
              <span>Mahasiswa</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span className="text-xl">👨‍👩‍👧‍👦</span>
              <span>Keluarga Muda</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

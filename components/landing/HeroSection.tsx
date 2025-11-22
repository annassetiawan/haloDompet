"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-24 md:pt-32 md:pb-32">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">

          {/* Left Column - Text Content (Linear Typography) */}
          <div className="relative z-10">
            {/* Subtle Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
              </span>
              <span className="text-xs text-zinc-400">Beta • Free Forever</span>
            </motion.div>

            {/* Headline - Linear Style */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-medium text-white mb-6 tracking-tight leading-[1.1]"
            >
              Catat keuangan
              <br />
              cuma modal{' '}
              <span
                className="relative inline-block text-white"
                style={{
                  textShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)',
                }}
              >
                ngomong
              </span>
            </motion.h1>

            {/* Subheadline - Linear Clarity */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-xl"
            >
              Lupakan spreadsheet. Biarkan AI yang mencatat, mengkategorikan, dan menganalisis.
              Secepat mengirim voice note.
            </motion.p>

            {/* CTA Buttons - Linear Style */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-b from-purple-600/90 to-purple-700/90 border border-purple-500/20 rounded-lg hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all"
              >
                Start for free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-zinc-400 border border-zinc-800 rounded-lg hover:text-white hover:border-zinc-700 transition-all"
              >
                See features
              </a>
            </motion.div>

            {/* Subtle Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mt-8 flex items-center gap-4 text-xs text-zinc-500"
            >
              <span>No installation</span>
              <span>•</span>
              <span>30s setup</span>
            </motion.div>
          </div>

          {/* Right Column - Phone Mockup (Linear Lifted Style) */}
          <div className="relative lg:block hidden">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              {/* Mockup Container - Linear Precision */}
              <div className="relative mx-auto w-[300px]">
                {/* Subtle Lift Shadow */}
                <div className="absolute inset-0 bg-purple-900/20 blur-3xl scale-110 opacity-60" />

                {/* Phone Frame */}
                <div className="relative rounded-[2.5rem] border-[0.5px] border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 p-2 shadow-2xl backdrop-blur-sm">
                  {/* Screen */}
                  <div className="w-full h-[600px] rounded-[2.2rem] bg-gradient-to-b from-zinc-900 to-zinc-950 overflow-hidden border-[0.5px] border-zinc-800/50">
                    {/* Status Bar */}
                    <div className="h-7 bg-zinc-900/50 flex items-center justify-between px-6 text-[10px] text-zinc-500">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-3 h-3 border border-zinc-600 rounded-sm" />
                        <div className="w-3 h-3 border border-zinc-600 rounded-sm" />
                        <div className="w-3 h-3 border border-zinc-600 rounded-sm" />
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="p-5 space-y-4">
                      <div className="text-center text-white text-lg font-medium mb-6">
                        haloDompet
                      </div>

                      {/* Balance Card - Linear Style */}
                      <div className="bg-gradient-to-br from-purple-600/90 to-purple-700/90 border border-purple-500/20 rounded-2xl p-5 shadow-lg">
                        <div className="text-white/70 text-xs mb-1.5">Total Balance</div>
                        <div className="text-white text-2xl font-semibold mb-3">Rp 5,420,000</div>
                        <div className="flex items-center gap-1.5 text-white/80 text-xs">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                          </svg>
                          <span>+12.5% this month</span>
                        </div>
                      </div>

                      {/* Transaction List - Linear Cards */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                            <span className="text-base">🍕</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-medium">Lunch</div>
                            <div className="text-zinc-500 text-[10px]">Today</div>
                          </div>
                          <div className="text-red-400 text-xs font-medium">-50k</div>
                        </div>

                        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-3">
                          <div className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                            <span className="text-base">⛽</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-medium">Fuel</div>
                            <div className="text-zinc-500 text-[10px]">Yesterday</div>
                          </div>
                          <div className="text-red-400 text-xs font-medium">-100k</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notch */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-950 rounded-full border-[0.5px] border-zinc-900" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

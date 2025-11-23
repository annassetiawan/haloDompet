'use client'

import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'

export function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="pt-32 pb-16 md:pt-48 md:pb-24 max-w-5xl mx-auto px-6 relative">
      {/* Abstract Orb */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
          Catat pengeluaran <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
            cuma pakai suara.
          </span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
          Capek ngetik manual tiap abis jajan? HaloDompet pake AI buat dengerin
          cerita lo dan nyatet semuanya otomatis. Akurat, cepet, gak ribet.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <button className="h-12 px-8 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group">
            Coba Sekarang
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button
            className="h-12 px-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
            onClick={() =>
              document
                .getElementById('demo')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            <PlayCircle size={18} />
            Lihat Demo
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4 text-xs text-zinc-500 font-medium">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-zinc-800 border border-black flex items-center justify-center text-[10px] text-zinc-400"
              >
                U{i}
              </div>
            ))}
          </div>
          <p>Disukai 2,000+ pengguna early access</p>
        </div>
      </div>
    </section>
  )
}

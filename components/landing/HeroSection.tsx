"use client"

import Link from 'next/link'

export function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-screen flex items-center px-6 overflow-hidden">
      {/* Background orb */}
      <div
        className="absolute top-1/4 -left-32 w-96 h-96 bg-[#8B5CF6] rounded-full blur-3xl opacity-10"
        style={{
          transform: 'rotate(-15deg) scale(1.2)',
        }}
      />

      <div className="max-w-6xl mx-auto w-full pt-20">
        {/* Asymmetric layout - content offset to left */}
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tight mb-6">
            Catat pengeluaran<br />cuma pakai suara
          </h1>

          <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed mb-10 max-w-2xl">
            Ngomong → langsung masuk. AI yang urus sisanya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-lg transition-all duration-300 ease-out text-center"
            >
              Coba Sekarang
            </Link>

            <button
              onClick={scrollToDemo}
              className="px-8 py-4 bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/40 hover:border-zinc-700/60 text-white font-medium rounded-lg transition-all duration-300 ease-out flex items-center justify-center gap-2"
            >
              Lihat Demo
              <span className="text-lg">↓</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

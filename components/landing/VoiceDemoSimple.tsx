'use client'

export function VoiceDemoSimple() {
  return (
    <section id="demo" className="py-20 md:py-32 px-6 bg-zinc-900/50 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none opacity-30" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-violet-400 text-sm font-mono uppercase tracking-widest mb-4">
            Cara Kerja
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Bicara. Selesai.
          </h2>
          <p className="text-lg text-zinc-400">
            Lihat bagaimana HaloDompet mengubah suaramu menjadi catatan keuangan yang rapi.
          </p>
        </div>

        {/* Demo Mockup */}
        <div className="bg-black/50 border border-zinc-800/50 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto">
          {/* Voice Button */}
          <div className="flex justify-center mb-8">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 flex items-center justify-center cursor-pointer group hover:scale-105 transition-transform">
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 animate-ping opacity-20" />

              {/* Mic Icon */}
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-white relative z-10"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
            <p className="text-zinc-400 font-mono text-sm md:text-base text-center">
              &ldquo;<span className="text-violet-400">Beli Americano</span> di{' '}
              <span className="text-violet-400">Starbucks</span>{' '}
              <span className="text-violet-400">45 ribu</span> pakai{' '}
              <span className="text-violet-400">GoPay</span>&rdquo;
            </p>
          </div>

          {/* Result Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                Item
              </span>
              <strong className="text-white text-sm md:text-base">Americano</strong>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                Kategori
              </span>
              <strong className="text-pink-400 text-sm md:text-base">
                Makanan & Minuman
              </strong>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                Harga
              </span>
              <strong className="text-green-400 text-sm md:text-base">Rp45.000</strong>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">
                Dompet
              </span>
              <strong className="text-white text-sm md:text-base">GoPay</strong>
            </div>
          </div>
        </div>

        {/* CTA to try live demo */}
        <div className="text-center mt-12">
          <button
            onClick={() =>
              document
                .getElementById('live-demo')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-2 mx-auto group"
          >
            Coba Demo Interaktif
            <svg
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}

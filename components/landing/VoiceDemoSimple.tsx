'use client'

import { Mic } from 'lucide-react'

export function VoiceDemoSimple() {
  return (
    <section id="demo" className="py-20 md:py-32 px-6 bg-zinc-900/30 relative overflow-hidden">
      {/* Dual Background Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-fintech-purple/15 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-gradient-radial from-fintech-teal/15 via-transparent to-transparent blur-3xl" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="font-jetbrains text-fintech-cyan text-xs font-bold uppercase tracking-[0.2em] mb-4">
            /// CARA KERJA
          </p>
          <h2 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            <span className="text-white">Bicara.</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fintech-teal to-fintech-cyan">
              Selesai.
            </span>
          </h2>
          <p className="font-manrope text-lg text-zinc-400">
            Lihat bagaimana HaloDompet mengubah suaramu menjadi catatan keuangan yang rapi.
          </p>
        </div>

        {/* Glassmorphic Demo Mockup */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto shadow-2xl shadow-fintech-purple/10">
          {/* Voice Button with Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              {/* Outer glow rings */}
              <div className="absolute -inset-4 bg-gradient-to-r from-fintech-purple via-fintech-pink to-fintech-teal rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity animate-pulse-slow" />
              <div className="absolute -inset-2 bg-gradient-to-r from-fintech-teal via-fintech-cyan to-fintech-purple rounded-full opacity-30 animate-spin-slow" />

              {/* Voice button */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-fintech-purple via-fintech-pink to-fintech-teal flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-fintech-purple/50">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-fintech-teal/30 to-fintech-purple/30 blur-md" />
                <Mic className="w-12 h-12 md:w-16 md:h-16 text-white relative z-10 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Glassmorphic Transcript */}
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 hover:border-white/20 transition-all duration-500">
            <p className="font-jetbrains text-sm md:text-base text-center leading-relaxed">
              <span className="text-zinc-400">&ldquo;</span>
              <span className="text-fintech-cyan-light font-semibold">Beli Americano</span>
              <span className="text-zinc-400"> di </span>
              <span className="text-fintech-teal-light font-semibold">Starbucks</span>
              <span className="text-zinc-400"> </span>
              <span className="text-fintech-purple-light font-semibold">45 ribu</span>
              <span className="text-zinc-400"> pakai </span>
              <span className="text-fintech-pink-light font-semibold">GoPay</span>
              <span className="text-zinc-400">&rdquo;</span>
            </p>
          </div>

          {/* Result Grid with Glassmorphism */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Item', value: 'Americano', color: 'text-white' },
              { label: 'Kategori', value: 'Makanan & Minuman', color: 'text-fintech-pink' },
              { label: 'Harga', value: 'Rp45.000', color: 'text-fintech-teal' },
              { label: 'Dompet', value: 'GoPay', color: 'text-fintech-cyan' },
            ].map((item, index) => (
              <div
                key={index}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="font-jetbrains text-xs text-zinc-500 uppercase tracking-wider block mb-2 group-hover:text-zinc-400 transition-colors">
                  {item.label}
                </span>
                <strong className={`font-manrope ${item.color} text-sm md:text-base font-semibold`}>
                  {item.value}
                </strong>
              </div>
            ))}
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
            className="group inline-flex items-center gap-2 backdrop-blur-sm bg-white/5 border border-white/10 px-6 py-3 rounded-full font-manrope font-semibold text-sm text-fintech-cyan hover:bg-white/10 hover:border-fintech-teal/50 hover:text-fintech-teal transition-all duration-300"
          >
            <span>Coba Demo Interaktif</span>
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}

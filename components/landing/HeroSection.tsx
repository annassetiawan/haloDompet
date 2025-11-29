'use client'

import Link from 'next/link'
import { ArrowRight, PlayCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 relative">
      {/* Gradient Glow Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-gradient-radial from-violet-600/15 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full text-sm text-violet-400 mb-8 animate-fade-in-up">
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          <span>Powered by AI — Cerdas & Otomatis</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animation-delay-100">
          Catat Keuangan
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
            Semudah Ngobrol
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed mb-12 animate-fade-in-up animation-delay-200">
          Cukup bicara, HaloDompet otomatis deteksi item, harga, kategori,
          dan dompet yang dipakai. Tanpa ribet input manual lagi.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-16 animate-fade-in-up animation-delay-300">
          <Link
            href="/login"
            className="h-12 px-8 rounded-full bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 text-white font-semibold hover:shadow-2xl hover:shadow-violet-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
          >
            <PlayCircle size={20} className="group-hover:scale-110 transition-transform" />
            Coba Sekarang
          </Link>
          <button
            className="h-12 px-8 rounded-full bg-transparent border border-zinc-700 text-zinc-300 font-semibold hover:bg-zinc-800/50 hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
            onClick={() =>
              document
                .getElementById('demo')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Lihat Demo
          </button>
        </div>

        {/* Dompie Mascot */}
        <div className="mt-8 animate-fade-in-up animation-delay-400">
          <div className="relative w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center border-4 border-transparent bg-gradient-to-br from-violet-500 via-pink-500 to-orange-500 bg-origin-border animate-float">
            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center">
              {/* Dompie Eyes */}
              <div className="flex gap-3">
                <div className="w-7 h-7 bg-black/40 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-full dompie-pupil" />
                </div>
                <div className="w-7 h-7 bg-black/40 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-pink-500 rounded-full dompie-pupil" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        /* Eye tracking effect */
        .dompie-pupil {
          transition: transform 0.2s ease-out;
        }
      `}</style>
    </section>
  )
}

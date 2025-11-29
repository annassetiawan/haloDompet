'use client'

import Link from 'next/link'
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-32 pb-16 relative overflow-hidden">
      {/* Dual Gradient Glow Background - Purple & Teal */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-fintech-purple/20 via-transparent to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-gradient-radial from-fintech-teal/15 via-transparent to-transparent pointer-events-none blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center">
        {/* Glassmorphic Hero Badge */}
        <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-sm mb-8 animate-fade-in-up shadow-lg shadow-fintech-purple/10">
          <Sparkles size={16} className="text-fintech-cyan animate-pulse" />
          <span className="font-manrope font-medium bg-gradient-to-r from-fintech-purple-light via-fintech-cyan-light to-fintech-teal-light bg-clip-text text-transparent">
            Powered by AI — Cerdas & Otomatis
          </span>
        </div>

        {/* Hero Title - Outfit Font */}
        <h1 className="font-outfit text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-in-up animation-delay-100">
          <span className="block text-white">Catat Keuangan</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-fintech-purple via-fintech-pink to-fintech-teal">
            Semudah Ngobrol
          </span>
        </h1>

        {/* Hero Subtitle - Manrope Font */}
        <p className="font-manrope text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12 animate-fade-in-up animation-delay-200">
          Cukup bicara, HaloDompet otomatis deteksi{' '}
          <span className="text-fintech-cyan-light font-semibold">item</span>,{' '}
          <span className="text-fintech-teal-light font-semibold">harga</span>,{' '}
          <span className="text-fintech-purple-light font-semibold">kategori</span>, dan{' '}
          <span className="text-fintech-pink-light font-semibold">dompet</span> yang dipakai.
        </p>

        {/* CTA Buttons with Glassmorphism */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-16 animate-fade-in-up animation-delay-300">
          <Link
            href="/login"
            className="group relative h-14 px-8 rounded-full overflow-hidden font-outfit font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:scale-105"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-fintech-purple via-fintech-pink to-fintech-teal opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-r from-fintech-teal via-fintech-cyan to-fintech-purple opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

            <PlayCircle size={20} className="relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Coba Sekarang</span>
          </Link>

          <button
            className="h-14 px-8 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 text-white font-outfit font-semibold hover:bg-white/10 hover:border-fintech-teal/50 transition-all flex items-center justify-center gap-2 group"
            onClick={() =>
              document
                .getElementById('demo')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Lihat Demo
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Glassmorphic Dompie Mascot */}
        <div className="mt-8 animate-fade-in-up animation-delay-400">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-fintech-purple via-fintech-teal to-fintech-cyan rounded-full opacity-30 blur-2xl group-hover:opacity-50 transition-opacity animate-pulse-slow" />

            {/* Dompie container with glassmorphism */}
            <div className="relative w-36 h-36 backdrop-blur-xl bg-white/5 rounded-full flex items-center justify-center border-2 border-white/10 shadow-2xl shadow-fintech-purple/20 animate-float">
              {/* Inner glow */}
              <div className="absolute inset-2 bg-gradient-to-br from-fintech-purple/20 to-fintech-teal/20 rounded-full blur-md" />

              {/* Dompie Eyes */}
              <div className="relative flex gap-4">
                <div className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-fintech-cyan to-fintech-teal rounded-full dompie-pupil shadow-lg shadow-fintech-cyan/50" />
                </div>
                <div className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                  <div className="w-3.5 h-3.5 bg-gradient-to-br from-fintech-cyan to-fintech-teal rounded-full dompie-pupil shadow-lg shadow-fintech-cyan/50" />
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

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
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

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        /* Eye tracking effect */
        .dompie-pupil {
          transition: transform 0.2s ease-out;
        }
      `}</style>
    </section>
  )
}

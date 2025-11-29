'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0F172A] to-slate-950" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#14b8a620_1px,transparent_1px),linear-gradient(to_bottom,#14b8a620_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Teal Glow - Top Left */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse-glow" style={{animationDuration: '4s'}} />

      {/* Amber Glow - Bottom Right */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[100px] animate-pulse-glow" style={{animationDuration: '5s'}} />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 backdrop-blur-sm mb-8 animate-fade-in stagger-1">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-teal-300">
              Powered by AI • 100% Gratis
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] mb-6 tracking-tight animate-fade-in-up stagger-2">
            Catat keuangan
            <br />
            <span className="relative inline-block mt-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 animate-gradient">
                cuma pakai suara
              </span>
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C50 2 100 10 150 6C200 2 250 10 298 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="0">
                    <stop offset="0%" stopColor="#14B8A6" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 animate-fade-in-up stagger-3">
            Capek ngetik manual tiap abis jajan? HaloDompet pakai AI untuk mendengarkan cerita Anda dan mencatat semuanya otomatis.{' '}
            <span className="text-amber-400 font-semibold">Akurat, cepat, tanpa ribet.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up stagger-4">
            <Link
              href="/login"
              className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(20,184,166,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Mulai Gratis Sekarang</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <button
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-slate-200 font-medium text-lg hover:bg-slate-700/50 hover:border-teal-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span>Lihat Demo Interaktif</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-in stagger-5">
            <div className="px-6 py-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-teal-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                <p className="text-2xl md:text-3xl font-bold text-white">2,000+</p>
              </div>
              <p className="text-sm text-slate-400">Pengguna Aktif</p>
            </div>

            <div className="px-6 py-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300 group">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <p className="text-2xl md:text-3xl font-bold text-white">95%</p>
              </div>
              <p className="text-sm text-slate-400">Akurasi AI</p>
            </div>

            <div className="px-6 py-4 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 group col-span-2 md:col-span-1">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">⚡</span>
                <p className="text-2xl md:text-3xl font-bold text-white">&lt;3 detik</p>
              </div>
              <p className="text-sm text-slate-400">Waktu Proses</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

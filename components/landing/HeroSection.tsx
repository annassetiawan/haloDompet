"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-16">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-24">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-zinc-800 bg-zinc-950 mb-8">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-zinc-400 font-medium">AI-Powered Financial Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-6">
            Catat Keuangan,{' '}
            <span className="relative inline-block text-emerald-400">
              Cuma Modal Ngomong
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12 leading-relaxed font-medium">
            Lupakan catat manual yang ribet. Biarkan AI membereskan dompetmu dalam hitungan detik.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-bold bg-emerald-400 text-black hover:bg-emerald-300 transition-all duration-200 border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              >
                Mulai Sekarang (Gratis)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <a href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-bold border-2 border-zinc-700 text-white hover:bg-zinc-900 transition-all duration-200"
              >
                Pelajari Cara Kerjanya
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-6 mt-16 text-sm text-zinc-600 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400" />
              <span>100% Gratis</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400" />
              <span>Powered by Gemini AI</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400" />
              <span>Data Aman & Private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

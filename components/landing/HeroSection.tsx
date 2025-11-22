"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 pt-16">
      {/* Blurry Gradient Orbs - Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple Orb - Top Left */}
        <div
          className="absolute -top-20 -left-20 w-[500px] h-[400px] rounded-[100%] opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse at center, #7c3aed 0%, #581c87 50%, transparent 100%)',
          }}
        />

        {/* Pink Orb - Bottom Right */}
        <div
          className="absolute -bottom-10 -right-10 w-[450px] h-[350px] rounded-[100%] opacity-15 blur-[120px]"
          style={{
            background: 'radial-gradient(ellipse at center, #ec4899 0%, #9333ea 50%, transparent 100%)',
          }}
        />

        {/* Blue-Purple Orb - Center */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-[100%] opacity-10 blur-[100px]"
          style={{
            background: 'radial-gradient(ellipse at center, #6366f1 0%, #7c3aed 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 py-24">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Sparkle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm mb-8">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-zinc-400">AI-Powered Financial Assistant</span>
          </div>

          {/* Main Headline with Glow Effect */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Catat Keuangan,{' '}
            <span className="relative inline-block">
              <span
                className="relative z-10 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.3)',
                }}
              >
                Cuma Modal Ngomong
              </span>
              <div
                className="absolute inset-0 blur-2xl opacity-60"
                style={{
                  background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)',
                }}
              />
            </span>
            .
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
            Lupakan catat manual yang ribet. Biarkan AI membereskan dompetmu dalam hitungan detik.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-medium bg-white text-black hover:bg-zinc-100 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] border border-transparent hover:border-purple-500/50"
              >
                Mulai Sekarang (Gratis)
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <a href="#demo">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-medium border-zinc-700 text-white hover:bg-zinc-900 hover:border-zinc-600 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                Pelajari Cara Kerjanya
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-6 mt-16 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>100% Gratis</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Powered by Gemini AI</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Data Aman & Private</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

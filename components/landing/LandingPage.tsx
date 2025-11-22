"use client"

import { HeroSection } from './HeroSection'
import { DemoSection } from './DemoSection'
import Link from 'next/link'

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Glowing Orbs Background */}
      <div className="fixed inset-0 -z-10">
        {/* Large Purple Orb - Top Left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse" />

        {/* Pink/Magenta Orb - Bottom Right */}
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-pink-600/25 rounded-full blur-3xl" />

        {/* Cyan Orb - Middle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Violet Accent Orb - Top Right */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-violet-500/20 rounded-full blur-2xl" />

        {/* Grid Pattern Overlay (subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/50 group-hover:shadow-violet-500/70 transition-shadow">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl text-white">haloDompet</span>
          </Link>

          <nav className="flex items-center gap-4">
            <a
              href="#demo"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:inline-block"
            >
              Demo
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-xl hover:scale-105 transition-all shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70 overflow-hidden group"
            >
              <span className="relative z-10">Mulai Gratis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <DemoSection />

        {/* Final CTA Section */}
        <section className="relative py-32 md:py-40">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto text-center">
              <div className="relative">
                {/* Enhanced Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 via-pink-600/30 to-violet-600/30 blur-3xl -z-10 animate-pulse" />

                <div className="relative border border-white/10 rounded-3xl p-12 md:p-20 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl shadow-2xl">
                  {/* Decorative corners */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-violet-500/50 rounded-tl-3xl" />
                  <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-pink-500/50 rounded-tr-3xl" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-pink-500/50 rounded-bl-3xl" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-violet-500/50 rounded-br-3xl" />

                  <h2 className="text-5xl md:text-6xl font-black mb-6 text-white leading-tight">
                    Siap Atur Keuangan dengan Lebih{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 animate-gradient">
                      Smart?
                    </span>
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Daftar sekarang dan mulai catat transaksi cuma dengan ngomong. Gratis. Tanpa ribet.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/80"
                  >
                    Mulai Sekarang - Gratis! 🚀
                  </Link>

                  <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Tanpa kartu kredit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Gratis selamanya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5 bg-black/50 backdrop-blur-xl py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © 2025 <span className="text-white font-semibold">haloDompet</span>. Made with{' '}
              <span className="text-pink-500">❤️</span> for better financial management.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

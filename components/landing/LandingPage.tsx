"use client"

import { HeroSection } from './HeroSection'
import { BentoFeatures } from './BentoFeatures'
import { DemoSection } from './DemoSection'
import Link from 'next/link'

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#080808] overflow-hidden">
      {/* Subtle Abstract Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Top Abstract Glow - Purple/Blue */}
        <div
          className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] opacity-[0.15]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Bottom Right Abstract Glow - Pink/Purple */}
        <div
          className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] opacity-[0.12]"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      {/* Header - Linear Style */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900/50 bg-[#080808]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/90 to-pink-500/90 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">H</span>
            </div>
            <span className="font-medium text-white text-sm">haloDompet</span>
          </Link>

          <nav className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:inline-block"
            >
              Features
            </a>
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="relative px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-b from-purple-600/90 to-purple-700/90 border border-purple-500/20 rounded-lg hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all"
            >
              Start Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <BentoFeatures />
        <DemoSection />

        {/* Final CTA - Linear Minimal Style */}
        <section className="relative py-24 md:py-32">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-tight">
                Siap untuk financial clarity?
              </h2>
              <p className="text-lg text-zinc-400 mb-8 leading-relaxed">
                Daftar sekarang. Gratis selamanya.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-b from-purple-600/90 to-purple-700/90 border border-purple-500/20 rounded-lg hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)] transition-all"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
                <span>No credit card required</span>
                <span>•</span>
                <span>Free forever</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Minimal Linear Style */}
      <footer className="border-t border-zinc-900/50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-purple-500/70 to-pink-500/70 flex items-center justify-center">
                <span className="text-white font-semibold text-[10px]">H</span>
              </div>
              <span>© 2025 haloDompet</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Made with focus</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

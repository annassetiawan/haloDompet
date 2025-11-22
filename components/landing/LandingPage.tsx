"use client"

import { HeroSection } from './HeroSection'
import { DemoSection } from './DemoSection'
import Link from 'next/link'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="font-bold text-xl">haloDompet</span>
          </Link>

          <nav className="flex items-center gap-4">
            <a
              href="#demo"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
            >
              Demo
            </a>
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg hover:scale-105 transition-transform"
            >
              Mulai Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <HeroSection />
        <DemoSection />

        {/* Final CTA Section */}
        <section className="py-24 md:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="relative">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 blur-3xl -z-10" />

                <div className="border border-border rounded-3xl p-12 md:p-16 bg-card/50 backdrop-blur-sm">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Siap Atur Keuangan dengan Lebih Smart?
                  </h2>
                  <p className="text-xl text-muted-foreground mb-8">
                    Daftar sekarang dan mulai catat transaksi cuma dengan ngomong.
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg hover:scale-105 transition-transform shadow-lg shadow-violet-500/25"
                  >
                    Mulai Sekarang - Gratis! 🚀
                  </Link>

                  <p className="mt-6 text-sm text-muted-foreground">
                    Tidak perlu kartu kredit • Gratis selamanya
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 haloDompet. Made with ❤️ for better financial management.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-border bg-muted/30 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            <span className="text-sm text-muted-foreground">Beta - Gratis selamanya</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Catat Keuangan
            <br />
            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
              Cuma Modal Ngomong
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Lupakan catat manual. Biarkan AI yang membereskan dompetmu.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-violet-500 rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
            >
              <span className="relative z-10">Mulai Sekarang (Gratis)</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <a
              href="#demo"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 transition-all"
            >
              Coba Demo
            </a>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Dipercaya oleh pengguna dari berbagai kalangan
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
              <div className="text-xs font-medium">🚀 Startup Founders</div>
              <div className="text-xs font-medium">💼 Freelancers</div>
              <div className="text-xs font-medium">🎓 Mahasiswa</div>
              <div className="text-xs font-medium">👨‍👩‍👧‍👦 Keluarga Muda</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

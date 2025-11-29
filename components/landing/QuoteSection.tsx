'use client'

export function QuoteSection() {
  return (
    <section id="tentang" className="py-20 md:py-32 px-6 text-center">
      <div className="max-w-4xl mx-auto">
        {/* Quote Text */}
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-12">
          &ldquo;Capek input manual? Males buka spreadsheet?{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
            Sama, makanya gue bikin ini.
          </span>{' '}
          Sekarang cukup ngomong aja, beres.&rdquo;
        </p>

        {/* Dompie Says */}
        <div className="inline-flex items-center gap-4 bg-zinc-900/50 border border-zinc-800/50 px-4 py-3 rounded-full">
          {/* Mini Dompie Avatar */}
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-pink-500 rounded-sm" />
              <div className="w-2 h-2 bg-pink-500 rounded-sm" />
            </div>
          </div>

          {/* Attribution */}
          <span className="text-sm text-zinc-400">
            — Dompie, AI Financial Assistant yang Suka Nyindir
          </span>
        </div>
      </div>
    </section>
  )
}

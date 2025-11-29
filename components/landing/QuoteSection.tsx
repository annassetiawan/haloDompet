'use client'

export function QuoteSection() {
  return (
    <section id="tentang" className="py-20 md:py-32 px-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-fintech-purple/10 via-transparent to-transparent blur-3xl" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Quote Text */}
        <p className="font-outfit text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-12">
          <span className="text-white">&ldquo;Capek input manual? Males buka spreadsheet? </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fintech-purple via-fintech-teal to-fintech-cyan">
            Sama, makanya gue bikin ini.
          </span>
          <span className="text-white"> Sekarang cukup ngomong aja, beres.&rdquo;</span>
        </p>

        {/* Glassmorphic Dompie Says Card */}
        <div className="inline-flex items-center gap-4 backdrop-blur-xl bg-white/5 border border-white/10 px-6 py-4 rounded-full shadow-lg shadow-fintech-purple/10 hover:border-white/20 hover:shadow-fintech-teal/20 transition-all duration-500 group">
          {/* Mini Dompie Avatar with glassmorphism */}
          <div className="relative w-14 h-14 backdrop-blur-sm bg-gradient-to-br from-fintech-purple/20 to-fintech-teal/20 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
            {/* Inner glow */}
            <div className="absolute inset-1 bg-gradient-to-br from-fintech-cyan/20 to-fintech-pink/20 rounded-full blur-sm" />

            {/* Eyes */}
            <div className="relative flex gap-2">
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-fintech-cyan to-fintech-teal rounded-sm shadow-lg shadow-fintech-cyan/50" />
              <div className="w-2.5 h-2.5 bg-gradient-to-br from-fintech-cyan to-fintech-teal rounded-sm shadow-lg shadow-fintech-cyan/50" />
            </div>
          </div>

          {/* Attribution */}
          <span className="font-manrope text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
            — Dompie, AI Financial Assistant yang Suka Nyindir
          </span>
        </div>
      </div>
    </section>
  )
}

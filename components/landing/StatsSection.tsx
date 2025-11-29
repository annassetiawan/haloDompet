'use client'

export function StatsSection() {
  const stats = [
    {
      value: '<3s',
      label: 'Waktu input transaksi',
      gradient: 'from-fintech-purple to-fintech-pink',
    },
    {
      value: '95%',
      label: 'Akurasi deteksi AI',
      gradient: 'from-fintech-teal to-fintech-cyan',
    },
    {
      value: '10+',
      label: 'Kategori otomatis',
      gradient: 'from-fintech-cyan to-fintech-purple',
    },
    {
      value: '∞',
      label: 'Dompet yang bisa ditambah',
      gradient: 'from-fintech-pink to-fintech-teal',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-6 border-t border-b border-white/5 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-fintech-purple/5 to-transparent" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-radial from-fintech-teal/10 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-radial from-fintech-purple/10 via-transparent to-transparent blur-3xl" />

      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center relative z-10">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-3 group">
            {/* Glassmorphic stat container */}
            <div className="backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500 group-hover:-translate-y-2">
              <h4 className={`font-outfit text-5xl md:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-500`}>
                {stat.value}
              </h4>
              <p className="font-manrope text-sm md:text-base text-zinc-400 group-hover:text-zinc-300 transition-colors">
                {stat.label}
              </p>
            </div>

            {/* Glow effect on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500 -z-10`} />
          </div>
        ))}
      </div>
    </section>
  )
}

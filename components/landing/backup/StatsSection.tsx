'use client'

export function StatsSection() {
  const stats = [
    {
      value: '<3s',
      label: 'Waktu input transaksi',
    },
    {
      value: '95%',
      label: 'Akurasi deteksi AI',
    },
    {
      value: '10+',
      label: 'Kategori otomatis',
    },
    {
      value: '∞',
      label: 'Dompet yang bisa ditambah',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-6 border-t border-b border-zinc-800/50">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
              {stat.value}
            </h4>
            <p className="text-sm md:text-base text-zinc-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

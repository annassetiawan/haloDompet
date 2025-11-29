'use client'

export function FeatureCards() {
  const features = [
    {
      icon: '🎙️',
      title: 'Voice Input AI',
      description: 'Cukup bilang "Beli kopi di Fore 25 ribu pakai GoPay" dan biarkan AI yang catat semuanya secara otomatis.',
    },
    {
      icon: '👛',
      title: 'Multi-Wallet',
      description: 'Kelola berbagai dompet sekaligus — Cash, GoPay, OVO, rekening bank, semua dalam satu tempat.',
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Lihat kemana uangmu pergi dengan grafik yang cantik dan mudah dipahami. Income vs Expense dalam sekejap.',
    },
    {
      icon: '🤖',
      title: 'Dompie Advisor',
      description: 'Asisten keuangan AI yang kasih saran (kadang nyindir) soal kebiasaan belanjamu. Siap-siap di-roast!',
    },
    {
      icon: '🏷️',
      title: 'Auto Categorization',
      description: 'AI otomatis kategorikan pengeluaranmu — makanan, transport, hiburan, dan lainnya. Zero effort.',
    },
    {
      icon: '💰',
      title: 'Budget Planning',
      description: 'Set budget bulanan dan dapatkan notifikasi sebelum overspending. Stay on track, always.',
    },
  ]

  return (
    <section id="fitur" className="py-20 md:py-32 px-6 relative">
      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-violet-400 text-sm font-mono uppercase tracking-widest mb-4">
          Fitur Unggulan
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          Semua yang Kamu Butuhkan untuk Kelola Keuangan
        </h2>
        <p className="text-lg text-zinc-400">
          Fitur lengkap yang bikin tracking keuangan jadi menyenangkan, bukan beban.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 hover:border-violet-500/30 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
          >
            {/* Top gradient line on hover */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-violet-500 via-pink-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Feature Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500/15 to-pink-500/15 rounded-2xl flex items-center justify-center text-3xl mb-6">
              {feature.icon}
            </div>

            {/* Feature Title */}
            <h3 className="text-xl font-bold mb-3 tracking-tight">
              {feature.title}
            </h3>

            {/* Feature Description */}
            <p className="text-zinc-400 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

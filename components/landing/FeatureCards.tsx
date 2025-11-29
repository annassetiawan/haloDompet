'use client'

export function FeatureCards() {
  const features = [
    {
      icon: '🎙️',
      title: 'Voice Input AI',
      description: 'Cukup bilang "Beli kopi di Fore 25 ribu pakai GoPay" dan biarkan AI yang catat semuanya secara otomatis.',
      gradient: 'from-fintech-purple/20 to-fintech-pink/20',
      borderGradient: 'from-fintech-purple to-fintech-pink',
    },
    {
      icon: '👛',
      title: 'Multi-Wallet',
      description: 'Kelola berbagai dompet sekaligus — Cash, GoPay, OVO, rekening bank, semua dalam satu tempat.',
      gradient: 'from-fintech-teal/20 to-fintech-cyan/20',
      borderGradient: 'from-fintech-teal to-fintech-cyan',
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Lihat kemana uangmu pergi dengan grafik yang cantik dan mudah dipahami. Income vs Expense dalam sekejap.',
      gradient: 'from-fintech-cyan/20 to-fintech-purple/20',
      borderGradient: 'from-fintech-cyan to-fintech-purple',
    },
    {
      icon: '🤖',
      title: 'Dompie Advisor',
      description: 'Asisten keuangan AI yang kasih saran (kadang nyindir) soal kebiasaan belanjamu. Siap-siap di-roast!',
      gradient: 'from-fintech-pink/20 to-fintech-teal/20',
      borderGradient: 'from-fintech-pink to-fintech-teal',
    },
    {
      icon: '🏷️',
      title: 'Auto Categorization',
      description: 'AI otomatis kategorikan pengeluaranmu — makanan, transport, hiburan, dan lainnya. Zero effort.',
      gradient: 'from-fintech-purple/20 to-fintech-cyan/20',
      borderGradient: 'from-fintech-purple to-fintech-cyan',
    },
    {
      icon: '💰',
      title: 'Budget Planning',
      description: 'Set budget bulanan dan dapatkan notifikasi sebelum overspending. Stay on track, always.',
      gradient: 'from-fintech-teal/20 to-fintech-pink/20',
      borderGradient: 'from-fintech-teal to-fintech-pink',
    },
  ]

  return (
    <section id="fitur" className="py-20 md:py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-fintech-teal/10 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* Section Header */}
      <div className="max-w-3xl mx-auto text-center mb-16 relative z-10">
        <p className="font-jetbrains text-fintech-cyan text-xs font-bold uppercase tracking-[0.2em] mb-4">
          /// FITUR UNGGULAN
        </p>
        <h2 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
          <span className="text-white">Semua yang Kamu Butuhkan</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fintech-purple via-fintech-teal to-fintech-cyan">
            untuk Kelola Keuangan
          </span>
        </h2>
        <p className="font-manrope text-lg text-zinc-400">
          Fitur lengkap yang bikin tracking keuangan jadi menyenangkan, bukan beban.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group relative"
          >
            {/* Glassmorphic card */}
            <div className={`h-full backdrop-blur-xl bg-gradient-to-br ${feature.gradient} rounded-3xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden`}>
              {/* Top gradient border on hover */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${feature.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Glow effect on hover */}
              <div className={`absolute -inset-px bg-gradient-to-br ${feature.borderGradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`} />

              {/* Feature Icon with glassmorphism */}
              <div className="w-16 h-16 backdrop-blur-sm bg-white/5 rounded-2xl flex items-center justify-center text-4xl mb-6 border border-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                {feature.icon}
              </div>

              {/* Feature Title */}
              <h3 className="font-outfit text-xl font-bold mb-3 tracking-tight text-white">
                {feature.title}
              </h3>

              {/* Feature Description */}
              <p className="font-manrope text-zinc-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

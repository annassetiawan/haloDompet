'use client'
import { Mic, Cpu, PieChart, ArrowRight } from 'lucide-react'

export function ProcessSteps() {
  const steps = [
    {
      icon: <Mic size={28} />,
      title: 'Rekam Suara',
      desc: 'Cukup tekan tombol dan ucapkan pengeluaranmu secara natural. Tidak perlu format kaku.',
      gradient: 'from-teal-500 to-cyan-500',
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-400',
      borderColor: 'border-teal-500/30'
    },
    {
      icon: <Cpu size={28} />,
      title: 'AI Processing',
      desc: 'Gemini AI menganalisa konteks kalimat untuk memisahkan nama barang, harga, dan kategori.',
      gradient: 'from-emerald-500 to-green-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30'
    },
    {
      icon: <PieChart size={28} />,
      title: 'Visualisasi Data',
      desc: 'Transaksi tersimpan rapi. Pantau cashflow harianmu lewat grafik yang mudah dipahami.',
      gradient: 'from-amber-500 to-orange-500',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/30'
    },
  ]

  return (
    <section
      id="features"
      className="py-24 md:py-32 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/50" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <div className="inline-block px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
            <span className="text-sm font-semibold text-teal-300">Cara Kerja</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Workflow super{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              simpel
            </span>
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Kami menghilangkan friksi dalam mencatat keuangan. Dari suara
            menjadi data insight dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Arrows (Desktop) */}
          <div className="hidden md:flex absolute top-20 left-0 right-0 justify-center items-center gap-4 -z-0">
            <div className="flex-1" />
            <ArrowRight className="w-8 h-8 text-teal-500/30" />
            <div className="flex-1" />
            <ArrowRight className="w-8 h-8 text-emerald-500/30" />
            <div className="flex-1" />
          </div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 group">
              {/* Card */}
              <div className={`relative p-8 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 hover:border-${step.borderColor} hover:bg-slate-800/50 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(20,184,166,0.15)]`}>
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center">
                  <span className="text-lg font-bold text-teal-400">{idx + 1}</span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 mx-auto ${step.iconBg} rounded-2xl flex items-center justify-center ${step.iconColor} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  {step.icon}
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

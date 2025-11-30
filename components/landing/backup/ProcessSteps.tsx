'use client'
import { Mic, Cpu, PieChart } from 'lucide-react'

export function ProcessSteps() {
  const steps = [
    {
      icon: <Mic size={24} />,
      title: 'Rekam Suara',
      desc: 'Cukup tekan tombol dan ucapkan pengeluaranmu secara natural. Tidak perlu format kaku.',
    },
    {
      icon: <Cpu size={24} />,
      title: 'AI Processing',
      desc: 'Gemini AI menganalisa konteks kalimat untuk memisahkan nama barang, harga, dan kategori.',
    },
    {
      icon: <PieChart size={24} />,
      title: 'Visualisasi Data',
      desc: 'Transaksi tersimpan rapi. Pantau cashflow harianmu lewat grafik yang mudah dipahami.',
    },
  ]

  return (
    <section
      id="features"
      className="py-24 border-y border-white/5 bg-[#0A0A0A]"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
            Workflow super simpel.
          </h2>
          <p className="text-zinc-400">
            Kami menghilangkan friksi dalam mencatat keuangan. Dari suara
            menjadi data insight dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 -z-0"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 group">
              <div className="w-16 h-16 mx-auto bg-[#0A0A0A] border border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:border-violet-500/50 group-hover:text-violet-400 transition-all duration-500 shadow-lg mb-6">
                {step.icon}
              </div>
              <div className="text-center px-4">
                <h3 className="text-lg font-medium text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'
import { Mic, Cpu, PieChart } from 'lucide-react'

export function ProcessedSteps() {
  const steps = [
    {
      icon: <Mic size={32} strokeWidth={1.5} />,
      title: 'Rekam Suara',
      desc: 'Cukup tekan tombol dan ucapkan pengeluaranmu secara natural. Tidak perlu format kaku.',
    },
    {
      icon: <Cpu size={32} strokeWidth={1.5} />,
      title: 'AI Processing',
      desc: 'Gemini AI menganalisa konteks kalimat untuk memisahkan nama barang, harga, dan kategori.',
    },
    {
      icon: <PieChart size={32} strokeWidth={1.5} />,
      title: 'Visualisasi Data',
      desc: 'Transaksi tersimpan rapi. Pantau cashflow harianmu lewat grafik yang mudah dipahami.',
    },
  ]

  return (
    <section
      id="workflow"
      className="py-24 border-y border-white/5 bg-[#050505] relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-gradient-radial from-violet-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            Workflow super simpel
          </h2>
          <p className="text-white/60 text-lg">
            Kami menghilangkan friksi dalam mencatat keuangan. Dari suara
            menjadi data insight dalam hitungan detik.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="group relative p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-violet-500/20 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 flex flex-col h-full items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 leading-relaxed">
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

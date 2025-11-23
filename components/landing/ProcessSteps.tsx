"use client"

export function ProcessSteps() {
  const steps = [
    {
      title: 'Ngomong aja',
      description: 'Beli kopi 25rb pakai GoPay',
      example: 'Natural, gak perlu format khusus',
    },
    {
      title: 'AI proses',
      description: 'Ekstrak item, jumlah, kategori, metode bayar',
      example: 'Semua otomatis dalam hitungan detik',
    },
    {
      title: 'Langsung masuk',
      description: 'Data tersimpan rapi di dompet digital kamu',
      example: 'Siap dilacak kapan aja',
    },
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            Gampang banget makenya
          </h2>
          <p className="text-lg text-zinc-400">
            Tiga langkah. Itu aja.
          </p>
        </div>

        {/* Horizontal timeline */}
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-zinc-900/30 border border-zinc-800/40 hover:border-[#8B5CF6]/60 rounded-2xl p-8 transition-all duration-300 ease-out"
            >
              {/* Step number */}
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] font-semibold mb-6">
                {index + 1}
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>

              <p className="text-zinc-400 mb-4 leading-relaxed">
                {step.description}
              </p>

              <p className="text-sm text-zinc-500 italic">
                {step.example}
              </p>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-[#8B5CF6]/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

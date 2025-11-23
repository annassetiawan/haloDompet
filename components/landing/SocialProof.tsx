"use client"

export function SocialProof() {
  const testimonials = [
    {
      name: 'Andi',
      initial: 'A',
      role: 'Freelancer',
      text: 'Gue suka banget fitur rekam suara. Biasanya males nyatet pengeluaran, sekarang tinggal ngomong doang.',
      color: 'bg-blue-500',
    },
    {
      name: 'Sinta',
      initial: 'S',
      role: 'Mahasiswa',
      text: 'AI-nya akurat banget! Langsung ngerti kalau gue bilang "beli kopi 25rb" itu kategori makanan.',
      color: 'bg-purple-500',
    },
    {
      name: 'Riko',
      initial: 'R',
      role: 'Desainer',
      text: 'Praktis buat tracking pengeluaran harian. Gak perlu buka notes lagi.',
      color: 'bg-green-500',
    },
    {
      name: 'Maya',
      initial: 'M',
      role: 'Marketing',
      text: 'Simpel, cepet, dan tampilannya bersih. Exactly what I needed.',
      color: 'bg-pink-500',
    },
    {
      name: 'Budi',
      initial: 'B',
      role: 'Developer',
      text: 'Lebih efisien dari app sejenis. Voice recognition-nya responsif banget.',
      color: 'bg-orange-500',
    },
  ]

  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            Yang lain bilang
          </h2>
          <p className="text-lg text-zinc-400">
            Real feedback dari pengguna awal
          </p>
        </div>

        {/* Masonry grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="space-y-6">
            {testimonials.slice(0, 2).map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-6 md:mt-8">
            {testimonials.slice(2, 4).map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>

          {/* Column 3 */}
          <div className="space-y-6 md:mt-4">
            {testimonials.slice(4).map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold`}>
          {testimonial.initial}
        </div>
        <div>
          <div className="text-white font-medium">{testimonial.name}</div>
          <div className="text-sm text-zinc-500">{testimonial.role}</div>
        </div>
      </div>
      <p className="text-zinc-400 leading-relaxed">
        {testimonial.text}
      </p>
    </div>
  )
}

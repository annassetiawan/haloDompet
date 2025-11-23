"use client"

import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "Dulu gue males banget catat pengeluaran karena ribet. Sekarang tinggal ngomong aja, langsung tercatat. Game changer!",
    name: "Budi Santoso",
    role: "Software Engineer",
    avatar: "BS",
    color: "emerald"
  },
  {
    quote: "AI-nya cerdas banget! Bisa ngerti kalo gue bilang 'isi bensin 50 ribu di Shell'. Otomatis masuk kategori transportasi.",
    name: "Sarah Wijaya",
    role: "Content Creator",
    avatar: "SW",
    color: "blue"
  },
  {
    quote: "Sebagai freelancer, tracking pemasukan & pengeluaran jadi super mudah. Cukup voice note, sisanya AI yang atur.",
    name: "Andi Pratama",
    role: "Freelance Designer",
    avatar: "AP",
    color: "orange"
  }
]

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-zinc-950">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Dicintai oleh Anak Muda Produktif
          </h2>
          <p className="text-lg text-zinc-500 font-medium">
            Ribuan pengguna sudah merasakan kemudahan catat keuangan dengan AI.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-8 border-2 border-zinc-800 bg-black hover:border-zinc-700 transition-all duration-200"
            >
              <div className="relative z-10">
                {/* Quote Icon */}
                <Quote className={`w-8 h-8 text-${testimonial.color}-400/50 mb-4`} />

                {/* Quote Text */}
                <p className="text-zinc-400 font-medium leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t-2 border-zinc-800">
                  {/* Avatar */}
                  <div className={`w-12 h-12 border-2 border-${testimonial.color}-400 bg-${testimonial.color}-400/10 flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-${testimonial.color}-400 font-black text-sm`}>
                      {testimonial.avatar}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <div className="font-black text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-zinc-600 font-bold">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "Dulu gue males banget catat pengeluaran karena ribet. Sekarang tinggal ngomong aja, langsung tercatat. Game changer!",
    name: "Budi Santoso",
    role: "Software Engineer",
    avatar: "BS"
  },
  {
    quote: "AI-nya cerdas banget! Bisa ngerti kalo gue bilang 'isi bensin 50 ribu di Shell'. Otomatis masuk kategori transportasi.",
    name: "Sarah Wijaya",
    role: "Content Creator",
    avatar: "SW"
  },
  {
    quote: "Sebagai freelancer, tracking pemasukan & pengeluaran jadi super mudah. Cukup voice note, sisanya AI yang atur.",
    name: "Andi Pratama",
    role: "Freelance Designer",
    avatar: "AP"
  }
]

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-[#080808]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Dicintai oleh Anak Muda Produktif
          </h2>
          <p className="text-lg text-zinc-400">
            Ribuan pengguna sudah merasakan kemudahan catat keuangan dengan AI.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
            >
              {/* Subtle Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-purple-500/30 mb-4" />

                {/* Quote Text */}
                <p className="text-zinc-300 italic leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <div>
                    <div className="font-bold text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-zinc-500">
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

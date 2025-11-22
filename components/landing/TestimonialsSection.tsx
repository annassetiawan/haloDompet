"use client"

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    quote: "Gila, ngebantu banget! Dulu males nyatet karena ribet ngetik, sekarang tinggal ngomong sambil jalan juga beres.",
    name: "Andi S.",
    role: "Mahasiswa",
    initials: "AS",
    color: "from-purple-500/30 to-purple-600/20"
  },
  {
    quote: "Sebagai freelancer, tracking income & expense jadi super mudah. AI-nya akurat banget ngerti konteks ucapan Indonesia.",
    name: "Bella R.",
    role: "Freelance Designer",
    initials: "BR",
    color: "from-cyan-500/30 to-cyan-600/20"
  },
  {
    quote: "Multi-wallet feature is a game changer. Bisa pisahin dompet bisnis sama pribadi tanpa ribet. Love it!",
    name: "Reza M.",
    role: "Entrepreneur",
    initials: "RM",
    color: "from-pink-500/30 to-pink-600/20"
  },
  {
    quote: "Laporan bulanannya detail banget, jadi tau kemana aja duit ngalir. Bikin sadar pengeluaran gak penting berkurang drastis.",
    name: "Dinda P.",
    role: "Content Creator",
    initials: "DP",
    color: "from-green-500/30 to-green-600/20"
  }
]

export function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - Linear Style */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-tight"
            >
              Dicintai oleh Anak Muda Produktif.
            </motion.h2>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm p-8 overflow-hidden hover:border-purple-500/30 transition-all duration-500"
              >
                {/* Subtle Glow on Hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(400px circle at 50% 50%, rgba(168, 85, 247, 0.08), transparent 40%)',
                    }}
                  />
                </div>

                <div className="relative z-10">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-purple-500/30 mb-4" />

                  {/* Testimonial Text */}
                  <p className="text-lg text-zinc-300 italic leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} border border-white/10 flex items-center justify-center`}>
                      <span className="text-xs font-semibold text-white">
                        {testimonial.initials}
                      </span>
                    </div>

                    {/* Name & Role */}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

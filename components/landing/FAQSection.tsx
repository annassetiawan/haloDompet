"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: "Apakah data keuangan saya aman?",
    answer: "Tentu. Kami menggunakan enkripsi standar industri dan tidak pernah membagikan data pribadimu ke pihak ketiga. Login juga aman menggunakan Google."
  },
  {
    question: "Apakah aplikasi ini gratis?",
    answer: "HaloDompet memiliki versi Gratis selamanya dengan fitur dasar. Kami juga menawarkan versi Pro untuk fitur AI lanjutan dan kuota lebih."
  },
  {
    question: "Bisakah saya menggunakan banyak dompet?",
    answer: "Bisa banget! Versi Pro mendukung unlimited dompet (Bank, E-Wallet, Tunai, dll) agar pencatatanmu lebih akurat."
  },
  {
    question: "Seberapa akurat AI-nya dalam mengenali suara?",
    answer: "Sangat akurat! Kami menggunakan model AI terbaru dari Google yang dioptimalkan untuk bahasa Indonesia sehari-hari, termasuk bahasa gaul."
  }
]

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-zinc-800/50 last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left group hover:text-white transition-colors"
      >
        <span className="text-base md:text-lg font-medium text-white pr-8">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0"
        >
          <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-5 pr-12">
              <p className="text-base text-zinc-400 leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function FAQSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Section Header - Linear Style */}
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-5xl font-medium text-white mb-4 tracking-tight"
            >
              Pertanyaan Umum.
            </motion.h2>
          </div>

          {/* FAQ Accordion */}
          <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
            <div className="divide-y divide-zinc-800/50">
              {faqs.map((faq, index) => (
                <div key={index} className="px-6 md:px-8">
                  <FAQItem
                    question={faq.question}
                    answer={faq.answer}
                    index={index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

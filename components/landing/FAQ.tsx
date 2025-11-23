"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'Aman gak sih data gue?',
      answer: 'Data kamu tersimpan aman dengan enkripsi. Rekaman suara langsung diproses jadi text dan gak disimpan permanen. Kita cuma simpan data transaksi kamu.',
    },
    {
      question: 'Harus bayar?',
      answer: 'Gratis untuk fitur dasar! Kamu bisa rekam transaksi unlimited, tracking pengeluaran, dan lihat laporan bulanan. Premium features coming soon.',
    },
    {
      question: 'AI-nya paham bahasa Indo?',
      answer: 'Iya dong! AI kita dilatih khusus buat bahasa Indonesia casual. Ngomong natural aja kayak ngobrol biasa, AI bakal ngerti.',
    },
    {
      question: 'Bisa dipakai offline?',
      answer: 'Untuk voice recognition perlu internet. Tapi kamu tetap bisa input manual dan lihat data yang udah tersimpan tanpa koneksi.',
    },
    {
      question: 'Support platform apa aja?',
      answer: 'Web app bisa diakses dari browser mana aja - Chrome, Safari, Firefox. Fitur voice recording optimal di Chrome & Safari terbaru.',
    },
  ]

  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            Pertanyaan umum
          </h2>
          <p className="text-lg text-zinc-400">
            Yang sering ditanyain
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-zinc-900/30 border border-zinc-800/40 rounded-2xl overflow-hidden transition-all duration-300 ease-out"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-900/50 transition-colors"
              >
                <span className="text-lg font-medium text-white pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6">
                  <p className="text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

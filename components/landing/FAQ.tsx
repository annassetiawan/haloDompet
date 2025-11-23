'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'Apakah data keuangan saya aman?',
      a: 'Sangat aman. Kami menggunakan enkripsi standar industri untuk semua data. Suara Anda hanya diproses untuk ekstraksi teks dan tidak disimpan permanen.',
    },
    {
      q: 'Seberapa akurat AI-nya?',
      a: "Kami menggunakan model Gemini terbaru yang sangat fasih bahasa Indonesia, termasuk slang sehari-hari seperti 'pewe', 'ceban', atau 'goceng'.",
    },
    {
      q: 'Bisa export ke Excel/CSV?',
      a: 'Bisa banget. Anda bisa export laporan bulanan ke format CSV atau PDF untuk keperluan audit pribadi.',
    },
    {
      q: 'Apakah gratis?',
      a: 'HaloDompet memiliki tier gratis selamanya untuk penggunaan dasar. Fitur advanced analytics tersedia di paket Pro.',
    },
  ]

  return (
    <section id="faq" className="py-24 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-semibold text-white mb-12 text-center">
          Pertanyaan Umum
        </h2>

        <div className="space-y-2">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="border border-zinc-800 rounded-xl bg-zinc-900/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-zinc-900/50 transition-colors"
              >
                <span className="font-medium text-zinc-200">{item.q}</span>
                <ChevronDown
                  className={`text-zinc-500 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                  size={20}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === idx ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="p-5 pt-0 text-zinc-400 text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

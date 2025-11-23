"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    question: "Apakah data keuangan saya aman?",
    answer: "Sangat aman! Data keuangan Anda disimpan dengan enkripsi end-to-end di Supabase (PostgreSQL). Kami tidak pernah membagikan data Anda kepada pihak ketiga. Audio yang Anda rekam hanya diproses oleh Gemini AI untuk ekstraksi data, dan tidak disimpan secara permanen."
  },
  {
    question: "Apakah HaloDompet benar-benar gratis?",
    answer: "Ya, 100% gratis untuk semua fitur utama! Anda bisa mencatat transaksi unlimited, mengelola multiple dompet, dan mengakses laporan keuangan tanpa biaya. Kami akan selalu mempertahankan versi gratis yang powerful untuk semua pengguna."
  },
  {
    question: "Apakah bisa mengelola beberapa dompet sekaligus?",
    answer: "Tentu saja! Anda bisa membuat multiple dompet (BCA, Gopay, OVO, Cash, dll) dan AI akan otomatis mendeteksi dompet mana yang Anda gunakan saat mencatat transaksi. Misalnya, ucapkan 'Beli kopi 25 ribu pakai Gopay' dan sistem akan mencatat ke dompet Gopay Anda."
  },
  {
    question: "Seberapa akurat AI dalam mengenali transaksi?",
    answer: "AI kami menggunakan Gemini 2.5 Flash yang sangat akurat dalam memahami bahasa natural Indonesia. Tingkat akurasi mencapai 95%+ untuk transaksi dengan informasi lengkap. AI dapat mengenali item, harga, kategori, lokasi, metode pembayaran, dan dompet secara otomatis. Anda juga bisa mengedit transaksi jika diperlukan."
  }
]

export function FAQSection() {
  return (
    <section className="relative py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Pertanyaan Umum
          </h2>
          <p className="text-lg text-zinc-500 font-medium">
            Masih ada pertanyaan? Kami siap membantu Anda.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 border-zinc-800 bg-zinc-950 px-6 data-[state=open]:border-emerald-400 transition-colors duration-200"
              >
                <AccordionTrigger className="text-left hover:text-emerald-400 transition-colors py-5 text-white font-black">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-500 leading-relaxed pb-5 font-medium">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA after FAQ */}
        <div className="text-center mt-16">
          <p className="text-zinc-500 mb-4 font-medium">Punya pertanyaan lain?</p>
          <a
            href="mailto:support@halodompet.com"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
          >
            Hubungi Kami
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

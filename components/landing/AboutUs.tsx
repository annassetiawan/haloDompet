'use client'

import React from 'react'
import { Sparkles, Code, Palette, Coffee } from 'lucide-react'

export const AboutUs: React.FC = () => {
  return (
    <section id="about" className="py-32 px-6 bg-[#050505] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Story Section */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-violet-300 mb-6">
            <Sparkles size={12} />
            <span>The Origin Story</span>
          </div>
          
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight text-white">
            Lahir dari Rasa Malas <br />
            <span className="text-white/40">Nyatet Pengeluaran</span>
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-6 text-lg text-white/60 leading-relaxed">
            <p>
              Aplikasi ini lahir karena yang "bikin", sering lupa nyatet pengeluaran sebulan dan males nyatet secara manual, jadinya sering bingung "kok dah habis segini buat apa aja yak"
              {/* <strong className="text-white">Saya capek nyatet pengeluaran manual.</strong> */}
            </p>
            
            <p>
              Akhirnya kepikiran kan ya, kenapa nyatet pengeluaran nggak tinggal ngomong aja sih, karena musuh terbesar menabung itu bukan harga barangnya, <strong className="text-white"> tapi rasa malas nyatetnya</strong>
            </p>
          </div>
        </div>


      </div>
    </section>
  )
}

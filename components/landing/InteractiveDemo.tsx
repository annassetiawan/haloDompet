'use client'

import React, { useState, useEffect } from 'react'
import { Mic, Check } from 'lucide-react'

export const InteractiveDemo: React.FC = () => {
  const [step, setStep] = useState(0) // 0: Idle, 1: Listening, 2: Processing, 3: Done

  const startDemo = () => {
    if (step !== 0) return
    setStep(1)
    setTimeout(() => setStep(2), 2000)
    setTimeout(() => setStep(3), 4000)
    setTimeout(() => setStep(0), 7000)
  }

  return (
    <section className="py-32 px-6 bg-[#080808] border-y border-white/5 relative overflow-hidden" id="demo">

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

        <div className="order-2 md:order-1 relative">
           <div className="absolute inset-0 bg-violet-600/20 blur-[100px] rounded-full"></div>

           {/* Phone Mockup Container */}
           <div className="relative z-10 mx-auto w-full max-w-sm bg-black border border-white/10 rounded-[3rem] p-6 shadow-2xl h-[600px] flex flex-col">
              {/* Dynamic Island */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-8 bg-black border border-white/10 rounded-full z-20 flex items-center justify-center gap-2">
                 <div className={`w-1 h-1 rounded-full bg-violet-500 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>

              {/* Screen Content */}
              <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-[2rem] bg-[#0c0c0c]">

                {step === 0 && (
                   <div className="text-center">
                      <p className="text-white/40 mb-4 font-mono text-sm">Tap to speak</p>
                      <button
                        onClick={startDemo}
                        className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                      >
                         <Mic className="text-white" size={32} />
                      </button>
                   </div>
                )}

                {step === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-30">
                     <div className="flex gap-1 h-12 items-center">
                        {[...Array(5)].map((_, i) => (
                           <div key={i} className="w-2 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`, height: '50%' }} />
                        ))}
                     </div>
                  </div>
                )}

                {/* Chat Interface */}
                <div className="w-full px-4 space-y-4 absolute bottom-8 left-0">
                   {step >= 2 && (
                     <div className="ml-auto bg-violet-600/10 border border-violet-600/20 text-violet-200 p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        &quot;Martabak manis 35 ribu pakai OVO&quot;
                     </div>
                   )}

                   {step === 3 && (
                     <div className="mr-auto bg-white/10 border border-white/5 text-white p-4 rounded-2xl rounded-tl-sm max-w-[90%] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-start gap-3">
                           <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                              <Check size={14} className="text-violet-300" />
                           </div>
                           <div>
                              <p className="text-xs text-white/50 mb-1">Transaksi Tercatat</p>
                              <p className="font-semibold">Martabak Manis</p>
                              <p className="text-white/80 text-sm">Rp 35.000 • Makanan • OVO</p>
                              <p className="text-xs text-violet-400 mt-2 italic">&quot;Diet mulai besok ya?&quot;</p>
                           </div>
                        </div>
                     </div>
                   )}
                </div>

              </div>
           </div>
        </div>

        <div className="order-1 md:order-2">
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight">
            Magis. <br/>
            <span className="text-white/40">Bukan Sihir.</span>
          </h2>
          <p className="text-xl text-white/60 mb-8 leading-relaxed">
            Proses pencatatan manual itu membosankan. Kami membuatnya hilang.
            Teknologi <span className="text-violet-400">Voice-to-Data</span> kami memecah kalimat kompleks menjadi data terstruktur dalam hitungan milidetik.
          </p>

          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-serif text-xl bg-white/5">1</div>
                <p className="text-lg">Tekan tombol mic (atau gunakan widget).</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-serif text-xl bg-white/5">2</div>
                <p className="text-lg">Ngomong senatural mungkin.</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center font-serif text-xl bg-white/5">3</div>
                <p className="text-lg">Selesai. Balik lagi scrolling TikTok.</p>
             </div>
          </div>
        </div>

      </div>
    </section>
  )
}

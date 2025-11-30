'use client'

import React from 'react'
import { ArrowRight, Mic } from 'lucide-react'

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[110vh] flex flex-col justify-center items-center px-6 overflow-hidden pt-20">

      {/* Ambient Background Elements */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-fuchsia-900/30 rounded-full blur-[100px] animate-float opacity-40" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-violet-900/30 rounded-full blur-[120px] animate-float-delayed opacity-40" />

      <div className="max-w-5xl mx-auto text-center z-10">

        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:border-violet-500/50 transition-colors duration-300 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
          </span>
          <span className="text-xs font-medium tracking-wider uppercase text-violet-200/80">
            Voice AI 2.0 Kini Aktif
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-[0.95] tracking-tight mb-8">
          <span className="text-white/40 italic block text-3xl md:text-5xl mb-2 font-normal">Sudah 2025, kok masih ngetik?</span>
          Catat Keuangan <br />
          <span className="bg-gradient-to-r from-violet-400 via-white to-fuchsia-400 bg-clip-text text-transparent">
            Semudah Ngobrol.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
          HaloDompet mengubah suaramu jadi data finansial yang rapi.
          Tanpa spreadsheet. Tanpa ribet. Cukup bilang, <span className="text-white border-b border-violet-500/50">&quot;Kopi 25 ribu&quot;</span> dan selesai.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#download" className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg flex items-center gap-2 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Mulai Gratis <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-violet-500 text-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
          </a>

          <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 text-white/80 hover:text-white backdrop-blur-sm">
            <Mic size={20} className="text-violet-400" />
            <span>Lihat Cara Kerja</span>
          </button>
        </div>

      </div>

      {/* Abstract Phone/App Visual at bottom */}
      <div className="mt-20 relative w-full max-w-4xl mx-auto perspective-1000">
        <div className="relative z-10 bg-[#111] rounded-t-[3rem] border-t border-l border-r border-white/10 p-4 shadow-2xl transform-gpu rotate-x-12 translate-y-10 opacity-90">
             <div className="h-64 bg-gradient-to-b from-gray-900 to-black rounded-t-[2.5rem] flex items-center justify-center border-b border-white/5 relative overflow-hidden">

                {/* Simulated Waveform */}
                <div className="flex items-end gap-1 h-16">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 bg-violet-600/80 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.1}s`
                            }}
                        />
                    ))}
                </div>
             </div>
        </div>
        {/* Glow behind */}
        <div className="absolute top-10 inset-x-10 h-64 bg-violet-600/20 blur-[100px] z-0" />
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }

        .animate-float {
          animation: float 10s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 10s ease-in-out infinite;
          animation-delay: 2s;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .rotate-x-12 {
          transform: rotateX(12deg);
        }
      `}</style>
    </section>
  )
}

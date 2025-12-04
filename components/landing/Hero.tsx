'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Mic } from 'lucide-react'
import Lottie from 'lottie-react'
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'
import LightRays from '../LightRays'

export const Hero: React.FC = () => {
  // State untuk menyimpan status apakah ini desktop atau bukan
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Fungsi untuk cek ukuran layar
    const checkScreenSize = () => {
      // 768px adalah breakpoint 'md' standar Tailwind
      setIsDesktop(window.innerWidth >= 768)
    }

    // Cek saat pertama kali load
    checkScreenSize()

    // Cek setiap kali layar di-resize
    window.addEventListener('resize', checkScreenSize)

    // Bersihkan listener saat komponen di-unmount
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center px-6 overflow-hidden pt-24 md:pt-0 md:justify-center">
      {/* Ambient Background Elements */}
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-fuchsia-900/30 rounded-full blur-[100px] animate-float opacity-40" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-violet-900/30 rounded-full blur-[120px] animate-float-delayed opacity-40" />
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 z-0 pointer-events-none">
        <LightRays
          // LOGIKA DINAMIS DI SINI:
          raysOrigin={isDesktop ? 'top-center' : 'right'}
          raysColor="#AD8BF9"
          raysSpeed={1.5}
          lightSpread={3.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays w-full h-full" // Pastikan canvas di dalam komponen juga full
        />
      </div>
      <div className="max-w-5xl mx-auto text-center z-10">
        {/* Main Heading */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
          {/* 1. items-center diganti items-stretch agar tinggi anak-anaknya sama rata */}

          <div className="flex-1">
            {/* 2. Tambahkan flex-1 di sini agar text mengambil sisa ruang yang ada */}
            <div>
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 hover:border-violet-500/50 transition-colors duration-300 cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                </span>
                <span className="text-xs font-medium tracking-wider uppercase text-violet-200/80">
                  Powered by Gemini AI 2.5
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-medium leading-[0.95] tracking-tight mb-8">
                <span className="text-white/40 italic block text-xl md:text-4xl mb-2 font-normal">
                  Capek ngetik? Udah, tinggal ngomong aja
                </span>
                Catat Keuangan <br />
                <span className="bg-gradient-to-r from-violet-400 via-white to-fuchsia-400 bg-clip-text text-transparent">
                  Semudah Kirim Voice Note
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
                HaloDompet mengubah suaramu jadi data finansial yang rapi. Tanpa
                spreadsheet. Tanpa ribet. Cukup bilang,{' '}
                <span className="text-white border-b border-violet-500/50">
                  &quot;Beli Kopi 25 ribu&quot;
                </span>{' '}
                dan selesai.
              </p>
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://halodompet.vercel.app/login"
                  className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg flex items-center gap-2 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Mulai Gratis{' '}
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                  <div className="absolute inset-0 bg-violet-500 text-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
                </a>

                <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 text-white/80 hover:text-white backdrop-blur-sm">
                  <Mic size={20} className="text-violet-400" />
                  <span>Lihat Cara Kerja</span>
                </button>
              </div>
            </div>
          </div>

          {/* Wrapper untuk Lottie agar basis bekerja dengan benar saat di-stretch */}
          <div className="basis-1/3 flex flex-col justify-center">
            <Lottie
              animationData={avatarIdleAnimation}
              loop={true}
              autoplay={true}
              // 3. Hapus h-[300px], ganti dengan h-full atau w-full agar mengikuti container
              className="w-full h-auto max-h-full drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Container Lottie */}
      {/* Saya hapus efek perspective/rotate supaya animasinya terlihat jelas (flat). 
            Jika ingin miring 3D, tambahkan class 'perspective-1000 rotate-x-12' lagi */}
      {/* <div className="relative z-10 pt-12 p-4 transform-gpu opacity-90 hover:opacity-100 transition-opacity duration-500">
        <Lottie
          animationData={avatarIdleAnimation}
          loop={true}
          autoplay={true}
          className="w-full h-[300px] drop-shadow-2xl"
        />
      </div> */}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
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

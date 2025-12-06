'use client'

import React, { useState, useEffect } from 'react'
import { ArrowRight, Mic } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Lottie from 'lottie-react'
import avatarIdleAnimation from '@/public/animations/avatar-idle.json'
import LightRays from '../LightRays'

export const Hero: React.FC = () => {
  const [isDesktop, setIsDesktop] = useState(false)
  const [targetY, setTargetY] = useState(0)
  const { scrollY } = useScroll()
  
  // Transformasi untuk avatar "Menggelinding"
  // Stage 1 (0-400): Gelinding ke kanan
  // Stage 2 (400-800): Jatuh ke bawah ke kolom kanan section About
  
  // X: Geser ke kiri untuk masuk ke mockup HP di InteractiveDemo
  // InteractiveDemo layout: Phone is on the LEFT (order-2 md:order-1)
  // Grid is max-w-6xl. Left column center is approx -630 from center.
  // Adjusted to -675 for perfect alignment (was -660)
  const avatarX = useTransform(scrollY, [0, 800], [0, -730])
  
  // Y: Turun ke section InteractiveDemo (Section 2)
  // InteractiveDemo starts at 100vh. Phone is vertically centered.
  // Target Y = 100vh + approx 300px (to land in screen center)
  const avatarY = useTransform(scrollY, [0, 800], [0, targetY])
  
  // Rotate: Muter terus sampai 360 derajat (Negative for left movement)
  const avatarRotate = useTransform(scrollY, [0, 800], [0, -360])
  
  // Scale: Shrink to fit inside phone screen (approx 0.4)
  // Start size reduced from 1.5 to 1.1 as requested
  const avatarScale = useTransform(scrollY, [0, 800], [1.1, 0.4])

  // Opacity: Fade out at the end to handoff to InteractiveDemo
  // Extended range for smoother transition (600-800)
  const avatarOpacity = useTransform(scrollY, [500, 700], [1, 0])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
      // Calculate target Y: 100vh (start of InteractiveDemo) + offset
      // Offset adjusted to 230px (was 250px) to move up slightly
      if (typeof window !== 'undefined') {
        setTargetY(window.innerHeight + 250)
      }
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center px-6 pt-24 md:pt-0 md:justify-center z-50 pointer-events-none md:pointer-events-auto">
      {/* Background Container with Overflow Hidden */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <div className="absolute inset-0 z-0">
          <LightRays
            raysOrigin={isDesktop ? 'top-center' : 'right'}
            raysColor="#AD8BF9"
            raysSpeed={1.5}
            lightSpread={3.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays w-full h-full"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto text-center z-10 w-full pointer-events-auto">
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
          <div className="flex-1">
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

          {/* Wrapper untuk Lottie dengan Scrollytelling */}
          <div className="basis-1/3 flex flex-col justify-center relative z-20">
            <motion.div 
              style={{ 
                x: isDesktop ? avatarX : 0,
                y: isDesktop ? avatarY : 0,
                rotate: isDesktop ? avatarRotate : 0,
                scale: isDesktop ? avatarScale : 1,
                opacity: isDesktop ? avatarOpacity : 1
              }}
              className="w-full"
            >
              <Lottie
                animationData={avatarIdleAnimation}
                loop={true}
                autoplay={true}
                className="w-2/3 md:w-full mx-auto h-auto max-h-full drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

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
      `}</style>
    </section>
  )
}

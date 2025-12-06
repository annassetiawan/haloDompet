'use client'

import React, { useState } from 'react'
import { Check, ArrowRight, Wallet, Tag, Calendar } from 'lucide-react'
import { LottieAvatarRecorder } from '@/components/LottieAvatarRecorder'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

export const InteractiveDemo: React.FC = () => {
  const [demoState, setDemoState] = useState<'idle' | 'processing' | 'success'>(
    'idle',
  )
  const [demoResult, setDemoResult] = useState<any>(null)
  const [status, setStatus] = useState('Tekan tombol & mulai bicara')

  const { scrollY } = useScroll()
  // Opacity: Fade in when Hero avatar fades out (600-800)
  const avatarOpacity = useTransform(scrollY, [600, 800], [0, 1])
  // Scale: Pop effect (0.8 -> 1) for smoother landing
  const avatarScale = useTransform(scrollY, [600, 800], [0.8, 1])

  const handleTranscript = async (transcript: string) => {
    setDemoState('processing')
    setStatus('Sedang memproses suara...')

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses')
      }

      setDemoResult(data.data)
      setDemoState('success')
      setStatus('Berhasil! Data terekstrak.')
    } catch (error) {
      console.error('Demo error:', error)
      setStatus('Gagal memproses. Coba lagi.')
      setDemoState('idle')
    }
  }

  const handleStatusChange = (newStatus: string) => {
    if (demoState !== 'success') {
      setStatus(newStatus)
    }
  }

  return (
    <section
      className="py-32 px-6 bg-[#080808] border-y border-white/5 relative overflow-hidden"
      id="demo"
    >
      
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        
        <div className="order-2 md:order-1 relative">
          <div className="absolute inset-0 bg-violet-600/20 blur-[100px] rounded-full"></div>

          {/* iPhone 15 Pro Mockup */}
          <div className="relative z-10 mx-auto w-full max-w-[360px] h-[720px] bg-black rounded-[3.5rem] shadow-2xl border-[8px] border-[#1f1f1f] ring-1 ring-white/10">
            {/* Side Buttons */}
            {/* Power Button */}
            <div className="absolute top-24 -right-[11px] w-[3px] h-16 bg-[#1f1f1f] rounded-r-md"></div>
            {/* Volume Buttons */}
            <div className="absolute top-24 -left-[11px] w-[3px] h-10 bg-[#1f1f1f] rounded-l-md"></div>
            <div className="absolute top-36 -left-[11px] w-[3px] h-10 bg-[#1f1f1f] rounded-l-md"></div>
            {/* Action Button */}
            <div className="absolute top-12 -left-[11px] w-[3px] h-6 bg-[#1f1f1f] rounded-l-md"></div>

            {/* Screen Container */}
            <div className="relative w-full h-full bg-black rounded-[3rem] overflow-hidden border-[6px] border-black flex flex-col">
              {/* Dynamic Island */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 flex items-center justify-center gap-2 transition-all duration-300">
                {/* Camera/Sensor dots */}
                <div className="w-full h-full relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1a1a1a]"></div>
                  <div
                    className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-violet-500 transition-opacity duration-300 ${
                      demoState === 'processing' ? 'opacity-100' : 'opacity-0'
                    }`}
                  ></div>
                </div>
              </div>

            

              {/* Screen Content */}
              <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#0c0c0c] p-4 pt-12">
                {/* Demo Label */}
                <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm z-20">
                  <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                    Demo Interaktif
                  </span>
                </div>
                {/* Result Card */}
                {demoState === 'success' && demoResult ? (
                  <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-white/10 border border-white/5 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                          <Check size={16} />
                        </div>
                        <span className="font-medium text-white">
                          Hasil Analisis AI (Demo)
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-start border-b border-white/5 pb-3">
                          <span className="text-white/60 text-sm">Item</span>
                          <span className="text-white font-medium text-right">
                            {demoResult.item}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-white/60 text-sm">Nominal</span>
                          <span className="text-white font-medium">
                            Rp {demoResult.amount.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-3">
                          <span className="text-white/60 text-sm">
                            Kategori
                          </span>
                          <span className="px-2 py-1 rounded-md bg-violet-500/20 text-violet-300 text-xs font-medium">
                            {demoResult.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-sm">
                            Dompet
                          </span>
                          <span className="text-white/80 text-sm">
                            {demoResult.wallet_name || '-'}
                          </span>
                        </div>
                      </div>

                      {demoResult.roast_message && (
                        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 text-xs text-violet-200 italic mt-2">
                          &quot;{demoResult.roast_message}&quot;
                        </div>
                      )}
                    </div>

                    <div className="mt-6 text-center">
                      <Link href="/login">
                        <Button className="w-full bg-white text-black hover:bg-white/90 font-semibold rounded-xl py-6">
                          Keren kan? Daftar Sekarang!
                        </Button>
                      </Link>
                      <button
                        onClick={() => {
                          setDemoState('idle')
                          setDemoResult(null)
                          setStatus('Tekan tombol & mulai bicara')
                        }}
                        className="mt-4 text-sm text-white/40 hover:text-white transition-colors"
                      >
                        Coba lagi
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 w-full mt-auto mb-auto">
                    {/* Bubble Chat */}
                    <div className="relative w-full max-w-[280px] mx-auto mb-2 flex flex-col justify-end items-center transition-all duration-300">
                      <div
                        className={`relative px-4 py-3 rounded-2xl shadow-sm border transition-all duration-300 ${
                          demoState !== 'idle'
                            ? 'bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-100 scale-100 opacity-100'
                            : 'bg-white/5 border-white/5 text-white/40 scale-95 opacity-80'
                        }`}
                      >
                        {/* Label Bubble Dynamic */}
                        <span
                          className={`absolute -top-2.5 left-4 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm border uppercase tracking-wider ${
                            demoState !== 'idle'
                              ? 'bg-[#0c0c0c] border-violet-500/30 text-violet-400'
                              : 'bg-[#0c0c0c] border-white/10 text-white/30'
                          }`}
                        >
                          {demoState === 'processing' ? 'Dompie' : 'Status'}
                        </span>

                        <p
                          className={`text-center font-medium leading-snug ${
                            demoState !== 'idle' ? 'text-sm' : 'text-xs italic'
                          }`}
                        >
                          {status}
                        </p>

                        <div
                          className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${
                            demoState !== 'idle'
                              ? 'bg-[#0c0c0c] border-violet-500/20' // Hacky way to match dark bg
                              : 'bg-[#0c0c0c] border-white/5'
                          }`}
                          style={{ backgroundColor: '#0c0c0c' }} // Ensure it blends with phone bg
                        ></div>
                      </div>
                    </div>

                    <div className="scale-125">
                      <motion.div style={{ opacity: avatarOpacity, scale: avatarScale }}>
                        <LottieAvatarRecorder
                          onTranscript={handleTranscript}
                          onStatusChange={handleStatusChange}
                          isLoading={demoState === 'processing'}
                          sentiment={
                            demoState === 'success'
                              ? demoResult?.sentiment
                              : undefined
                          }
                        />
                      </motion.div>
                    </div>

                    {/* Example Prompts */}
                    <div className="space-y-2 mt-4">
                      <p className="text-xs text-white/30 text-center uppercase tracking-wider mb-2">
                        Contoh ucapan:
                      </p>
                      <div className="space-y-2 text-xs text-white/60">
                        <div className="bg-white/5 p-3 text-center rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                          &quot;Beli kopi americano 25 ribu di ABCKopi &quot;
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-violet-300 mb-6">
          <Check size={12} />
          <span>Demo Interaktif</span>
        </div>
          <h2 className="font-serif text-4xl md:text-6xl mb-8 leading-tight text-white">
            Lihat AI Bekerja <br />
            <span className="text-white/40">di Depan Matamu.</span>
          </h2>
          <p className="text-xl text-white/60 mb-8 leading-relaxed">
            Nggak perlu daftar dulu. Coba tekan si Dompie dan ngomong aja layaknya kamu lagi curhat soal duit
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full border border-white/10 flex items-center justify-center font-serif text-xl bg-white/5 text-white">
                1
              </div>
              <p className="text-lg text-white/80">
                Tekan tombol avatar Dompie di simulasi HP
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full border border-white/10 flex items-center justify-center font-serif text-xl bg-white/5 text-white">
                2
              </div>
              <p className="text-lg text-white/80">
                Ucapkan pengeluaranmu
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 shrink-0 rounded-full border border-white/10 flex items-center justify-center font-serif text-xl bg-white/5 text-white">
                3
              </div>
              <p className="text-lg text-white/80">
                Lihat hasil ekstraksi & roasting AI secara instan
              </p>
            </div>
          </div>
        </div>
      
      </div>
      
    </section>
  )
}

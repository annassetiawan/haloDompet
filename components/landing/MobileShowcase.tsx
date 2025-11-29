'use client'

import Image from 'next/image'
import { useState } from 'react'

export function MobileShowcase() {
  const screenshots = [
    {
      title: 'Dashboard',
      description: 'Lihat semua dompet dan total aset dalam satu layar',
      image: '/screenshots/dashboard.png',
      fallback: '💰',
    },
    {
      title: 'Voice Recording',
      description: 'Rekam pengeluaran dengan suara, cepat dan mudah',
      image: '/screenshots/voice-recording.png',
      fallback: '🎙️',
    },
    {
      title: 'Transaction Result',
      description: 'AI otomatis ekstrak item, harga, kategori, dan dompet',
      image: '/screenshots/transaction-result.png',
      fallback: '✅',
    },
    {
      title: 'Analytics',
      description: 'Grafik visual yang mudah dipahami',
      image: '/screenshots/analytics.png',
      fallback: '📊',
    },
    {
      title: 'AI Advisor',
      description: 'Chat dengan Dompie untuk insight keuangan',
      image: '/screenshots/advisor.png',
      fallback: '🤖',
    },
  ]

  return (
    <section className="py-20 md:py-32 px-6 bg-zinc-900/30 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-violet-400 text-sm font-mono uppercase tracking-widest mb-4">
            Lihat Langsung
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Aplikasi Mobile yang Intuitif
          </h2>
          <p className="text-lg text-zinc-400">
            Dirancang untuk pengalaman terbaik di smartphone. Cepat, smooth, dan mudah digunakan.
          </p>
        </div>

        {/* Screenshots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Phone Frame */}
              <div className="relative w-full max-w-[280px] mx-auto aspect-[9/19.5] bg-black rounded-[2.5rem] border-[6px] border-zinc-800 shadow-2xl overflow-hidden ring-1 ring-white/10 hover:ring-violet-500/30 transition-all duration-300 hover:-translate-y-2">
                {/* Notch */}
                <div className="absolute top-0 inset-x-0 h-6 bg-black z-20 flex justify-center">
                  <div className="w-28 h-5 bg-black rounded-b-2xl border-b border-x border-zinc-800/50 absolute top-0" />
                </div>

                {/* Screenshot or Fallback */}
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center text-6xl">
                  {/* Image will be shown when available, fallback emoji when not */}
                  <ImageWithFallback
                    src={screenshot.image}
                    alt={screenshot.title}
                    fallback={screenshot.fallback}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="text-center mt-6 space-y-2">
                <h3 className="text-lg font-bold">{screenshot.title}</h3>
                <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Info Text */}
        <div className="mt-16 text-center">
          <p className="text-sm text-zinc-500 max-w-2xl mx-auto">
            💡 <strong className="text-zinc-400">Tip:</strong> Untuk melihat tampilan sebenarnya,
            tambahkan screenshot aplikasi mobile ke folder <code className="bg-zinc-800/50 px-2 py-1 rounded text-violet-400">/public/screenshots/</code>
          </p>
        </div>
      </div>
    </section>
  )
}

// Component to handle image loading with fallback
function ImageWithFallback({
  src,
  alt,
  fallback,
}: {
  src: string
  alt: string
  fallback: string
}) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    return <div className="text-6xl">{fallback}</div>
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setImageError(true)}
    />
  )
}

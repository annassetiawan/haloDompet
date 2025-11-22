"use client"

import { Badge } from '@/components/ui/badge'
import { DemoRecorder } from './DemoRecorder'

export function DemoFeatureSection() {
  return (
    <section id="demo" className="relative py-24 bg-[#080808] overflow-hidden">
      {/* Background Gradient Accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-[100%] opacity-10 blur-[150px]"
          style={{
            background: 'radial-gradient(ellipse at center, #a855f7 0%, #ec4899 50%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1">
            <Badge
              variant="outline"
              className="mb-6 border-purple-900/50 bg-purple-950/30 text-purple-400 hover:bg-purple-950/50"
            >
              Powered by Gemini 2.5 Flash
            </Badge>

            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Speak naturally.{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                It understands everything.
              </span>
            </h2>

            <div className="space-y-4 text-zinc-400 leading-relaxed">
              <p className="text-lg">
                Tidak perlu form manual yang membosankan. Cukup ucapkan transaksi Anda secara natural, dan AI kami akan otomatis mengenali:
              </p>

              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span><strong className="text-white">Item & Harga</strong> - Apa yang Anda beli dan berapa harganya</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span><strong className="text-white">Kategori Otomatis</strong> - Makanan, transportasi, hiburan, dll</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span><strong className="text-white">Dompet & Metode</strong> - BCA, Gopay, OVO, cash, dll</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2.5 flex-shrink-0" />
                  <span><strong className="text-white">Lokasi & Detail</strong> - Tempat belanja dan info tambahan</span>
                </li>
              </ul>

              <p className="text-sm italic pt-4 border-t border-zinc-800 mt-6">
                Contoh: &quot;Beli kopi 25 ribu di Starbucks pakai Gopay&quot;
                <br />
                <span className="text-purple-400">→</span> Langsung jadi struk digital lengkap!
              </p>
            </div>
          </div>

          {/* Right Column - Interactive Phone Mockup */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              {/* Phone Frame with Glow */}
              <div className="relative">
                {/* Glow Effect Behind Phone */}
                <div
                  className="absolute inset-0 rounded-[3rem] blur-3xl opacity-40"
                  style={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  }}
                />

                {/* Phone Container */}
                <div
                  className="relative w-[340px] h-[680px] rounded-[3rem] border-[12px] border-zinc-900 bg-zinc-950 shadow-2xl overflow-hidden"
                  style={{
                    boxShadow: '0 0 60px rgba(0, 0, 0, 0.8), inset 0 0 2px rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-950 rounded-b-3xl z-10 border-b-2 border-zinc-900" />

                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-zinc-900/50 to-transparent z-0 px-8 flex items-center justify-between text-xs text-zinc-500">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-3 border border-zinc-600 rounded-sm" />
                      <div className="w-1 h-2 bg-zinc-600 rounded-sm" />
                    </div>
                  </div>

                  {/* Screen Content */}
                  <div className="h-full pt-12 pb-8 px-6 overflow-y-auto">
                    {/* App Header */}
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">H</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1">HaloDompet Demo</h3>
                      <p className="text-xs text-zinc-500">Coba rekam transaksi Anda</p>
                    </div>

                    {/* Demo Recorder Component */}
                    <DemoRecorder />

                    {/* Example Prompts */}
                    <div className="mt-6 space-y-2">
                      <p className="text-xs text-zinc-600 font-medium">Contoh yang bisa Anda coba:</p>
                      <div className="space-y-2">
                        <div className="text-xs p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-400">
                          💰 &quot;Beli makan siang 35 ribu pakai OVO&quot;
                        </div>
                        <div className="text-xs p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-400">
                          🚗 &quot;Isi bensin 50000 di Pertamina&quot;
                        </div>
                        <div className="text-xs p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-zinc-400">
                          💸 &quot;Dapat gaji 5 juta masuk BCA&quot;
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-zinc-800 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

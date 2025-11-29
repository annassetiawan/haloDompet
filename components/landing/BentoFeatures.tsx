'use client'

import React from 'react'
import { Mic, Wallet, TrendingUp, MessageSquareWarning, Sparkles } from 'lucide-react'
import { FeatureCardProps } from '@/types'

const BentoCard: React.FC<FeatureCardProps & { large?: boolean; tall?: boolean }> = ({
    title, description, icon, className = "", large, tall
}) => (
  <div className={`
    group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8
    hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500
    flex flex-col
    ${large ? 'md:col-span-2' : ''}
    ${tall ? 'md:row-span-2' : ''}
    ${className}
  `}>
    <div className="mb-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>

    <div className="mt-auto relative z-10">
      <h3 className="font-serif text-2xl mb-3 text-white group-hover:text-violet-300 transition-colors">{title}</h3>
      <p className="text-white/50 text-base leading-relaxed">{description}</p>
    </div>

    {/* Hover Glow Effect */}
    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full group-hover:bg-violet-600/20 transition-all duration-700" />
  </div>
)

export const BentoFeatures: React.FC = () => {
  return (
    <section className="py-32 px-6 relative" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 max-w-2xl">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">
            Fitur yang ngerti <br />
            <span className="text-white/40">isi dompet & hati kamu.</span>
          </h2>
          <p className="text-white/60 text-lg">
            Kami buang semua fitur ribet. Sisanya cuma fitur yang bikin kamu sadar finansial tanpa perlu effort lebih.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Main Feature - Wide */}
          <BentoCard
            large
            title="Voice Command Pintar"
            description="Teknologi NLP kami mengenali slang, singkatan, dan konteks. 'Soto ayam 15rb pake gopay' langsung tercatat rapi."
            icon={<Mic className="w-6 h-6" />}
          />

          {/* Tall Feature */}
          <BentoCard
            tall
            title="Dompie Advisor"
            description="Bukan sekadar notifikasi. Dompie adalah AI personality yang bakal nge-roast kalau kamu boros, dan muji kalau kamu hemat. Siapkan mental."
            icon={<MessageSquareWarning className="w-6 h-6" />}
            className="bg-gradient-to-b from-purple-900/10 to-transparent"
          />

          {/* Standard Features */}
          <BentoCard
            title="Multi-Wallet Sync"
            description="Cash, Bank, E-Wallet. Semua saldo terlihat di satu dashboard terkonsolidasi."
            icon={<Wallet className="w-6 h-6" />}
          />

          <BentoCard
            title="Auto-Categorization"
            description="Gak perlu milih kategori manual. AI tau kalau 'Starbucks' itu masuk kategori 'Pemborosan' (becanda, F&B)."
            icon={<Sparkles className="w-6 h-6" />}
          />

          <BentoCard
            large
            title="Visual Analytics"
            description="Grafik yang enak dilihat. Pahami cashflow bulananmu hanya dalam sekali lirik."
            icon={<TrendingUp className="w-6 h-6" />}
          />
        </div>
      </div>
    </section>
  )
}

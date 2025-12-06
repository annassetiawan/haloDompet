'use client'

import React from 'react'
import {
  Mic,
  Wallet,
  TrendingUp,
  MessageSquareWarning,
  Sparkles,
} from 'lucide-react'
import { FeatureCardProps } from '@/types'
import { motion } from 'framer-motion'

const BentoCard: React.FC<
  FeatureCardProps & { large?: boolean; tall?: boolean; index: number }
> = ({ title, description, icon, className = '', large, tall, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`
    group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-8
    hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500
    flex flex-col backdrop-blur-sm
    ${large ? 'md:col-span-2' : ''}
    ${tall ? 'md:row-span-2' : ''}
    ${className}
  `}
  >
    <div className="mb-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/5 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all duration-500">
      {icon}
    </div>

    <div className="mt-auto relative z-10">
      <h3 className="font-serif text-2xl mb-3 text-white group-hover:text-violet-300 transition-colors">
        {title}
      </h3>
      <p className="text-white/50 text-base leading-relaxed group-hover:text-white/70 transition-colors">
        {description}
      </p>
    </div>

    {/* Hover Glow Effect */}
    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-violet-600/10 blur-[80px] rounded-full group-hover:bg-violet-600/20 transition-all duration-700" />
  </motion.div>
)

export const BentoFeatures: React.FC = () => {
  const iconClass = "w-6 h-6 group-hover:text-violet-300 transition-colors"

  return (
    <section className="py-32 px-6 relative bg-[#080808]" id="features">
      {/* Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-4xl md:text-6xl mb-6 text-white leading-tight">
              Fitur yang ngerti <br />
              <span className="text-white/40">isi dompet & hati kamu.</span>
            </h2>
            <p className="text-white/60 text-lg md:text-xl leading-relaxed">
              Kami buang semua fitur ribet. Sisanya cuma fitur yang bikin kamu
              sadar finansial tanpa perlu effort lebih.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,auto)]">
          {/* Main Feature - Wide */}
          <BentoCard
            index={0}
            large
            title="Voice Command Pintar"
            description="Teknologi NLP kami mengenali slang, singkatan, dan konteks. 'Soto ayam 15rb pake gopay' langsung tercatat rapi."
            icon={<Mic className={iconClass} />}
          />

          {/* Tall Feature */}
          <BentoCard
            index={1}
            tall
            title="Dompie Advisor"
            description="Bukan sekadar notifikasi. Dompie adalah AI personality yang bakal nge-roast kalau kamu boros, dan muji kalau kamu hemat. Siapkan mental."
            icon={<MessageSquareWarning className={iconClass} />}
            className="bg-gradient-to-b from-violet-900/10 to-transparent"
          />

          {/* Standard Features */}
          <BentoCard
            index={2}
            title="Multi-Wallet Sync"
            description="Cash, Bank, E-Wallet. Semua saldo terlihat di satu dashboard terkonsolidasi."
            icon={<Wallet className={iconClass} />}
          />

          <BentoCard
            index={3}
            title="Scan Bukti Transaksi"
            description="Upload e-statement bank atau struk belanja, transaksi tercatat rapi secara otomatis di laporan keuanganmu."
            icon={<Wallet className={iconClass} />}
          />

          <BentoCard
            index={4}
            title="Auto-Categorization"
            description="Gak perlu milih kategori manual. AI tau kalau 'Starbucks' itu masuk kategori 'Pemborosan' (becanda, F&B)."
            icon={<Sparkles className={iconClass} />}
          />

          <BentoCard
            index={5}
            large
            title="Visual Analytics"
            description="Grafik yang enak dilihat. Pahami cashflow bulananmu hanya dalam sekali lirik."
            icon={<TrendingUp className={iconClass} />}
          />
        </div>
      </div>
    </section>
  )
}

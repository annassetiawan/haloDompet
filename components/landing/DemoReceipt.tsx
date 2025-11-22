"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Check, TrendingDown, TrendingUp } from 'lucide-react'

interface DemoReceiptProps {
  data: {
    item: string
    amount: number
    category: string
    type: 'income' | 'expense'
    wallet_name?: string
    location?: string | null
    payment_method?: string | null
  } | null
  onClose?: () => void
}

export function DemoReceipt({ data, onClose }: DemoReceiptProps) {
  if (!data) return null

  const isExpense = data.type === 'expense'

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md mx-auto"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl" />
            <div className="relative w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </motion.div>

        {/* Receipt Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl"
        >
          {/* Decorative top edge */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500" />

          {/* Header */}
          <div className="text-center mb-6 pt-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-2"
            >
              {isExpense ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              <span>{isExpense ? 'Pengeluaran' : 'Pemasukan'}</span>
            </motion.div>
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold"
            >
              {data.item}
            </motion.h3>
          </div>

          {/* Amount */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-6"
          >
            <div className={`text-4xl font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
              {isExpense ? '-' : '+'} {formatCurrency(data.amount)}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-6"
          >
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Kategori</span>
              <span className="text-sm font-medium">{data.category}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Dompet</span>
              <span className="text-sm font-medium">{data.wallet_name || 'Tunai'}</span>
            </div>

            {data.location && (
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Lokasi</span>
                <span className="text-sm font-medium">{data.location}</span>
              </div>
            )}

            {data.payment_method && (
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Metode Bayar</span>
                <span className="text-sm font-medium">{data.payment_method}</span>
              </div>
            )}
          </motion.div>

          {/* Demo Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-muted-foreground mb-4 p-2 bg-muted/30 rounded-lg"
          >
            ✨ Ini adalah mode demo - Data tidak disimpan
          </motion.div>

          {/* CTA Button */}
          <motion.a
            href="/login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium rounded-lg hover:scale-105 transition-transform"
          >
            Keren kan? Simpan Transaksi Ini 🚀
          </motion.a>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

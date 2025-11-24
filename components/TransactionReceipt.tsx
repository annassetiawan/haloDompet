'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionReceiptProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    item: string
    amount: number
    category: string
    type: 'expense' | 'income' | 'adjustment'
    date: string
    wallet_name?: string
    location?: string | null
    payment_method?: string | null
  } | null
}

export function TransactionReceipt({
  open,
  onOpenChange,
  data,
}: TransactionReceiptProps) {
  if (!data) return null

  // Format date to Indonesian format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Format currency to Indonesian Rupiah
  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  // Get badge color based on transaction type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'expense':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'adjustment':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  // Get transaction type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'income':
        return 'Pemasukan'
      case 'expense':
        return 'Pengeluaran'
      case 'adjustment':
        return 'Penyesuaian'
      default:
        return 'Transaksi'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0 font-mono overflow-hidden">
        {/* Hidden title for screen readers */}
        <DialogTitle className="sr-only">
          Struk Digital Transaksi - {data.item}
        </DialogTitle>

        {/* Receipt Container */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg">
          {/* Header with Success Icon */}
          <div className="flex flex-col items-center justify-center pt-6 pb-4 space-y-2">
            <div className="w-14 h-14 rounded-full bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-base font-bold text-green-700 dark:text-green-400 tracking-tight">
              TRANSAKSI BERHASIL
            </h3>
          </div>

          {/* Store Name */}
          <div className="text-center pb-2">
            <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 tracking-widest">
              HALODOMPET DIGITAL RECEIPT
            </p>
          </div>

          {/* Separator */}
          <div className="border-b border-dashed border-zinc-300 dark:border-zinc-700 my-4 mx-6" />

          {/* Transaction Details */}
          <div className="px-6 space-y-3 text-xs">
            {/* Date & Time */}
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-500">Tanggal</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                {formatDate(data.date)}
              </span>
            </div>

            {/* Transaction Type */}
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 dark:text-zinc-500">Jenis</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
                  getBadgeColor(data.type)
                )}
              >
                {getTypeLabel(data.type)}
              </span>
            </div>

            {/* Item Name */}
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-500">Item</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold text-right max-w-[200px] break-words">
                {data.item}
              </span>
            </div>

            {/* Category */}
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-500">Kategori</span>
              <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                {data.category}
              </span>
            </div>

            {/* Wallet Name */}
            {data.wallet_name && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Dompet</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {data.wallet_name}
                </span>
              </div>
            )}

            {/* Location (if available) */}
            {data.location && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Lokasi</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {data.location}
                </span>
              </div>
            )}

            {/* Payment Method (if available) */}
            {data.payment_method && (
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-500">Metode</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-semibold">
                  {data.payment_method}
                </span>
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-b border-dashed border-zinc-300 dark:border-zinc-700 my-4 mx-6" />

          {/* Total Amount */}
          <div className="px-6 pb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 tracking-wider">
                TOTAL
              </span>
              <span
                className={cn(
                  'text-xl font-bold tracking-tight',
                  data.type === 'income'
                    ? 'text-green-600 dark:text-green-400'
                    : data.type === 'expense'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                )}
              >
                {data.type === 'income' ? '+' : '-'} {formatCurrency(data.amount)}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center pb-4 px-6">
            <p className="text-[9px] text-zinc-400 dark:text-zinc-600">
              Terima kasih telah menggunakan HaloDompet
            </p>
            <p className="text-[9px] text-zinc-400 dark:text-zinc-600">
              Simpan struk ini sebagai bukti transaksi
            </p>
          </div>

          {/* Close Button */}
          <div className="px-4 pb-4">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full font-mono font-semibold"
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

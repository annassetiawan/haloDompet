'use client'

import { useRef, useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Share2, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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
  const receiptRef = useRef<HTMLDivElement>(null)
  const [html2canvasLib, setHtml2canvasLib] = useState<any>(null)

  // Load html2canvas only on client side
  useEffect(() => {
    if (typeof window !== 'undefined' && !html2canvasLib) {
      import('html2canvas')
        .then((module) => {
          setHtml2canvasLib(() => module.default)
        })
        .catch((error) => {
          console.error('Failed to load html2canvas:', error)
        })
    }
  }, [html2canvasLib])

  if (!data) return null

  // Handle share functionality
  const handleShare = async () => {
    const shareText = `
🧾 STRUK DIGITAL HALODOMPET

${getTypeLabel(data.type)}: ${data.item}
Kategori: ${data.category}
${data.wallet_name ? `Dompet: ${data.wallet_name}` : ''}
Total: ${data.type === 'income' ? '+' : '-'} ${formatCurrency(data.amount)}
Tanggal: ${formatDate(data.date)}

Dicatat dengan HaloDompet 💰
    `.trim()

    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: 'Struk Digital HaloDompet',
          text: shareText,
        })
        toast.success('Berhasil membagikan struk!')
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareText)
        toast.success('Struk berhasil disalin ke clipboard!')
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Gagal membagikan struk')
      }
    }
  }

  // Handle download as PDF/Image
  const handleDownload = async () => {
    try {
      if (!receiptRef.current) {
        toast.error('Element struk tidak ditemukan')
        return
      }

      if (!html2canvasLib) {
        toast.error('Library belum dimuat. Tunggu sebentar dan coba lagi')
        return
      }

      toast.loading('Membuat gambar struk...', { id: 'pdf-download' })

      // Small delay to ensure toast is visible
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Capture the receipt element
      const canvas = await html2canvasLib(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
      })

      // Convert to blob and download
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          const fileName = `struk-${data.item.replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.png`
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          toast.success('Struk berhasil diunduh!', { id: 'pdf-download' })
        } else {
          throw new Error('Failed to create blob')
        }
      })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Gagal mengunduh struk. Coba lagi ya!', { id: 'pdf-download' })
    }
  }

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
        <div ref={receiptRef} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg">
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

          {/* Action Buttons */}
          <div className="px-4 pb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                className="font-mono font-semibold gap-2"
              >
                <Share2 className="h-4 w-4" />
                Bagikan
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="font-mono font-semibold gap-2"
                disabled={!html2canvasLib}
                title={
                  !html2canvasLib
                    ? 'Memuat library... tunggu sebentar'
                    : 'Unduh struk sebagai gambar'
                }
              >
                <Download className="h-4 w-4" />
                Unduh
              </Button>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              variant="default"
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

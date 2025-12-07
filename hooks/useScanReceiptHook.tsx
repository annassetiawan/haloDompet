import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Wallet } from '@/types'
import { ScannedData, ScanReviewDialog } from '@/components/scan/ScanReviewDialog'

interface UseScanReceiptProps {
  onSuccess?: (transaction?: any) => void
  wallets: Wallet[]
}

export function useScanReceipt({ onSuccess, wallets }: UseScanReceiptProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleScanClick = () => {
    fileInputRef.current?.click()
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setIsScanning(true)
    const toastId = toast.loading('Memproses gambar struk...')

    try {
      const base64Image = await convertToBase64(file)

      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membaca struk')
      }

      // Process scanned data
      const noteParts = []
      if (data.data.notes_summary) noteParts.push(data.data.notes_summary)
      if (data.data.location) noteParts.push(`📍 ${data.data.location}`)
      if (data.data.payment_method) noteParts.push(`💳 ${data.data.payment_method}`)
      
      const combinedNote = noteParts.length > 0 ? noteParts.join('\n') : null

      setScannedData({
        item: data.data.item || '',
        amount: data.data.amount || 0,
        category: data.data.category || 'Lainnya',
        note: combinedNote,
      })

      setIsReviewOpen(true)
      toast.dismiss(toastId)
    } catch (error) {
      console.error('Error scanning receipt:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal memproses struk')
      toast.dismiss(toastId)
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirmScan = async () => {
    if (!scannedData) return

    setIsProcessing(true)
    const toastId = toast.loading('Menyimpan transaksi...')

    try {
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: scannedData.item,
          amount: scannedData.amount,
          category: scannedData.category,
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          voice_text: null,
          note: scannedData.note,
          wallet_id: selectedWalletId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan transaksi')
      }

      toast.success('Transaksi berhasil disimpan!')
      setIsReviewOpen(false)
      setScannedData(null)
      setSelectedWalletId(null)
      
      if (onSuccess) {
        onSuccess(data.transaction) // Pass the created transaction
      }
    } catch (error) {
      console.error('Error saving transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan transaksi')
    } finally {
      setIsProcessing(false)
      toast.dismiss(toastId)
    }
  }

  const handleCancelScan = () => {
    setIsReviewOpen(false)
    setScannedData(null)
    setSelectedWalletId(null)
  }

  const ScanDialog = () => (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <ScanReviewDialog
        open={isReviewOpen}
        onOpenChange={setIsReviewOpen}
        data={scannedData}
        onDataChange={setScannedData}
        onConfirm={handleConfirmScan}
        onCancel={handleCancelScan}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onSelectWallet={setSelectedWalletId}
        isProcessing={isProcessing}
      />
    </>
  )

  return {
    handleScanClick,
    isScanning,
    ScanDialog,
  }
}

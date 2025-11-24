"use client";

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Edit3, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EditBalanceDialogProps {
  walletId: string
  walletName: string
  currentBalance: number
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function EditBalanceDialog({
  walletId,
  walletName,
  currentBalance,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess
}: EditBalanceDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen
  const [newBalance, setNewBalance] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setNewBalance(currentBalance.toString())
    }
  }, [open, currentBalance])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const targetBalance = parseFloat(newBalance)

    // Validation
    if (isNaN(targetBalance)) {
      toast.error('Saldo harus berupa angka yang valid')
      return
    }

    if (targetBalance < 0) {
      toast.error('Saldo tidak boleh negatif')
      return
    }

    if (targetBalance === currentBalance) {
      toast.error('Saldo baru sama dengan saldo saat ini')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/transaction/adjustment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_balance: targetBalance,
          wallet_id: walletId,
          notes: `Penyesuaian saldo manual untuk ${walletName}`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyesuaikan saldo')
      }

      const difference = targetBalance - currentBalance
      const diffText = difference > 0
        ? `+Rp ${Math.abs(difference).toLocaleString('id-ID')}`
        : `-Rp ${Math.abs(difference).toLocaleString('id-ID')}`

      toast.success(`Saldo ${walletName} berhasil disesuaikan ${diffText}`)

      // Close dialog
      setOpen(false)

      // Refresh data
      router.refresh()

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error adjusting balance:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menyesuaikan saldo')
    } finally {
      setIsLoading(false)
    }
  }

  const difference = parseFloat(newBalance) - currentBalance
  const showDifference = !isNaN(difference) && difference !== 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Edit3 className="h-4 w-4" />
            Sesuaikan Saldo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95%] max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle>Sesuaikan Saldo</DialogTitle>
          <DialogDescription>
            Atur saldo aktual untuk {walletName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Current Balance Display */}
            <div className="space-y-2">
              <Label>Saldo Saat Ini</Label>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-2xl font-bold">
                  Rp {currentBalance.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* New Balance Input */}
            <div className="space-y-2">
              <Label htmlFor="new-balance">Saldo Baru</Label>
              <Input
                id="new-balance"
                type="number"
                placeholder="Masukkan saldo baru"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                disabled={isLoading}
                autoFocus
                className="text-lg"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan saldo aktual yang Anda miliki saat ini
              </p>
            </div>

            {/* Difference Preview */}
            {showDifference && (
              <div className={`p-4 rounded-lg border ${
                difference > 0
                  ? 'bg-emerald-500/10 border-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1">Perubahan</p>
                    <p className={`text-2xl font-bold ${
                      difference > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {difference > 0 ? '+' : ''}Rp {Math.abs(difference).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <ArrowRight className={`h-6 w-6 ${
                    difference > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Transaksi penyesuaian ini tidak akan mempengaruhi laporan pemasukan/pengeluaran
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary">
                💡 <strong>Catatan:</strong> Penyesuaian saldo digunakan untuk mengoreksi saldo awal atau
                memperbaiki kesalahan pencatatan. Transaksi ini tidak akan muncul di statistik
                pemasukan/pengeluaran bulanan.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || !showDifference}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

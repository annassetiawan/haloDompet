"use client";

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}



export function AddWalletDialog({ open, onOpenChange, onSuccess }: AddWalletDialogProps) {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Nama dompet harus diisi')
      return
    }

    const balanceNum = parseFloat(balance) || 0
    if (balanceNum < 0) {
      toast.error('Saldo tidak boleh negatif')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          balance: balanceNum,
          icon: '💰', // Default Icon
          color: '#000000', // Default Standard Black
          is_default: false,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat dompet')
      }

      toast.success(`Dompet "${name}" berhasil dibuat!`)

      // Reset form
      setName('')
      setBalance('')

      // Close dialog
      onOpenChange(false)

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error creating wallet:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal membuat dompet')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle>Tambah Dompet Baru</DialogTitle>
          <DialogDescription>
            Buat dompet baru untuk mengatur keuangan Anda
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Wallet Name */}
            <div className="space-y-2">
              <Label htmlFor="wallet-name">Nama Dompet</Label>
              <Input
                id="wallet-name"
                placeholder="Contoh: Bank BCA, GoPay, Tunai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* Initial Balance */}
            <div className="space-y-2">
              <Label htmlFor="wallet-balance">Saldo Awal (Opsional)</Label>
              <Input
                id="wallet-balance"
                type="number"
                placeholder="0"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                disabled={isLoading}
                min="0"
                step="1000"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan jika memulai dari 0
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat...
                </>
              ) : (
                'Buat Dompet'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

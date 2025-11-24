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

const walletIcons = [
  { emoji: '💵', label: 'Cash' },
  { emoji: '🏦', label: 'Bank' },
  { emoji: '💳', label: 'Card' },
  { emoji: '📱', label: 'E-Wallet' },
  { emoji: '💰', label: 'Savings' },
  { emoji: '🪙', label: 'Coins' },
  { emoji: '💎', label: 'Investment' },
  { emoji: '🎯', label: 'Goal' },
]

const walletColors = [
  { value: '#10b981', secondary: '#059669', label: 'Emerald' },
  { value: '#3b82f6', secondary: '#2563eb', label: 'Blue' },
  { value: '#f59e0b', secondary: '#f97316', label: 'Orange' },
  { value: '#ef4444', secondary: '#dc2626', label: 'Red' },
  { value: '#8b5cf6', secondary: '#7c3aed', label: 'Purple' },
  { value: '#ec4899', secondary: '#db2777', label: 'Pink' },
  { value: '#06b6d4', secondary: '#0891b2', label: 'Cyan' },
  { value: '#84cc16', secondary: '#65a30d', label: 'Lime' },
]

export function AddWalletDialog({ open, onOpenChange, onSuccess }: AddWalletDialogProps) {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('💰')
  const [selectedColor, setSelectedColor] = useState('#10b981')
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
          icon: selectedIcon,
          color: selectedColor,
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
      setSelectedIcon('💰')
      setSelectedColor('#10b981')

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

            {/* Icon Selection */}
            <div className="space-y-2">
              <Label>Icon Dompet</Label>
              <div className="grid grid-cols-4 gap-2">
                {walletIcons.map((icon) => (
                  <button
                    key={icon.emoji}
                    type="button"
                    onClick={() => setSelectedIcon(icon.emoji)}
                    disabled={isLoading}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedIcon === icon.emoji
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-card hover:border-primary/50'
                    }`}
                    title={icon.label}
                  >
                    <span className="text-2xl">{icon.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="space-y-2">
              <Label>Warna Kartu</Label>
              <div className="grid grid-cols-4 gap-2">
                {walletColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    disabled={isLoading}
                    className={`h-12 rounded-lg border-2 transition-all hover:scale-105 overflow-hidden ${
                      selectedColor === color.value
                        ? 'border-foreground ring-2 ring-offset-2 ring-foreground/50'
                        : 'border-border'
                    }`}
                    title={color.label}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${color.value} 0%, ${color.secondary} 100%)`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="relative overflow-hidden rounded-2xl h-32 p-4 text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${selectedColor} 0%, ${walletColors.find(c => c.value === selectedColor)?.secondary || selectedColor} 100%)`
                }}
              >
                {/* Decorative blur circles */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full blur-xl" />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">
                        Dompet
                      </p>
                      <h3 className="text-base font-bold text-white">
                        {name || 'Nama Dompet'}
                      </h3>
                    </div>
                    <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                      <span className="text-lg">{selectedIcon}</span>
                    </div>
                  </div>

                  {/* Footer: Balance */}
                  <div>
                    <p className="text-xs text-white/70 mb-0.5">Saldo Awal</p>
                    <p className="text-xl font-bold text-white">
                      Rp {parseFloat(balance || '0').toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
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

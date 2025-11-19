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
  { value: '#10b981', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
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
      <DialogContent className="sm:max-w-[500px]">
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
                    className={`h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-foreground ring-2 ring-offset-2 ring-foreground/50'
                        : 'border-border'
                    }`}
                    style={{ backgroundColor: `${color.value}30` }}
                    title={color.label}
                  >
                    <div
                      className="w-6 h-6 rounded-full mx-auto"
                      style={{ backgroundColor: color.value }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="p-4 rounded-xl border"
                style={{
                  background: `linear-gradient(135deg, ${selectedColor}15 0%, ${selectedColor}05 100%)`
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${selectedColor}20` }}
                  >
                    {selectedIcon}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {name || 'Nama Dompet'}
                    </p>
                    <p className="text-sm text-muted-foreground">
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

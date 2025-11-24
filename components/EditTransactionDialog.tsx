"use client";

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { WalletSelector } from '@/components/WalletSelector'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Transaction, Wallet, Category } from '@/types'

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  transaction: Transaction | null
  wallets: Wallet[]
  isLoadingWallets?: boolean
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
  wallets,
  isLoadingWallets = false
}: EditTransactionDialogProps) {
  // Form state
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const response = await fetch('/api/categories')
        const data = await response.json()

        if (response.ok && data.data) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
        toast.error('Gagal memuat kategori')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Pre-fill form when transaction changes
  useEffect(() => {
    if (transaction && open) {
      setItem(transaction.item)
      setAmount(transaction.amount.toString())
      setCategory(transaction.category)
      setDate(transaction.date.split('T')[0]) // Extract date part
      setSelectedWalletId(transaction.wallet_id || null)
    }
  }, [transaction, open])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setItem('')
      setAmount('')
      setCategory('')
      setDate('')
      setSelectedWalletId(null)
      setIsSubmitting(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transaction) {
      toast.error('Transaksi tidak ditemukan')
      return
    }

    // Validation
    if (!item.trim()) {
      toast.error('Nama item tidak boleh kosong')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Jumlah harus lebih dari 0')
      return
    }

    if (!category) {
      toast.error('Kategori harus dipilih')
      return
    }

    if (!selectedWalletId) {
      toast.error('Dompet harus dipilih')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/transaction?id=${transaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: item.trim(),
          amount: amountNum,
          category,
          date,
          wallet_id: selectedWalletId,
          type: transaction.type || 'expense',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Transaksi berhasil diperbarui: ${item} - Rp ${amountNum.toLocaleString('id-ID')}`)
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(data.error || 'Gagal memperbarui transaksi')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error('Terjadi kesalahan saat memperbarui transaksi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter categories based on transaction type
  const transactionType = transaction?.type || 'expense'
  const filteredCategories = categories.filter(c => c.type === transactionType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle>Edit Transaksi</DialogTitle>
          <DialogDescription>
            Ubah detail transaksi {transactionType === 'expense' ? 'pengeluaran' : 'pemasukan'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-item">Nama Item / Deskripsi</Label>
            <Input
              id="edit-item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder="Contoh: Makan siang"
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="edit-amount">Jumlah (Rp)</Label>
            <Input
              id="edit-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category">Kategori</Label>
            {isLoadingCategories ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-10 bg-muted/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-lg">
                Belum ada kategori. Tambahkan di Settings.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                      category === cat.name
                        ? transactionType === 'expense'
                          ? 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400'
                          : 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'border-muted bg-background hover:bg-accent'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="edit-date">Tanggal</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="max-w-full"
              required
            />
          </div>

          {/* Wallet Selector */}
          <div className="space-y-2">
            <Label>Dompet</Label>
            <WalletSelector
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
              isLoading={isLoadingWallets}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>Simpan Perubahan</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

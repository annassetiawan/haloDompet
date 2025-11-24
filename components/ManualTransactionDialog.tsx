"use client";

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { WalletSelector } from '@/components/WalletSelector'
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Wallet, Category } from '@/types'

interface ManualTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  wallets: Wallet[]
  isLoadingWallets?: boolean
}

export function ManualTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  wallets,
  isLoadingWallets = false
}: ManualTransactionDialogProps) {
  // Form state
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
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

  // Set default category when type changes or categories load
  useEffect(() => {
    if (categories.length === 0) return

    const filteredCategories = categories.filter(c => c.type === type)
    if (filteredCategories.length > 0 && !category) {
      setCategory(filteredCategories[0].name)
    } else if (filteredCategories.length > 0) {
      // Check if current category is valid for selected type
      const isValidCategory = filteredCategories.some(c => c.name === category)
      if (!isValidCategory) {
        setCategory(filteredCategories[0].name)
      }
    }
  }, [type, categories])

  // Set default wallet when wallets load
  useEffect(() => {
    if (wallets.length > 0 && !selectedWalletId) {
      const defaultWallet = wallets.find(w => w.is_default)
      setSelectedWalletId(defaultWallet?.id || wallets[0].id)
    }
  }, [wallets, selectedWalletId])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setType('expense')
      setItem('')
      setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setIsSubmitting(false)
      // Reset category to first expense category
      const expenseCategories = categories.filter(c => c.type === 'expense')
      if (expenseCategories.length > 0) {
        setCategory(expenseCategories[0].name)
      }
    }
  }, [open, categories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      const response = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: item.trim(),
          amount: amountNum,
          category,
          date,
          type,
          wallet_id: selectedWalletId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          type === 'income'
            ? `Income ditambahkan: ${item} - Rp ${amountNum.toLocaleString('id-ID')}`
            : `Pengeluaran ditambahkan: ${item} - Rp ${amountNum.toLocaleString('id-ID')}`
        )
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast.error(data.error || 'Gagal menambahkan transaksi')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Terjadi kesalahan saat menambahkan transaksi')
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredCategories = categories.filter(c => c.type === type)
  const walletLabel = type === 'expense' ? 'Bayar pakai apa?' : 'Masuk ke mana?'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi Manual</DialogTitle>
          <DialogDescription>
            Input transaksi {type === 'expense' ? 'pengeluaran' : 'pemasukan'} secara manual
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Transaction Type */}
          <div className="space-y-3">
            <Label>Tipe Transaksi</Label>
            <RadioGroup value={type} onValueChange={(val) => setType(val as 'income' | 'expense')} className="grid grid-cols-2 gap-3">
              <div className="relative">
                <RadioGroupItem
                  value="expense"
                  id="expense"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="expense"
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-muted p-4 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-500/10 transition-all"
                >
                  <ArrowDownCircle className="h-8 w-8 text-red-500" />
                  <span className="font-medium">Pengeluaran</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="income"
                  id="income"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="income"
                  className="flex flex-col items-center gap-2 rounded-lg border-2 border-muted p-4 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10 transition-all"
                >
                  <ArrowUpCircle className="h-8 w-8 text-green-500" />
                  <span className="font-medium">Pemasukan</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="item">Nama Item / Deskripsi</Label>
            <Input
              id="item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              placeholder={type === 'expense' ? 'Contoh: Makan siang' : 'Contoh: Gaji bulanan'}
              required
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah (Rp)</Label>
            <Input
              id="amount"
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
            <Label htmlFor="category">Kategori</Label>
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
                        ? type === 'expense'
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
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
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
            <Label>{walletLabel}</Label>
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
                <>Simpan Transaksi</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { upsertBudgetAction } from '@/app/actions/budget'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Category } from '@/types'
import type { Budget } from '@/lib/budget'

interface AddBudgetDialogProps {
  existingBudgets: Budget[]
  onSuccess: () => void
  variant?: 'button' | 'icon'
}

export function AddBudgetDialog({
  existingBudgets,
  onSuccess,
  variant = 'button',
}: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load categories when dialog opens
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  // Filter available categories (exclude those with existing budgets)
  useEffect(() => {
    if (categories.length > 0) {
      const budgetedCategories = new Set(existingBudgets.map((b) => b.category))
      const available = categories.filter((cat) => !budgetedCategories.has(cat.name))
      setAvailableCategories(available)
    }
  }, [categories, existingBudgets])

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const response = await fetch('/api/categories?type=expense')
      const data = await response.json()

      if (response.ok && data.data) {
        setCategories(data.data)
      } else {
        toast.error('Gagal memuat kategori')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
      toast.error('Terjadi kesalahan saat memuat kategori')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory) {
      toast.error('Pilih kategori terlebih dahulu')
      return
    }

    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }

    try {
      setIsSaving(true)

      const result = await upsertBudgetAction(selectedCategory, parseFloat(limitAmount))

      if (result.success) {
        toast.success(`Budget untuk ${selectedCategory} berhasil dibuat`)
        setOpen(false)
        resetForm()
        onSuccess()
      } else {
        toast.error(result.error || 'Gagal membuat budget')
      }
    } catch (error) {
      console.error('Error creating budget:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setSelectedCategory('')
    setLimitAmount('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {variant === 'icon' ? (
          <Button size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Budget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Buat Budget Baru</DialogTitle>
            <DialogDescription>
              Tetapkan batas pengeluaran untuk kategori pilihan Anda.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Category Select */}
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              {isLoadingCategories ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : availableCategories.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
                  Semua kategori sudah memiliki budget
                </div>
              ) : (
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Amount Input */}
            <div className="grid gap-2">
              <Label htmlFor="amount">Batas Anggaran</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Contoh: 1000000"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                min="0"
                step="1000"
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving ||
                !selectedCategory ||
                !limitAmount ||
                availableCategories.length === 0
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

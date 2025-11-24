'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertBudgetAction, deleteBudgetAction } from '@/app/actions/budget'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Save, Loader2, Target, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Category } from '@/types'
import type { Budget } from '@/lib/budget'

export default function BudgetPage() {
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingCategory, setSavingCategory] = useState<string | null>(null)

  // Budget input state - keyed by category name
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>({})

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      loadData()
    }
  }

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Load expense categories
      const categoriesResponse = await fetch('/api/categories?type=expense')
      const categoriesData = await categoriesResponse.json()

      if (categoriesResponse.ok) {
        setCategories(categoriesData.data || [])
      }

      // Load existing budgets
      const budgetsResponse = await fetch('/api/budget')
      const budgetsData = await budgetsResponse.json()

      if (budgetsResponse.ok && budgetsData.budgets) {
        setBudgets(budgetsData.budgets)

        // Pre-fill budget inputs with existing values
        const inputs: Record<string, string> = {}
        budgetsData.budgets.forEach((budget: Budget) => {
          inputs[budget.category] = budget.limit_amount.toString()
        })
        setBudgetInputs(inputs)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (category: string, value: string) => {
    // Allow empty or valid numbers only
    if (value === '' || !isNaN(Number(value))) {
      setBudgetInputs((prev) => ({
        ...prev,
        [category]: value,
      }))
    }
  }

  const handleSaveBudget = async (category: string) => {
    const inputValue = budgetInputs[category]

    if (!inputValue || inputValue.trim() === '') {
      toast.error('Masukkan jumlah anggaran')
      return
    }

    const limitAmount = parseFloat(inputValue)

    if (isNaN(limitAmount) || limitAmount < 0) {
      toast.error('Jumlah anggaran harus berupa angka positif')
      return
    }

    try {
      setSavingCategory(category)

      const result = await upsertBudgetAction(category, limitAmount)

      if (result.success) {
        toast.success(`Anggaran untuk ${category} berhasil disimpan`)
        // Reload data to get updated budgets
        loadData()
      } else {
        toast.error(result.error || 'Gagal menyimpan anggaran')
      }
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setSavingCategory(null)
    }
  }

  const handleDeleteClick = (category: string) => {
    setCategoryToDelete(category)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return

    try {
      setIsDeleting(true)

      const result = await deleteBudgetAction(categoryToDelete)

      if (result.success) {
        toast.success(`Anggaran untuk ${categoryToDelete} berhasil dihapus`)
        // Clear input and reload data
        setBudgetInputs((prev) => {
          const newInputs = { ...prev }
          delete newInputs[categoryToDelete]
          return newInputs
        })
        loadData()
      } else {
        toast.error(result.error || 'Gagal menghapus anggaran')
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const hasBudget = (category: string) => {
    return budgets.some((b) => b.category === category)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center pb-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Anggaran Bulanan
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Atur batas pengeluaran per kategori
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex gap-3">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Cara Kerja Anggaran
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Tetapkan batas pengeluaran untuk setiap kategori. Sistem akan memantau
                pengeluaran Anda dan memberi tahu jika mendekati atau melebihi batas.
              </p>
            </div>
          </div>
        </Card>

        {/* Budget Settings */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Kategori Pengeluaran
          </h2>

          {categories.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada kategori pengeluaran
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const isSaving = savingCategory === category.name
                const hasExistingBudget = hasBudget(category.name)

                return (
                  <Card key={category.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </h3>
                          {hasExistingBudget && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Anggaran sudah diatur
                            </p>
                          )}
                        </div>
                        {hasExistingBudget && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(category.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Contoh: 1000000"
                            value={budgetInputs[category.name] || ''}
                            onChange={(e) =>
                              handleInputChange(category.name, e.target.value)
                            }
                            className="w-full"
                            min="0"
                            step="1000"
                          />
                        </div>
                        <Button
                          onClick={() => handleSaveBudget(category.name)}
                          disabled={
                            isSaving ||
                            !budgetInputs[category.name] ||
                            budgetInputs[category.name].trim() === ''
                          }
                          className="shrink-0"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Menyimpan
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              {hasExistingBudget ? 'Update' : 'Set'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggaran</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus anggaran untuk kategori{' '}
              <strong>{categoryToDelete}</strong>? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </div>
  )
}

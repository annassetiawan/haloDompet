'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
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
import { AlertTriangle, CheckCircle2, Trash2, Loader2, Edit } from 'lucide-react'
import { useState } from 'react'
import { deleteBudgetAction } from '@/app/actions/budget'
import { toast } from 'sonner'
import type { BudgetSummary } from '@/lib/budget'

interface BudgetCardProps {
  budget: BudgetSummary
  onDelete: () => void
}

// Icon mapping for common categories
const categoryIcons: Record<string, string> = {
  Makanan: '🍔',
  Minuman: '☕',
  Transport: '🚗',
  Belanja: '🛒',
  Hiburan: '🎬',
  Kesehatan: '🏥',
  Pendidikan: '📚',
  Tagihan: '📄',
  Olahraga: '⚽',
  Lainnya: '📦',
}

export function BudgetCard({ budget, onDelete }: BudgetCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const icon = categoryIcons[budget.category] || '📦'
  const percentage = Math.min(budget.percentage_used, 100)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 100) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
    if (percentage >= 80) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
    return <CheckCircle2 className="h-5 w-5 text-green-500" />
  }

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Over Budget!'
    if (percentage >= 80) return 'Hampir Habis'
    return 'Aman'
  }

  const getStatusTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400'
    if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true)

      const result = await deleteBudgetAction(budget.category)

      if (result.success) {
        toast.success(`Budget ${budget.category} berhasil dihapus`)
        onDelete()
      } else {
        toast.error(result.error || 'Gagal menghapus budget')
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Terjadi kesalahan')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <Card className="p-5 hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {budget.category}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {getStatusIcon(budget.percentage_used)}
                  <span
                    className={`text-xs font-medium ${getStatusTextColor(
                      budget.percentage_used
                    )}`}
                  >
                    {getStatusText(budget.percentage_used)}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 -mr-2 -mt-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Section */}
          <div className="space-y-2">
            <Progress
              value={percentage}
              className={`h-3 ${
                budget.percentage_used >= 100
                  ? 'bg-red-100 dark:bg-red-900/20'
                  : budget.percentage_used >= 80
                  ? 'bg-yellow-100 dark:bg-yellow-900/20'
                  : 'bg-green-100 dark:bg-green-900/20'
              }`}
            >
              <div
                className={`h-full transition-all rounded-full ${getProgressColor(
                  budget.percentage_used
                )}`}
                style={{ width: `${percentage}%` }}
              />
            </Progress>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Terpakai</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(budget.spent_amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-400">Limit</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(budget.limit_amount)}
                </p>
              </div>
            </div>

            {/* Percentage Badge */}
            <div className="flex justify-center">
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  budget.percentage_used >= 100
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : budget.percentage_used >= 80
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {budget.percentage_used.toFixed(1)}% digunakan
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Budget {budget.category}?</AlertDialogTitle>
            <AlertDialogDescription>
              Budget ini akan dihapus permanen. Data pengeluaran Anda tidak akan terhapus,
              hanya batas anggarannya saja.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
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
    </>
  )
}

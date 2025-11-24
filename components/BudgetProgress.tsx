'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { BudgetSummary } from '@/lib/budget'

interface BudgetProgressProps {
  budgets: BudgetSummary[]
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

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (!budgets || budgets.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-3">
          <Target className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Belum Ada Anggaran
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Mulai pantau pengeluaran dengan mengatur anggaran bulanan
            </p>
          </div>
          <Link href="/budget">
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Atur Anggaran
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Status Anggaran Bulan Ini
          </h2>
        </div>
        <Link href="/budget">
          <Button variant="ghost" size="sm">
            Kelola
          </Button>
        </Link>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {budgets.map((budget) => {
          const icon = categoryIcons[budget.category] || '📦'
          const percentage = Math.min(budget.percentage_used, 100)

          return (
            <Card key={budget.category} className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {budget.category}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
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
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <Progress
                  value={percentage}
                  className={`h-2 ${
                    budget.percentage_used >= 100
                      ? 'bg-red-100 dark:bg-red-900/20'
                      : budget.percentage_used >= 80
                      ? 'bg-yellow-100 dark:bg-yellow-900/20'
                      : 'bg-green-100 dark:bg-green-900/20'
                  }`}
                >
                  <div
                    className={`h-full transition-all ${getProgressColor(
                      budget.percentage_used
                    )}`}
                    style={{ width: `${percentage}%` }}
                  />
                </Progress>

                {/* Amount Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(budget.spent_amount)} terpakai
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {budget.percentage_used.toFixed(1)}%
                  </span>
                </div>

                {/* Limit Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Dari {formatCurrency(budget.limit_amount)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

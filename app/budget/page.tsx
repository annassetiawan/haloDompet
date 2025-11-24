'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AddBudgetDialog } from '@/components/budget/AddBudgetDialog'
import { BudgetCard } from '@/components/budget/BudgetCard'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Loader2, Target, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { Budget, BudgetSummary } from '@/lib/budget'

export default function BudgetPage() {
  const [user, setUser] = useState<User | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

      // Load both budgets list and summary in parallel
      const [budgetsResponse, summaryResponse] = await Promise.all([
        fetch('/api/budget'),
        fetch('/api/budget/summary'),
      ])

      const budgetsData = await budgetsResponse.json()
      const summaryData = await summaryResponse.json()

      if (budgetsResponse.ok && budgetsData.budgets) {
        setBudgets(budgetsData.budgets)
      }

      if (summaryResponse.ok && summaryData.budgets) {
        setBudgetSummary(summaryData.budgets)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Gagal memuat data budget')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBudgetSuccess = () => {
    loadData()
  }

  const handleBudgetDelete = () => {
    loadData()
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
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
                {budgets.length === 0
                  ? 'Belum ada budget aktif'
                  : `${budgets.length} budget aktif`}
              </p>
            </div>
          </div>
          {budgets.length > 0 && (
            <AddBudgetDialog
              existingBudgets={budgets}
              onSuccess={handleBudgetSuccess}
              variant="icon"
            />
          )}
        </div>

        {/* Main Content */}
        {budgets.length === 0 ? (
          // Empty State
          <Card className="p-12">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Wallet className="h-24 w-24 text-gray-300 dark:text-gray-600" />
                  <Target className="h-10 w-10 text-emerald-500 absolute -bottom-2 -right-2" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Belum Ada Anggaran Aktif
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Mulai kelola keuangan Anda dengan lebih baik. Buat budget untuk kategori
                  pengeluaran dan pantau pemakaiannya setiap bulan.
                </p>
              </div>
              <div className="pt-4">
                <AddBudgetDialog
                  existingBudgets={budgets}
                  onSuccess={handleBudgetSuccess}
                />
              </div>
              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          1
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Pilih Kategori
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-10">
                      Tentukan kategori pengeluaran yang ingin dikontrol
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                          2
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Set Limit
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-10">
                      Tetapkan batas maksimal pengeluaran
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">
                          3
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Pantau Progres
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-10">
                      Lihat pemakaian budget secara real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          // Budget Cards Grid
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgetSummary.map((budget) => (
              <BudgetCard
                key={budget.category}
                budget={budget}
                onDelete={handleBudgetDelete}
              />
            ))}
          </div>
        )}

        {/* Info Card - Only show when budgets exist */}
        {budgets.length > 0 && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Tips Mengelola Budget
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Budget dihitung ulang setiap awal bulan. Pastikan untuk review dan
                  sesuaikan limit Anda sesuai kebutuhan.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

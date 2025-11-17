"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingDown, Calendar, Tag, Download } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Transaction } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user, selectedMonth])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
    }
  }

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')

      const response = await fetch(
        `/api/transaction?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalSpent = transactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  )

  const averagePerTransaction = transactions.length > 0
    ? totalSpent / transactions.length
    : 0

  // Group by category
  const categoryStats = transactions.reduce((acc, transaction) => {
    const category = transaction.category
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 }
    }
    acc[category].total += parseFloat(transaction.amount.toString())
    acc[category].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const sortedCategories = Object.entries(categoryStats)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: (data.total / totalSpent) * 100,
    }))
    .sort((a, b) => b.total - a.total)

  // Category emoji mapping
  const categoryEmoji: Record<string, string> = {
    makanan: '🍔',
    minuman: '☕',
    transport: '🚗',
    belanja: '🛒',
    hiburan: '🎬',
    kesehatan: '💊',
    pendidikan: '📚',
    tagihan: '💳',
    lainnya: '📦',
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Tanggal', 'Item', 'Jumlah', 'Kategori', 'Teks Suara']
    const rows = transactions.map(t => [
      format(new Date(t.date), 'dd/MM/yyyy'),
      t.item,
      t.amount.toString(),
      t.category,
      t.voice_text || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `halodompet-${format(selectedMonth, 'yyyy-MM')}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <main className="relative min-h-screen flex flex-col p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-down">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-normal text-foreground">
                Laporan & Analisis
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {format(selectedMonth, 'MMMM yyyy', { locale: idLocale })}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={transactions.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
        </div>

        {/* Month Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2 animate-slide-down">
          {[-2, -1, 0, 1].map(offset => {
            const date = new Date()
            date.setMonth(date.getMonth() + offset)
            const isSelected = format(date, 'yyyy-MM') === format(selectedMonth, 'yyyy-MM')

            return (
              <Button
                key={offset}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMonth(date)}
                className="flex-shrink-0"
              >
                {format(date, 'MMM yyyy', { locale: idLocale })}
              </Button>
            )
          })}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-normal text-foreground mb-2">
              Belum ada transaksi
            </h3>
            <p className="text-sm text-muted-foreground">
              Tidak ada data untuk bulan ini
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-scale-in">
              {/* Total Spent */}
              <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-red-500/10 dark:bg-red-500/20">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  </div>
                  <h3 className="text-sm text-muted-foreground">Total Pengeluaran</h3>
                </div>
                <p className="text-2xl md:text-3xl font-normal text-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(totalSpent)}
                </p>
              </div>

              {/* Transaction Count */}
              <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-sm text-muted-foreground">Jumlah Transaksi</h3>
                </div>
                <p className="text-2xl md:text-3xl font-normal text-foreground">
                  {transactions.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  transaksi bulan ini
                </p>
              </div>

              {/* Average per Transaction */}
              <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                    <Tag className="h-5 w-5 text-green-500" />
                  </div>
                  <h3 className="text-sm text-muted-foreground">Rata-rata</h3>
                </div>
                <p className="text-2xl md:text-3xl font-normal text-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(averagePerTransaction)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  per transaksi
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 animate-slide-up">
              <h2 className="text-lg font-normal text-foreground mb-6">
                Pengeluaran per Kategori
              </h2>

              <div className="space-y-4">
                {sortedCategories.map(({ category, total, count, percentage }) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {categoryEmoji[category.toLowerCase()] || '📦'}
                        </span>
                        <span className="text-sm font-normal text-foreground capitalize">
                          {category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({count} transaksi)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-normal text-foreground">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(total)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

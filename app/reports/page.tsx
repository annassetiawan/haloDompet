"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingDown, Calendar, Tag, Download, BarChart3, TrendingUp, ArrowUp, ArrowDown, Minus, Sparkles, AlertCircle } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Transaction } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Line, LineChart } from 'recharts'

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [previousMonthTransactions, setPreviousMonthTransactions] = useState<Transaction[]>([])
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
      loadPreviousMonthTransactions()
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

  const loadPreviousMonthTransactions = async () => {
    try {
      const prevMonth = new Date(selectedMonth)
      prevMonth.setMonth(prevMonth.getMonth() - 1)

      const startDate = format(startOfMonth(prevMonth), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(prevMonth), 'yyyy-MM-dd')

      const response = await fetch(
        `/api/transaction?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()

      if (response.ok) {
        setPreviousMonthTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error loading previous month transactions:', error)
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

  // Calculate previous month statistics
  const previousTotalSpent = previousMonthTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  )

  const previousAveragePerTransaction = previousMonthTransactions.length > 0
    ? previousTotalSpent / previousMonthTransactions.length
    : 0

  // Calculate month-over-month changes
  const totalSpentChange = previousTotalSpent > 0
    ? ((totalSpent - previousTotalSpent) / previousTotalSpent) * 100
    : 0

  const transactionCountChange = previousMonthTransactions.length > 0
    ? ((transactions.length - previousMonthTransactions.length) / previousMonthTransactions.length) * 100
    : 0

  const averageChange = previousAveragePerTransaction > 0
    ? ((averagePerTransaction - previousAveragePerTransaction) / previousAveragePerTransaction) * 100
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

  // Category color mapping
  const categoryColors: Record<string, string> = {
    makanan: 'hsl(var(--chart-1))',
    minuman: 'hsl(var(--chart-2))',
    transport: 'hsl(var(--chart-3))',
    belanja: 'hsl(var(--chart-4))',
    hiburan: 'hsl(var(--chart-5))',
    kesehatan: 'hsl(220 70% 50%)',
    pendidikan: 'hsl(280 65% 60%)',
    tagihan: 'hsl(340 75% 55%)',
    lainnya: 'hsl(0 0% 50%)',
  }

  // Prepare data for bar chart (top 5 categories)
  const barChartData = sortedCategories.slice(0, 5).map((item) => ({
    category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    amount: item.total,
    fill: categoryColors[item.category.toLowerCase()] || 'hsl(var(--chart-1))',
  }))

  // Prepare data for pie chart (all categories)
  const pieChartData = sortedCategories.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.total,
    fill: categoryColors[item.category.toLowerCase()] || `hsl(var(--chart-${(index % 5) + 1}))`,
    percentage: item.percentage,
  }))

  // Prepare data for line chart (daily spending trend)
  const dailySpending = transactions.reduce((acc, transaction) => {
    const dateKey = format(new Date(transaction.date), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = 0
    }
    acc[dateKey] += parseFloat(transaction.amount.toString())
    return acc
  }, {} as Record<string, number>)

  const lineChartData = Object.entries(dailySpending)
    .map(([date, amount]) => ({
      date: format(new Date(date), 'dd MMM', { locale: idLocale }),
      fullDate: date,
      amount: amount,
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  // Generate smart insights
  const generateInsights = () => {
    const insights: { type: 'info' | 'warning' | 'success'; text: string }[] = []

    if (transactions.length === 0) return insights

    // Insight 1: Top spending category
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0]
      insights.push({
        type: 'info',
        text: `Kategori ${topCategory.category} adalah pengeluaran terbesar Anda (${topCategory.percentage.toFixed(1)}% dari total).`
      })
    }

    // Insight 2: Month-over-month trend
    if (previousTotalSpent > 0) {
      if (totalSpentChange > 20) {
        insights.push({
          type: 'warning',
          text: `Pengeluaran Anda meningkat ${totalSpentChange.toFixed(1)}% dibanding bulan lalu. Pertimbangkan untuk mengurangi pengeluaran.`
        })
      } else if (totalSpentChange < -10) {
        insights.push({
          type: 'success',
          text: `Bagus! Pengeluaran Anda turun ${Math.abs(totalSpentChange).toFixed(1)}% dibanding bulan lalu.`
        })
      }
    }

    // Insight 3: Most expensive transaction
    const mostExpensive = transactions.reduce((max, t) =>
      parseFloat(t.amount.toString()) > parseFloat(max.amount.toString()) ? t : max
    , transactions[0])

    if (mostExpensive) {
      const mostExpensiveAmount = parseFloat(mostExpensive.amount.toString())
      const percentageOfTotal = (mostExpensiveAmount / totalSpent) * 100

      if (percentageOfTotal > 30) {
        insights.push({
          type: 'warning',
          text: `Transaksi terbesar Anda (${mostExpensive.item}) mencapai ${percentageOfTotal.toFixed(1)}% dari total pengeluaran bulan ini.`
        })
      }
    }

    // Insight 4: Average daily spending
    const daysWithTransactions = Object.keys(dailySpending).length
    if (daysWithTransactions > 0) {
      const avgDailySpending = totalSpent / daysWithTransactions
      insights.push({
        type: 'info',
        text: `Rata-rata pengeluaran harian Anda adalah ${new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(avgDailySpending)} (${daysWithTransactions} hari dengan transaksi).`
      })
    }

    // Insight 5: Transaction frequency
    if (transactions.length > previousMonthTransactions.length && previousMonthTransactions.length > 0) {
      const freqChange = transactionCountChange.toFixed(1)
      insights.push({
        type: 'info',
        text: `Frekuensi transaksi Anda meningkat ${freqChange}% bulan ini. Pertimbangkan untuk menggabungkan pembelian.`
      })
    }

    return insights
  }

  const insights = generateInsights()

  // Chart configuration
  const chartConfig = {
    amount: {
      label: 'Jumlah',
    },
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
          <div className="text-center py-16 bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl animate-scale-in">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-normal text-foreground mb-2">
              Belum ada data untuk bulan ini
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {format(selectedMonth, 'MMMM yyyy', { locale: idLocale })} belum memiliki transaksi. Mulai rekam pengeluaran untuk melihat analisis.
            </p>
            <Button onClick={() => router.push('/')} className="gap-2">
              <TrendingDown className="h-4 w-4" />
              Rekam Pengeluaran
            </Button>
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
                {previousTotalSpent > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {totalSpentChange > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-500">
                          +{totalSpentChange.toFixed(1)}% dari bulan lalu
                        </span>
                      </>
                    ) : totalSpentChange < 0 ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">
                          {totalSpentChange.toFixed(1)}% dari bulan lalu
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Sama dengan bulan lalu
                        </span>
                      </>
                    )}
                  </div>
                )}
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
                {previousMonthTransactions.length > 0 ? (
                  <div className="flex items-center gap-1 mt-1">
                    {transactionCountChange > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-500">
                          +{transactionCountChange.toFixed(1)}% dari bulan lalu
                        </span>
                      </>
                    ) : transactionCountChange < 0 ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-500">
                          {transactionCountChange.toFixed(1)}% dari bulan lalu
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Sama dengan bulan lalu
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    transaksi bulan ini
                  </p>
                )}
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
                {previousAveragePerTransaction > 0 ? (
                  <div className="flex items-center gap-1 mt-1">
                    {averageChange > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3 text-orange-500" />
                        <span className="text-xs text-orange-500">
                          +{averageChange.toFixed(1)}% dari bulan lalu
                        </span>
                      </>
                    ) : averageChange < 0 ? (
                      <>
                        <ArrowDown className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-500">
                          {averageChange.toFixed(1)}% dari bulan lalu
                        </span>
                      </>
                    ) : (
                      <>
                        <Minus className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Sama dengan bulan lalu
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    per transaksi
                  </p>
                )}
              </div>
            </div>

            {/* Bar Chart - Top Categories */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-normal text-foreground">
                  Top 5 Kategori Pengeluaran
                </h2>
              </div>

              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('id-ID', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) =>
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(value as number)
                        }
                      />
                    }
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>

            {/* Pie Chart - Category Distribution */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-normal text-foreground">
                  Distribusi Kategori
                </h2>
              </div>

              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any, name: any) => (
                          <>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium">{name}</span>
                              <span className="text-muted-foreground">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                }).format(value as number)}
                              </span>
                            </div>
                          </>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) => {
                      const entry = pieChartData.find(e => e.name === props.name)
                      return entry ? `${props.name} (${entry.percentage.toFixed(1)}%)` : props.name
                    }}
                    labelLine={true}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Line Chart - Daily Spending Trend */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-lg font-normal text-foreground">
                  Tren Pengeluaran Harian
                </h2>
              </div>

              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) =>
                      new Intl.NumberFormat('id-ID', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)
                    }
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value: any) =>
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(value as number)
                        }
                      />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>

            {/* Smart Insights */}
            {insights.length > 0 && (
              <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                  </div>
                  <h2 className="text-lg font-normal text-foreground">
                    Insights Cerdas
                  </h2>
                </div>

                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-xl border ${
                        insight.type === 'warning'
                          ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10'
                          : insight.type === 'success'
                          ? 'bg-green-500/5 border-green-500/20 dark:bg-green-500/10'
                          : 'bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10'
                      }`}
                    >
                      {insight.type === 'warning' ? (
                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      ) : insight.type === 'success' ? (
                        <TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Sparkles className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-foreground leading-relaxed">
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

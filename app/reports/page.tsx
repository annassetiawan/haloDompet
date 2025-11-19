"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingDown, Calendar, Tag, Download, BarChart3, TrendingUp, ArrowUp, ArrowDown, Minus, Sparkles, AlertCircle, Wallet } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { Transaction } from '@/types'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Legend, Line, LineChart, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

  // Calculate statistics - EXPENSE transactions
  const expenseTransactions = transactions.filter(t => t.type !== 'income')
  const previousExpenseTransactions = previousMonthTransactions.filter(t => t.type !== 'income')

  const totalSpent = expenseTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  )

  const averagePerTransaction = expenseTransactions.length > 0
    ? totalSpent / expenseTransactions.length
    : 0

  // Calculate previous month expense statistics
  const previousTotalSpent = previousExpenseTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  )

  const previousAveragePerTransaction = previousExpenseTransactions.length > 0
    ? previousTotalSpent / previousExpenseTransactions.length
    : 0

  // Calculate statistics - INCOME transactions
  const incomeTransactions = transactions.filter(t => t.type === 'income')
  const previousIncomeTransactions = previousMonthTransactions.filter(t => t.type === 'income')

  const totalIncome = incomeTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  )

  // Calculate previous month income statistics
  const previousTotalIncome = previousIncomeTransactions.reduce(
    (sum, t) => sum + parseFloat(t.amount.toString()),
    0
  )

  // Calculate NET BALANCE (Cash Flow)
  const netBalance = totalIncome - totalSpent
  const previousNetBalance = previousTotalIncome - previousTotalSpent

  // Calculate month-over-month changes
  const totalSpentChange = previousTotalSpent > 0
    ? ((totalSpent - previousTotalSpent) / previousTotalSpent) * 100
    : 0

  const totalIncomeChange = previousTotalIncome > 0
    ? ((totalIncome - previousTotalIncome) / previousTotalIncome) * 100
    : 0

  const netBalanceChange = previousNetBalance !== 0
    ? ((netBalance - previousNetBalance) / Math.abs(previousNetBalance)) * 100
    : 0

  const transactionCountChange = previousExpenseTransactions.length > 0
    ? ((expenseTransactions.length - previousExpenseTransactions.length) / previousExpenseTransactions.length) * 100
    : 0

  const averageChange = previousAveragePerTransaction > 0
    ? ((averagePerTransaction - previousAveragePerTransaction) / previousAveragePerTransaction) * 100
    : 0

  // Group by category - ONLY for EXPENSE transactions
  const categoryStats = expenseTransactions.reduce((acc, transaction) => {
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

  // Chart colors - actual HSL values from CSS variables
  // Light mode colors from globals.css
  const chartColors = {
    1: 'hsl(12 76% 61%)',   // --chart-1
    2: 'hsl(173 58% 39%)',  // --chart-2
    3: 'hsl(197 37% 24%)',  // --chart-3
    4: 'hsl(43 74% 66%)',   // --chart-4
    5: 'hsl(27 87% 67%)',   // --chart-5
  }

  // Category color mapping (Shadcn pattern)
  const categoryColors: Record<string, string> = {
    makanan: chartColors[1],
    minuman: chartColors[2],
    transport: chartColors[3],
    belanja: chartColors[4],
    hiburan: chartColors[5],
    kesehatan: chartColors[1],
    pendidikan: chartColors[2],
    tagihan: chartColors[3],
    lainnya: chartColors[4],
  }

  // Prepare data for bar chart - Income vs Expense Overview
  const incomeVsExpenseData = [
    {
      name: 'Pemasukan',
      amount: totalIncome,
      fill: 'hsl(142 76% 36%)', // green
    },
    {
      name: 'Pengeluaran',
      amount: totalSpent,
      fill: 'hsl(0 84% 60%)', // red
    },
    {
      name: 'Sisa Uang',
      amount: Math.abs(netBalance),
      fill: netBalance >= 0 ? 'hsl(221 83% 53%)' : 'hsl(25 95% 53%)', // blue if positive, orange if negative
    },
  ]

  // Prepare data for category bar chart (top 5 categories)
  const barChartData = sortedCategories.slice(0, 5).map((item) => ({
    category: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    amount: item.total,
    fill: categoryColors[item.category.toLowerCase()] || chartColors[1],
  }))

  // Prepare data for pie chart (all categories)
  const pieChartData = sortedCategories.map((item, index) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.total,
    fill: categoryColors[item.category.toLowerCase()] || chartColors[((index % 5) + 1) as 1 | 2 | 3 | 4 | 5],
    percentage: item.percentage,
  }))

  // Prepare data for line chart (daily spending trend) - ONLY for EXPENSE transactions
  const dailySpending = expenseTransactions.reduce((acc, transaction) => {
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

    // Insight 1: Financial Health - Net Balance Analysis
    if (totalIncome > 0 || totalSpent > 0) {
      if (netBalance > 0) {
        const savingsRate = (netBalance / totalIncome) * 100
        if (savingsRate > 20) {
          insights.push({
            type: 'success',
            text: `Hebat! Anda berhasil menyisihkan ${savingsRate.toFixed(1)}% dari pemasukan bulan ini (${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(netBalance)}).`
          })
        } else if (savingsRate > 0) {
          insights.push({
            type: 'success',
            text: `Bagus! Anda masih memiliki surplus ${new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(netBalance)} bulan ini.`
          })
        }
      } else if (netBalance < 0) {
        insights.push({
          type: 'warning',
          text: `Awas! Pengeluaran Anda melebihi pemasukan sebesar ${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(Math.abs(netBalance))}. Pertimbangkan untuk mengurangi pengeluaran.`
        })
      } else {
        insights.push({
          type: 'info',
          text: 'Pemasukan dan pengeluaran Anda seimbang bulan ini. Coba tingkatkan tabungan di bulan depan.'
        })
      }
    }

    // Insight 2: Top spending category (only if there are expenses)
    if (expenseTransactions.length > 0 && sortedCategories.length > 0) {
      const topCategory = sortedCategories[0]
      insights.push({
        type: 'info',
        text: `Kategori ${topCategory.category} adalah pengeluaran terbesar Anda (${topCategory.percentage.toFixed(1)}% dari total).`
      })
    }

    // Insight 3: Month-over-month income trend
    if (previousTotalIncome > 0 && totalIncomeChange !== 0) {
      if (totalIncomeChange > 10) {
        insights.push({
          type: 'success',
          text: `Pemasukan Anda meningkat ${totalIncomeChange.toFixed(1)}% dibanding bulan lalu. Pertahankan!`
        })
      } else if (totalIncomeChange < -10) {
        insights.push({
          type: 'warning',
          text: `Pemasukan Anda turun ${Math.abs(totalIncomeChange).toFixed(1)}% dibanding bulan lalu.`
        })
      }
    }

    // Insight 4: Month-over-month expense trend
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

    // Insight 5: Most expensive transaction (EXPENSE only)
    if (expenseTransactions.length > 0) {
      const mostExpensive = expenseTransactions.reduce((max, t) =>
        parseFloat(t.amount.toString()) > parseFloat(max.amount.toString()) ? t : max
        , expenseTransactions[0])

      if (mostExpensive && totalSpent > 0) {
        const mostExpensiveAmount = parseFloat(mostExpensive.amount.toString())
        const percentageOfTotal = (mostExpensiveAmount / totalSpent) * 100

        if (percentageOfTotal > 30) {
          insights.push({
            type: 'warning',
            text: `Transaksi terbesar Anda (${mostExpensive.item}) mencapai ${percentageOfTotal.toFixed(1)}% dari total pengeluaran bulan ini.`
          })
        }
      }
    }

    return insights
  }

  const insights = generateInsights()

  // Chart configurations using Shadcn pattern

  // Income vs Expense Chart Config
  const incomeVsExpenseConfig = {
    pemasukan: {
      label: 'Pemasukan',
      color: 'hsl(142 76% 36%)',
    },
    pengeluaran: {
      label: 'Pengeluaran',
      color: 'hsl(0 84% 60%)',
    },
    sisa_uang: {
      label: 'Sisa Uang',
      color: netBalance >= 0 ? 'hsl(221 83% 53%)' : 'hsl(25 95% 53%)',
    },
  } satisfies ChartConfig;

  // Bar Chart Config - Top 5 Categories
  const barChartConfig = barChartData.reduce((acc, item, index) => {
    const key = item.category.toLowerCase().replace(/\s+/g, '_');
    acc[key] = {
      label: item.category,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);

  // Pie Chart Config - All Categories
  const pieChartConfig = pieChartData.reduce((acc, item, index) => {
    const key = item.name.toLowerCase().replace(/\s+/g, '_');
    acc[key] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);

  // Line Chart Config - Daily Spending
  const lineChartConfig = {
    amount: {
      label: 'Pengeluaran',
      color: chartColors[1],
    },
  } satisfies ChartConfig;

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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="charts">Grafik</TabsTrigger>
              <TabsTrigger value="details">Detail</TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview - Summary Cards + Key Insights */}
            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Total Income */}
                <div className="bg-card dark:bg-card backdrop-blur-sm border-2 border-border rounded-2xl p-4 md:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <h3 className="text-sm text-muted-foreground">Total Pemasukan</h3>
                  </div>
                  <p className="text-2xl md:text-3xl font-normal text-foreground">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(totalIncome)}
                  </p>
                  {previousTotalIncome > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {totalIncomeChange > 0 ? (
                        <>
                          <ArrowUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">
                            +{totalIncomeChange.toFixed(1)}% dari bulan lalu
                          </span>
                        </>
                      ) : totalIncomeChange < 0 ? (
                        <>
                          <ArrowDown className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">
                            {totalIncomeChange.toFixed(1)}% dari bulan lalu
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

                {/* Total Spent */}
                <div className="bg-card dark:bg-card backdrop-blur-sm border-2 border-border rounded-2xl p-4 md:p-6 shadow-sm">
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

                {/* Net Balance / Cash Flow */}
                <div className="bg-card dark:bg-card backdrop-blur-sm border-2 border-border rounded-2xl p-4 md:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${netBalance >= 0 ? 'bg-blue-500/10 dark:bg-blue-500/20' : 'bg-orange-500/10 dark:bg-orange-500/20'}`}>
                      <Wallet className={`h-5 w-5 ${netBalance >= 0 ? 'text-blue-500' : 'text-orange-500'}`} />
                    </div>
                    <h3 className="text-sm text-muted-foreground">Sisa Uang</h3>
                  </div>
                  <p className={`text-2xl md:text-3xl font-normal ${netBalance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(netBalance)}
                  </p>
                  {previousNetBalance !== 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {netBalanceChange > 0 ? (
                        <>
                          <ArrowUp className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-500">
                            +{netBalanceChange.toFixed(1)}% dari bulan lalu
                          </span>
                        </>
                      ) : netBalanceChange < 0 ? (
                        <>
                          <ArrowDown className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">
                            {netBalanceChange.toFixed(1)}% dari bulan lalu
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
                  {netBalance >= 0 ? (
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1 font-medium">
                      ✓ Surplus
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1 font-medium">
                      ⚠ Defisit
                    </p>
                  )}
                </div>
              </div>

              {/* Key Insights - Top 3 */}
              {insights.length > 0 && (
                <div className="bg-card dark:bg-card backdrop-blur-sm border-2 border-border rounded-2xl p-4 md:p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                      <Sparkles className="h-5 w-5 text-purple-500" />
                    </div>
                    <h2 className="text-base md:text-lg font-normal text-foreground">
                      Insights Utama
                    </h2>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    {insights.slice(0, 3).map((insight, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-xl border ${insight.type === 'warning'
                          ? 'bg-amber-500/5 border-amber-500/20 dark:bg-amber-500/10'
                          : insight.type === 'success'
                            ? 'bg-green-500/5 border-green-500/20 dark:bg-green-500/10'
                            : 'bg-blue-500/5 border-blue-500/20 dark:bg-blue-500/10'
                          }`}
                      >
                        {insight.type === 'warning' ? (
                          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        ) : insight.type === 'success' ? (
                          <TrendingDown className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-xs md:text-sm text-foreground leading-relaxed">
                          {insight.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab 2: Charts - All Visualizations */}
            <TabsContent value="charts" className="w-full space-y-3 md:space-y-4">
              {/* Income vs Expense Overview Chart */}
              <div className="w-full bg-card border border-border rounded-xl shadow-sm">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <Wallet className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        Ringkasan Keuangan Bulanan
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Perbandingan pemasukan, pengeluaran, dan sisa uang
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content - Chart */}
                <div className="p-4 md:p-6 w-full">
                  <div className="w-full h-[250px] md:h-[350px]">
                    <ChartContainer config={incomeVsExpenseConfig} className="h-full w-full aspect-auto min-w-[100%]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                          <XAxis
                            dataKey="name"
                            height={30}
                            tickMargin={10}
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
                                labelFormatter={(value: any) => value}
                                formatter={(value: any, name: any) => [
                                  new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                  }).format(value as number),
                                  'Total'
                                ]}
                              />
                            }
                          />
                          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                            {incomeVsExpenseData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    <span>
                      {netBalance >= 0
                        ? `Surplus ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(netBalance)} - Keuangan sehat!`
                        : `Defisit ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Math.abs(netBalance))} - Kurangi pengeluaran!`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Bar Chart - Top Categories */}
              <div className="w-full bg-card border border-border rounded-xl shadow-sm">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        Top 5 Kategori Pengeluaran
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Kategori dengan pengeluaran tertinggi bulan ini
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content - Chart */}
                <div className="p-4 md:p-6 w-full">
                  <div className="w-full h-[250px] md:h-[350px]">
                    <ChartContainer config={barChartConfig} className="h-full w-full aspect-auto min-w-[100%]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                          <XAxis
                            dataKey="category"
                            height={30}
                            tickMargin={10}
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
                                labelFormatter={(value: any) => value}
                                formatter={(value: any, name: any) => [
                                  new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                  }).format(value as number),
                                  'Total'
                                ]}
                              />
                            }
                          />
                          <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                            {barChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>Showing top 5 spending categories this month</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart - Category Distribution */}
              <div className="w-full bg-card border border-border rounded-xl shadow-sm">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        Distribusi Kategori
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Perbandingan pengeluaran antar kategori
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content - Chart */}
                <div className="p-4 md:p-6 w-full">
                  <div className="w-full h-[350px]">
                    <ChartContainer config={pieChartConfig} className="h-full w-full aspect-auto min-w-[100%]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                labelFormatter={(value: any) => value}
                                formatter={(value: any, name: any) => [
                                  new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                  }).format(value as number),
                                  name
                                ]}
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
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Total spending breakdown by category</span>
                </div>
              </div>

              {/* Line Chart - Daily Spending Trend */}
              <div className="w-full bg-card border border-border rounded-xl shadow-sm">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        Tren Pengeluaran Harian
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Grafik pengeluaran per hari bulan ini
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content - Chart */}
                <div className="p-4 md:p-6 w-full">
                  <div className="w-full h-[250px] md:h-[350px]">
                    <ChartContainer config={lineChartConfig} className="h-full w-full aspect-auto min-w-[100%]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                          <XAxis
                            dataKey="date"
                            height={30}
                            tickMargin={10}
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
                                labelFormatter={(value: any) => value}
                                formatter={(value: any, name: any) => [
                                  new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                  }).format(value as number),
                                  'Pengeluaran'
                                ]}
                              />
                            }
                          />
                          <Line
                            type="monotone"
                            dataKey="amount"
                            stroke={chartColors[1]}
                            strokeWidth={2}
                            dot={{ fill: chartColors[1], r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Daily spending pattern for current month</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Details - Category Breakdown */}
            <TabsContent value="details" className="space-y-3 md:space-y-4">
              {/* Category Breakdown */}
              <div className="bg-card dark:bg-card backdrop-blur-sm border-2 border-border rounded-2xl p-4 md:p-6 shadow-sm">
                <h2 className="text-base md:text-lg font-normal text-foreground mb-4 md:mb-6">
                  Pengeluaran per Kategori
                </h2>

                <div className="space-y-3 md:space-y-4">
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}

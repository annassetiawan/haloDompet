"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TransactionCard } from '@/components/TransactionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Search, Filter, Loader2 } from 'lucide-react'
import type { Transaction } from '@/types'
import type { User } from '@supabase/supabase-js'

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      loadTransactions()
    }
  }

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/transaction')
      const data = await response.json()

      if (response.ok) {
        setTransactions(data.transactions)
      } else {
        console.error('Error loading transactions:', data.error)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique categories from transactions
  const categories = Array.from(
    new Set(transactions.map(t => t.category))
  ).sort()

  // Filter transactions based on search and category
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' ||
      transaction.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.voice_text?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === '' ||
      transaction.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(transaction)
    return groups
  }, {} as Record<string, Transaction[]>)

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
                Riwayat Transaksi
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredTransactions.length} dari {transactions.length} transaksi
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3 animate-slide-down">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="flex-shrink-0"
              >
                Semua
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex-shrink-0 capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Transaction List */}
        <div className="space-y-6 animate-scale-in">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-lg font-normal text-foreground mb-2">
                {searchQuery || selectedCategory
                  ? 'Tidak ada transaksi yang cocok'
                  : 'Belum ada transaksi'
                }
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory
                  ? 'Coba ubah filter pencarian Anda'
                  : 'Mulai rekam pengeluaran Anda dengan suara'}
              </p>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
              <div key={date} className="space-y-3">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 px-4 rounded-lg border border-border/30">
                  <h2 className="text-sm font-normal text-muted-foreground">
                    {date}
                  </h2>
                </div>

                {/* Transactions for this date */}
                <div className="space-y-2">
                  {dateTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      onClick={() => {
                        // TODO: Open transaction detail modal
                        console.log('Transaction clicked:', transaction)
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}

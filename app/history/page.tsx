"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TransactionCard } from '@/components/TransactionCard'
import { TransactionListSkeleton } from '@/components/TransactionSkeleton'
import { EditTransactionDialog } from '@/components/EditTransactionDialog'
import { AppNavigation } from '@/components/AppNavigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { ArrowLeft, Search, Filter, Mic } from 'lucide-react'
import { toast } from 'sonner'
import type { Transaction, Wallet } from '@/types'
import type { User } from '@supabase/supabase-js'
import { useScanReceipt } from '@/hooks/useScanReceiptHook'

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingWallets, setIsLoadingWallets] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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
      loadWallets()
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

  const loadWallets = async () => {
    try {
      setIsLoadingWallets(true)
      const response = await fetch('/api/wallets')
      const data = await response.json()

      if (response.ok) {
        setWallets(data.wallets || [])
      } else {
        console.error('Error loading wallets:', data.error)
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
    } finally {
      setIsLoadingWallets(false)
    }
  }

  // ... inside HistoryPage component
  const handleEditSuccess = () => {
    loadTransactions()
    loadWallets()
  }

  // Hook for scan receipt
  const { handleScanClick, ScanDialog } = useScanReceipt({
    onSuccess: () => {
      loadTransactions()
      loadWallets()
    },
    wallets,
  })

  // Restore Event Handlers
  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction)
    setIsEditDialogOpen(true)
  }

  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/transaction?id=${transactionToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Transaksi berhasil dihapus!')
        setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id))
        setTransactionToDelete(null)
      } else {
        throw new Error(data.error || 'Gagal menghapus transaksi')
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
      toast.error('Gagal menghapus transaksi. Silakan coba lagi.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Get unique categories
  const categories = Array.from(
    new Set(transactions.map(t => t.category))
  ).sort()

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' ||
      transaction.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (transaction.voice_text?.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === '' ||
      transaction.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Group transactions
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
    <main className="relative min-h-screen flex flex-col p-4 md:p-8 pb-20 md:pb-8 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-down">
          {/* ... existing header code ... */}
        </div>

        {/* ... existing Search & Filter code ... */}

        {/* ... existing Transaction List code ... */}
        <div className="space-y-6 animate-scale-in">
          {isLoading ? (
            <TransactionListSkeleton count={8} />
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16 bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl">
              <div className="text-6xl mb-4">
                {searchQuery || selectedCategory ? '🔍' : '📭'}
              </div>
              <h3 className="text-xl font-normal text-foreground mb-2">
                {searchQuery || selectedCategory
                  ? 'Tidak ada transaksi yang cocok'
                  : 'Belum ada transaksi'
                }
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery || selectedCategory
                  ? 'Coba ubah filter atau kata kunci pencarian Anda untuk menemukan transaksi yang sesuai.'
                  : 'Anda belum memiliki riwayat transaksi. Mulai rekam pengeluaran dengan suara untuk melacak keuangan Anda.'}
              </p>
              {!searchQuery && !selectedCategory && (
                <Button onClick={() => router.push('/')} className="gap-2">
                  <Mic className="h-4 w-4" />
                  Mulai Rekam
                </Button>
              )}
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
                      showEdit={true}
                      showDelete={true}
                      onEdit={() => handleEditTransaction(transaction)}
                      onDelete={() => setTransactionToDelete(transaction)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus transaksi &quot;{transactionToDelete?.item}&quot; sebesar{' '}
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(parseFloat(transactionToDelete?.amount?.toString() || '0'))}?
              <br />
              <br />
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransaction}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        transaction={transactionToEdit}
        wallets={wallets}
        isLoadingWallets={isLoadingWallets}
        onSuccess={handleEditSuccess}
      />
      
      {/* Scan Dialog Hook */}
      {ScanDialog()}

      {/* Bottom Navigation - Mobile Only */}
      <AppNavigation onScanClick={handleScanClick} />
    </main>
  )
}

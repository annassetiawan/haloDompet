'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { WalletCarousel } from '@/components/WalletCarousel'
import { WalletSelector } from '@/components/WalletSelector'
import { AddWalletDialog } from '@/components/AddWalletDialog'
import { EditWalletDialog } from '@/components/EditWalletDialog'
import { ManualTransactionDialog } from '@/components/ManualTransactionDialog'
import { TransactionCard } from '@/components/TransactionCard'
import { TrialWarningBanner } from '@/components/trial-warning-banner'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { RecordButton } from '@/components/RecordButton'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Settings,
  LogOut,
  History,
  ArrowRight,
  BarChart3,
  Sparkles,
  CheckCircle2,
  XCircle,
  PlusCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile, Transaction, Wallet } from '@/types'

// Konstanta untuk status default agar konsisten
const IDLE_STATUS = 'Coba: "Beli Kopi 25 ribu di Fore atau Dapat gaji 5 juta"'

interface DashboardClientProps {
  initialUser: User
  initialUserProfile: UserProfile
  initialWallets: Wallet[]
  initialTotalBalance: number
  initialGrowthPercentage: number
  initialTransactions: Transaction[]
}

export function DashboardClient({
  initialUser,
  initialUserProfile,
  initialWallets,
  initialTotalBalance,
  initialGrowthPercentage,
  initialTransactions,
}: DashboardClientProps) {
  // State Management
  const [user] = useState<User>(initialUser)
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile)
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets)
  const [totalBalance, setTotalBalance] = useState<number>(initialTotalBalance)
  const [growthPercentage, setGrowthPercentage] = useState<number>(initialGrowthPercentage)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(initialTransactions)

  // Ubah initial state menggunakan IDLE_STATUS
  const [status, setStatus] = useState(IDLE_STATUS)
  const [webhookUrl, setWebhookUrl] = useState(
    initialUserProfile?.mode === 'webhook' && initialUserProfile?.webhook_url
      ? initialUserProfile.webhook_url
      : ''
  )
  const [isProcessing, setIsProcessing] = useState(false)

  // Review dialog state
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [editedTranscript, setEditedTranscript] = useState('')

  // Wallet management state
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)

  // Manual transaction dialog state
  const [isManualTransactionOpen, setIsManualTransactionOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()

      if (response.ok) {
        setUserProfile(data.user)
        if (data.user.mode === 'webhook' && data.user.webhook_url) {
          setWebhookUrl(data.user.webhook_url)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadWallets = async () => {
    try {
      const response = await fetch('/api/wallet')
      const data = await response.json()

      if (response.ok) {
        setWallets(data.wallets)
        setTotalBalance(data.totalBalance)
        setGrowthPercentage(data.growthPercentage || 0)
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
    }
  }

  const loadRecentTransactions = async () => {
    try {
      const response = await fetch('/api/transaction?limit=5')
      const data = await response.json()

      if (response.ok) {
        setRecentTransactions(data.transactions)
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleTranscript = async (transcript: string) => {
    setIsProcessing(true)
    setStatus('Memproses hasil rekaman...')

    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsProcessing(false)
    setEditedTranscript(transcript)
    setIsReviewOpen(true)
    // Kembali ke IDLE_STATUS saat dialog terbuka (di background)
    setStatus(IDLE_STATUS)
  }

  const handleStatusChange = (newStatus: string) => {
    // Jika component recorder mengirim 'Siap merekam' atau string kosong,
    // kita paksa gunakan IDLE_STATUS kita yang baru.
    if (
      newStatus === 'Siap merekam' ||
      newStatus === '' ||
      newStatus === 'Stop'
    ) {
      setStatus(IDLE_STATUS)
    } else {
      setStatus(newStatus)
    }
  }

  const handleConfirmTranscript = async () => {
    setIsReviewOpen(false)
    await processTranscript(editedTranscript, selectedWalletId)
  }

  const handleCancelTranscript = () => {
    setIsReviewOpen(false)
    setEditedTranscript('')
    setSelectedWalletId(null)
    setStatus(IDLE_STATUS)
  }

  const handleAddWallet = () => {
    setIsAddWalletOpen(true)
  }

  const handleEditWallet = (wallet: Wallet) => {
    setSelectedWallet(wallet)
    setIsEditWalletOpen(true)
  }

  const handleWalletSuccess = () => {
    loadWallets()
  }

  // Helper function to convert technical errors to user-friendly messages
  const getFriendlyErrorMessage = (error: string): string => {
    // Handle missing fields error
    if (error.includes('Missing required fields')) {
      return 'Maaf, sepertinya ada informasi yang kurang lengkap. Coba ucapkan lagi dengan jelas, misalnya: "Beli kopi 25 ribu"'
    }

    // Handle validation errors
    if (error.toLowerCase().includes('validation')) {
      return 'Ada kesalahan format data. Pastikan Anda menyebutkan item dan jumlah dengan jelas'
    }

    // Handle invalid amount
    if (
      error.toLowerCase().includes('amount') ||
      error.toLowerCase().includes('jumlah')
    ) {
      return 'Nominal yang diucapkan tidak valid. Coba sebutkan angka yang jelas, misalnya: "25 ribu" atau "100 ribu"'
    }

    // Handle category errors
    if (
      error.toLowerCase().includes('category') ||
      error.toLowerCase().includes('kategori')
    ) {
      return 'Kategori tidak terdeteksi. Coba ucapkan dengan lebih spesifik, misalnya: "Beli kopi" atau "Bayar parkir"'
    }

    // Handle date errors
    if (
      error.toLowerCase().includes('date') ||
      error.toLowerCase().includes('tanggal')
    ) {
      return 'Tanggal tidak valid. Sistem akan menggunakan tanggal hari ini secara otomatis'
    }

    // Handle processing errors
    if (
      error.toLowerCase().includes('gagal memproses') ||
      error.toLowerCase().includes('process')
    ) {
      return 'Gagal memproses rekaman. Pastikan koneksi internet stabil dan coba lagi'
    }

    // Handle API errors
    if (
      error.toLowerCase().includes('503') ||
      error.toLowerCase().includes('service unavailable')
    ) {
      return 'Layanan sedang sibuk. Tunggu sebentar dan coba lagi ya'
    }

    // Handle network errors
    if (
      error.toLowerCase().includes('network') ||
      error.toLowerCase().includes('fetch')
    ) {
      return 'Koneksi internet bermasalah. Periksa koneksi dan coba lagi'
    }

    // Default friendly message
    return 'Ups, ada yang tidak beres. Coba ucapkan lagi dengan jelas, misalnya: "Beli kopi 25 ribu"'
  }

  // Process transcript (called after user confirms in dialog)
  const processTranscript = async (
    transcript: string,
    walletId: string | null = null,
  ) => {
    setIsProcessing(true)
    setStatus(`Memproses: "${transcript}"`)

    try {
      const processPayload: { text: string; webhookUrl?: string } = {
        text: transcript,
      }

      if (userProfile?.mode === 'webhook' && webhookUrl) {
        processPayload.webhookUrl = webhookUrl
      }

      const processResponse = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processPayload),
      })

      const processData = await processResponse.json()

      if (!processResponse.ok) {
        console.error('Process API error response:', processData)
        console.error('Status:', processResponse.status)
        const errorMsg = processData.error || 'Gagal memproses suara'
        const friendlyError = getFriendlyErrorMessage(errorMsg)
        throw new Error(friendlyError)
      }

      const transactionResponse = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: processData.data.item,
          amount: processData.data.amount,
          category: processData.data.category,
          type: processData.data.type || 'expense',
          date: processData.data.date,
          voice_text: transcript,
          location: processData.data.location || null,
          payment_method: processData.data.payment_method || null,
          wallet_id: walletId,
        }),
      })

      const transactionData = await transactionResponse.json()

      if (!transactionResponse.ok) {
        const errorMsg = transactionData.error || 'Gagal menyimpan transaksi'
        const friendlyError = getFriendlyErrorMessage(errorMsg)
        throw new Error(friendlyError)
      }

      loadUserProfile()
      loadWallets()
      loadRecentTransactions()

      setStatus('Berhasil! Transaksi tersimpan')
      toast.success(
        `${processData.data.item} - Rp ${processData.data.amount.toLocaleString('id-ID')} tercatat!`,
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus(IDLE_STATUS)
    } catch (error) {
      console.error('Error:', error)
      let errorMessage = 'Ups, ada yang tidak beres. Coba lagi ya'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      setStatus('Gagal memproses')

      // Reset after showing error
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus('Siap merekam')
    } finally {
      setIsProcessing(false)
    }
  }

  // Logic Bubble Active
  const isBubbleActive =
    status !== IDLE_STATUS && // Jika bukan idle, berarti aktif
    (status === 'Mendengarkan...' ||
      status.toLowerCase().includes('memproses') ||
      status.toLowerCase().includes('berhasil') ||
      status.toLowerCase().includes('gagal') ||
      status.toLowerCase().includes('merekam'))

  // Helper untuk menentukan Label Bubble
  const getBubbleLabel = () => {
    if (status === IDLE_STATUS) return 'Saran'
    // Jika status mengandung kutip (misal: Memproses: "Beli kopi"), itu kata-kata user -> "Anda"
    if (status.includes('"') || status.includes("'")) return 'Anda'
    // Sisanya status sistem
    return 'Status'
  }

  const bubbleLabel = getBubbleLabel()

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation - Desktop Only */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-1">
              <Link href="/advisor">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="AI Advisor"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/history">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Riwayat"
                >
                  <History className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/reports">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Laporan"
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/settings">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  title="Pengaturan"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1">
              <DarkModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

      {/* Main Content */}
      <main className="md:pt-16 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pb-6 space-y-6">
          {/* Header Section */}
          <div className="md:hidden bg-[#f5f5f5] dark:bg-muted/20 px-6 py-4 -mx-4">
            <div className="flex justify-between items-center">
              {/* Left: App Title & Greeting */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  HaloDompet
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Hai,{' '}
                  <span className="font-medium">
                    {user?.user_metadata?.full_name?.split(' ')[0] ||
                      user?.user_metadata?.name?.split(' ')[0] ||
                      user?.email?.split('@')[0]}
                  </span>{' '}
                  👋
                </p>
              </div>

              {/* Right: Dark Mode Toggle */}
              <div>
                <DarkModeToggle />
              </div>
            </div>
          </div>

          {/* Trial Warning Banner */}
          <TrialWarningBanner profile={userProfile} />

          {/* Wallet Carousel - Multi-Wallet Display */}
          <WalletCarousel
            wallets={wallets}
            totalBalance={totalBalance}
            growthPercentage={growthPercentage}
            isLoading={false}
            onAddWallet={handleAddWallet}
            onEditWallet={handleEditWallet}
          />

          {/* Area Chat Bubble */}
          <div className="relative w-full max-w-[400px] mx-auto mb-4 flex flex-col justify-end items-center transition-all duration-300">
            <div
              className={`relative px-4 py-2.5 rounded-2xl shadow-sm border transition-all duration-300 ${
                isBubbleActive
                  ? 'bg-gradient-to-br from-indigo-50 to-white border-indigo-100 text-indigo-900 scale-100 opacity-100'
                  : 'bg-gray-50 border-gray-100 text-gray-400 scale-95 opacity-80'
              }`}
            >
              {/* Label Bubble Dynamic */}
              <span className="absolute -top-2.5 left-4 bg-white text-[9px] font-bold px-1.5 py-px rounded-full shadow-sm border border-gray-100 text-gray-400 uppercase tracking-wider">
                {bubbleLabel}
              </span>

              <p
                className={`text-center font-medium leading-snug ${
                  isBubbleActive ? 'text-sm' : 'text-xs italic'
                }`}
              >
                {/* Hilangkan tanda kutip jika status adalah prompt/saran */}
                {status === IDLE_STATUS ? status : `"${status}"`}
              </p>

              <div
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${
                  isBubbleActive
                    ? 'bg-indigo-50 border-indigo-100'
                    : 'bg-gray-50 border-gray-100'
                }`}
              ></div>
            </div>
          </div>

          {/* Voice Recording Section */}
          <div className="flex flex-col items-center gap-2">
            <RecordButton
              onTranscript={handleTranscript}
              onStatusChange={handleStatusChange}
              isLoading={false}
            />

            {/* Manual Transaction Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsManualTransactionOpen(true)}
              className="gap-2 border-2 border-dashed hover:border-solid hover:bg-primary/10"
            >
              <PlusCircle className="h-5 w-5" />
              Input Manual
            </Button>

            {/* Status Card */}
            <div className="w-full max-w-md space-y-3">
              {userProfile?.mode === 'webhook' && !webhookUrl && (
                <Link href="/settings">
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 rounded-xl px-4 py-2 cursor-pointer hover:bg-amber-500/20 transition-colors">
                    <Settings className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Klik untuk setup webhook URL di Settings</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Instruction */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-medium text-muted-foreground">
                  Tekan tombol dan ucapkan pemasukan atau pengeluaran Anda
                </p>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {recentTransactions.length > 0 && (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-normal text-foreground">
                  Transaksi Terakhir
                </h2>
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Lihat Semua
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-2">
                {recentTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onClick={() => router.push('/history')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {recentTransactions.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <History className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">
                  Belum ada transaksi
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mulai rekam pengeluaran Anda dengan menekan tombol di atas
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Review Transcript Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Hasil Rekaman</DialogTitle>
            <DialogDescription>
              Periksa dan edit hasil rekaman suara Anda sebelum menyimpan
              transaksi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                htmlFor="transcript-edit"
                className="text-sm font-medium text-foreground"
              >
                Teks yang terdeteksi:
              </label>
              <Input
                id="transcript-edit"
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                placeholder="Contoh: Beli kopi 25000"
                className="w-full"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Anda dapat mengedit teks di atas jika ada kesalahan deteksi.
              </p>
            </div>

            {/* Wallet Selector */}
            <WalletSelector
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
              isLoading={false}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelTranscript}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={handleConfirmTranscript}
              disabled={!editedTranscript.trim()}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Proses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Dialog */}
      <AddWalletDialog
        open={isAddWalletOpen}
        onOpenChange={setIsAddWalletOpen}
        onSuccess={handleWalletSuccess}
      />

      {/* Edit Wallet Dialog */}
      <EditWalletDialog
        open={isEditWalletOpen}
        onOpenChange={setIsEditWalletOpen}
        wallet={selectedWallet}
        onSuccess={handleWalletSuccess}
      />

      {/* Manual Transaction Dialog */}
      <ManualTransactionDialog
        open={isManualTransactionOpen}
        onOpenChange={setIsManualTransactionOpen}
        wallets={wallets}
        isLoadingWallets={false}
        onSuccess={() => {
          loadWallets()
          loadRecentTransactions()
        }}
      />
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { TotalBalanceCard } from '@/components/dashboard/TotalBalanceCard'
import { WalletSelector } from '@/components/WalletSelector'
import { TransactionCard } from '@/components/TransactionCard'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { LottieAvatarRecorder } from '@/components/LottieAvatarRecorder'
import { AppNavigation } from '@/components/AppNavigation'
import { AdvisorPromoCard } from '@/components/dashboard/AdvisorPromoCard'
import { useAIAdvisor } from '@/hooks/useAIAdvisor'
import { useScanReceipt } from '@/hooks/useScanReceiptHook'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { TransferForm } from '@/components/transaction/TransferForm'
import { isEarlyAdopter } from '@/lib/trial'

// OPTIMIZED: Lazy load dialog components (below-the-fold)
const AddWalletDialog = dynamic(
  () =>
    import('@/components/AddWalletDialog').then((mod) => ({
      default: mod.AddWalletDialog,
    })),
  {
    ssr: false,
  },
)
const EditWalletDialog = dynamic(
  () =>
    import('@/components/EditWalletDialog').then((mod) => ({
      default: mod.EditWalletDialog,
    })),
  {
    ssr: false,
  },
)
const EditBalanceDialog = dynamic(
  () =>
    import('@/components/EditBalanceDialog').then((mod) => ({
      default: mod.EditBalanceDialog,
    })),
  {
    ssr: false,
  },
)
const ManualTransactionDialog = dynamic(
  () =>
    import('@/components/ManualTransactionDialog').then((mod) => ({
      default: mod.ManualTransactionDialog,
    })),
  {
    ssr: false,
  },
)
const TransactionReceipt = dynamic(
  () =>
    import('@/components/TransactionReceipt').then((mod) => ({
      default: mod.TransactionReceipt,
    })),
  {
    ssr: false,
  },
)

// OPTIMIZED: Lazy load BudgetProgress (below-the-fold)
const BudgetProgress = dynamic(
  () =>
    import('@/components/BudgetProgress').then((mod) => ({
      default: mod.BudgetProgress,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-3">
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
        <div className="h-24 w-full bg-muted rounded-xl animate-pulse" />
      </div>
    ),
  },
)

// OPTIMIZED: Lazy load PWA Help Button
const PWAHelpButton = dynamic(
  () =>
    import('@/components/PWAHelpButton').then((mod) => ({
      default: mod.PWAHelpButton,
    })),
  {
    ssr: false,
  },
)

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  Wallet as WalletIcon,

} from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile, Transaction, Wallet, MonthlyStats } from '@/types'
import type { BudgetSummary } from '@/lib/budget'

// Konstanta untuk status default agar konsisten
const IDLE_STATUS = 'Coba: "Beli Kopi 25 ribu di Fore atau Dapat gaji 5 juta"'

interface DashboardClientProps {
  initialUser: User
  initialUserProfile: UserProfile
  initialWallets: Wallet[]
  initialTotalBalance: number
  initialGrowthPercentage: number
  // OPTIMIZED: Make transactions and budget optional for faster LCP
  initialTransactions?: Transaction[]
  initialBudgetSummary?: BudgetSummary[]
  initialMonthlyStats?: MonthlyStats
}

export function DashboardClient({
  initialUser,
  initialUserProfile,
  initialWallets,
  initialTotalBalance,
  initialGrowthPercentage,
  initialTransactions = [],
  initialBudgetSummary = [],
  initialMonthlyStats = { income: 0, expense: 0 },
}: DashboardClientProps) {
  // State Management
  const [user] = useState<User>(initialUser)
  const [userProfile, setUserProfile] =
    useState<UserProfile>(initialUserProfile)
  const [wallets, setWallets] = useState<Wallet[]>(initialWallets)
  const [totalBalance, setTotalBalance] = useState<number>(initialTotalBalance)
  const [growthPercentage, setGrowthPercentage] = useState<number>(
    initialGrowthPercentage,
  )
  const [recentTransactions, setRecentTransactions] =
    useState<Transaction[]>(initialTransactions)
  const [budgetSummary, setBudgetSummary] =
    useState<BudgetSummary[]>(initialBudgetSummary)
  const [isLoadingNonCritical, setIsLoadingNonCritical] = useState(
    initialTransactions.length === 0,
  )

  // Ubah initial state menggunakan IDLE_STATUS
  const [status, setStatus] = useState(IDLE_STATUS)
  const [webhookUrl, setWebhookUrl] = useState(
    initialUserProfile?.mode === 'webhook' && initialUserProfile?.webhook_url
      ? initialUserProfile.webhook_url
      : '',
  )
  const [isProcessing, setIsProcessing] = useState(false)

  // State for AI roast message
  const [roastMessage, setRoastMessage] = useState<string | null>(null)

  const [aiSentiment, setAiSentiment] = useState<any>(undefined)

  // Review dialog state (for voice recording)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [editedTranscript, setEditedTranscript] = useState('')

  // Wallet management state
  // Wallet management state
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false)
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [selectedWalletForBalance, setSelectedWalletForBalance] = useState<Wallet | null>(null)
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)

  // Manual transaction dialog state
  const [isManualTransactionOpen, setIsManualTransactionOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedSourceWalletId, setSelectedSourceWalletId] = useState<string | undefined>(undefined)

  // Transaction receipt state
  const [showReceipt, setShowReceipt] = useState(false)


  const [lastTransactionData, setLastTransactionData] = useState<{
    item: string
    amount: number
    category: string
    type: 'expense' | 'income' | 'adjustment'
    date: string
    wallet_name?: string
    location?: string | null
    payment_method?: string | null
  } | null>(null)

  // Scan Receipt Hook
  const { handleScanClick, ScanDialog, isScanning } = useScanReceipt({
    onSuccess: (transaction) => {
      loadTransactions() // Alias for loadRecentTransactions
      loadWallets()
      
      if (transaction) {
        setLastTransactionData(transaction)
        setShowReceipt(true)
      }
    },
    wallets,
  })



  // Alias for consistent naming
  const loadTransactions = () => loadRecentTransactions()


  // AI Advisor Hook
  const {
    messages: advisorMessages,
    isLoading: isAdvisorLoading,
    sendMessage: sendAdvisorMessage,
  } = useAIAdvisor({
    onError: (err) => {
      toast.error(err)
      setStatus(`Error: ${err}`)
    },
  })

  // Effect to update roastMessage/bubble with advisor stream
  useEffect(() => {
    const lastMessage = advisorMessages[advisorMessages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant') {
      // Show the streaming content in the bubble
      setRoastMessage(lastMessage.content)
      
      // If streaming finished, keep it visible until user dismisses
      if (!lastMessage.isStreaming) {
        // Do nothing, wait for user to dismiss via X button
      }
    }
  }, [advisorMessages])

  const handleAnalyze = async () => {
    setStatus('Menganalisa keuangan...')
    // Clear previous roast message to show loading state effectively
    setRoastMessage(null) 
    
    try {
      // Add timeout to prevent infinite loading state (increased to 30s)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Waktu habis, coba lagi ya!')), 30000)
      )

      const analysisPromise = sendAdvisorMessage("Analisa keuangan saya saat ini dengan gaya 'roasting' yang pedas tapi lucu. Komentari saldo, pemasukan, dan pengeluaran saya. Gunakan bahasa santai dan emoji.")
      
      await Promise.race([analysisPromise, timeoutPromise])
      
      // Do NOT reset to IDLE_STATUS here.
      // If success, roastMessage will be shown.
      // If error, onError will set status.
    } catch (error) {
      console.error('Analysis failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal menganalisa'
      setStatus(errorMessage)
      toast.error(errorMessage)
      // Do NOT reset to IDLE_STATUS here, let the error persist
    }
  }

  const router = useRouter()
  const supabase = createClient()

  // OPTIMIZED: Lazy load non-critical data (transactions, budget) after initial render
  useEffect(() => {
    // Only load if we don't have initial data
    if (initialTransactions.length === 0) {
      const loadNonCriticalData = async () => {
        try {
          await Promise.all([loadRecentTransactions(), loadBudgetSummary()])
        } catch (error) {
          console.error('Error loading non-critical data:', error)
        } finally {
          setIsLoadingNonCritical(false)
        }
      }

      loadNonCriticalData()
    }
  }, []) // Run once on mount

  // Show welcome toast for new users
  useEffect(() => {
    // Check if welcome toast has been shown before
    const hasSeenWelcomeToast = localStorage.getItem('welcome_toast_shown')

    if (!hasSeenWelcomeToast) {
      // Show welcome message
      toast.success('Selamat datang di HaloDompet!', {
        description: 'Mulai catat pengeluaran Anda dengan suara.',
        duration: 6000,
      })

      // Mark as shown in localStorage
      localStorage.setItem('welcome_toast_shown', 'true')
    }
  }, [userProfile])

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

  const loadBudgetSummary = async () => {
    try {
      const response = await fetch('/api/budget/summary')
      const data = await response.json()

      if (response.ok && data.budgets) {
        setBudgetSummary(data.budgets)
      }
    } catch (error) {
      console.error('Error loading budget summary:', error)
    }
  }

  const handleManualTransactionSuccess = () => {
    setIsManualTransactionOpen(false)
    loadRecentTransactions()
    loadWallets()
    loadBudgetSummary()
    toast.success('Transaksi berhasil disimpan')
  }

  const handleTransferSuccess = () => {
    setIsTransferOpen(false)
    setSelectedSourceWalletId(undefined)
    loadRecentTransactions()
    loadWallets()
    toast.success('Transfer berhasil!')
  }

  const handleTransfer = (wallet: Wallet) => {
    setSelectedSourceWalletId(wallet.id)
    setIsTransferOpen(true)
  }

  const handleBalanceUpdate = () => {
    loadWallets()
    loadBudgetSummary()
    loadRecentTransactions()
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

  const handleAdjustBalance = (wallet: Wallet) => {
    setSelectedWalletForBalance(wallet)
    setIsEditBalanceOpen(true)
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

      // Extract roast message from AI response
      const aiRoastMessage = processData.data?.roast_message || null

      const detectedSentiment = processData.data?.sentiment || 'success'
      if (detectedSentiment) {
        setAiSentiment(detectedSentiment)
        // Reset sentiment kembali ke idle setelah 8 detik agar animasi tidak stuck
        setTimeout(() => setAiSentiment(undefined), 8000)
      }

      if (aiRoastMessage) {
        console.log('🤑 AI Roast:', aiRoastMessage)
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
      loadBudgetSummary()

      setStatus('Berhasil! Transaksi tersimpan')

      // Get wallet name if walletId is provided
      const selectedWalletName = walletId
        ? wallets.find((w) => w.id === walletId)?.name
        : undefined

      // Prepare transaction data for receipt
      const receiptData = {
        item: processData.data.item,
        amount: processData.data.amount,
        category: processData.data.category,
        type: processData.data.type || 'expense',
        date: processData.data.date,
        wallet_name: selectedWalletName,
        location: processData.data.location,
        payment_method: processData.data.payment_method,
      }

      // Show receipt dialog
      setLastTransactionData(receiptData)
      setShowReceipt(true)

      // Show roast message if available
      if (aiRoastMessage) {
        setRoastMessage(aiRoastMessage)
        // Auto-hide roast message after 8 seconds
        setTimeout(() => {
          setRoastMessage(null)
        }, 8000)
      }

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

      setAiSentiment('error')
      setTimeout(() => setAiSentiment(undefined), 3000)

      // Reset after showing error
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus('Siap merekam')
    } finally {
      setIsProcessing(false)
    }
  }

  // Logic Bubble Active
  const isBubbleActive =
    roastMessage !== null || // Jika ada roast message, bubble aktif
    (status !== IDLE_STATUS && // Jika bukan idle, berarti aktif
      (status === 'Mendengarkan...' ||
        status.toLowerCase().includes('memproses') ||
        status.toLowerCase().includes('berhasil') ||
        status.toLowerCase().includes('gagal') ||
        status.toLowerCase().includes('merekam')))

  // Helper untuk menentukan Label Bubble
  const getBubbleLabel = () => {
    // Jika ada roast message yang sedang ditampilkan
    if (roastMessage) return 'Dompie'
    if (status === IDLE_STATUS) return 'Saran'
    // Jika status mengandung kutip (misal: Memproses: "Beli kopi"), itu kata-kata user -> "Anda"
    if (status.includes('"') || status.includes("'")) return 'Dompie'
    // Sisanya status sistem
    return 'Dompie'
  }

  const bubbleLabel = getBubbleLabel()

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto w-full px-4 pb-24 md:pb-8 pt-4 space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-sm transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                {user?.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || 'User'}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    priority // Critical for LCP as it's above the fold
                  />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Selamat Datang,</p>
                <h1 className="text-base font-bold text-foreground leading-tight">
                  {user?.user_metadata?.full_name ||
                    user?.user_metadata?.name ||
                    user?.email?.split('@')[0] ||
                    'Teman Dompet'}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <DarkModeToggle />
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Total Balance Card */}
          <div className="flex justify-center">
            <TotalBalanceCard
              totalBalance={totalBalance}
              monthlyStats={initialMonthlyStats}
              wallets={wallets}
              onTransfer={handleTransfer}
              onAdjustBalance={handleAdjustBalance}
              onEditWallet={handleEditWallet}
            />
          </div>

          {/* Area Chat Bubble Status */}
          <div className="relative w-full max-w-[400px] mx-auto mb-4 flex flex-col justify-end items-center transition-all duration-300">
            <div
              className={`relative px-4 py-2.5 rounded-2xl shadow-sm border transition-all duration-300 ${
                isBubbleActive
                  ? 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-800 border-indigo-100 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-100 scale-100 opacity-100'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 scale-95 opacity-80'
              }`}
            >
              {/* Label Bubble Dynamic */}
              <span
                className={`absolute -top-2.5 left-4 bg-white dark:bg-gray-800 text-[9px] font-bold px-1.5 py-px rounded-full shadow-sm border uppercase tracking-wider ${
                  roastMessage
                    ? 'border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                    : 'border-gray-100 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                }`}
              >
                {bubbleLabel}
              </span>

              {/* Close Button - Only show for roast message */}
              {roastMessage && (
                <button
                  onClick={() => {
                    setRoastMessage(null)
                    setStatus(IDLE_STATUS)
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-xs font-bold hover:scale-110 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md"
                  aria-label="Tutup pesan"
                >
                  ×
                </button>
              )}

              <div
                className={`text-center font-medium leading-snug ${
                  isBubbleActive ? 'text-sm' : 'text-xs italic'
                } max-h-[80px] overflow-y-auto pr-1 custom-scrollbar`}
              >
                {/* Tampilkan roast message (tanpa kutip) atau status */}
                {roastMessage ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-strong:text-indigo-700 dark:prose-strong:text-indigo-300 prose-strong:font-bold text-left">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 dark:text-indigo-300" {...props} />
                      }}
                    >
                      {roastMessage}
                    </ReactMarkdown>
                  </div>
                ) : (
                  status === IDLE_STATUS ? status : `"${status}"`
                )}
              </div>

              <div
                className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${
                  isBubbleActive
                    ? 'bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/40 dark:to-gray-800 border-indigo-100 dark:border-indigo-900/50'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50'
                }`}
              ></div>
            </div>
          </div>

          {/* Voice Recording Section */}
          <div className="flex flex-col items-center gap-2">
            <LottieAvatarRecorder
              onTranscript={handleTranscript}
              onStatusChange={handleStatusChange}
              isLoading={false}
              sentiment={
                isProcessing
                  ? 'processing' // 1. Jika sedang loading API/Simpan -> PROCESSING
                  : isScanning
                    ? 'scanning' // 2. Jika sedang scan struk -> SCANNING
                    : isAdvisorLoading
                      ? 'analyzing' // 3. Jika sedang analisa advisor -> ANALYZING
                      : aiSentiment // 4. Jika selesai & ada hasil -> EMOSI (Shocked/Proud/dll)
              }
            />

            {/* Manual Transaction Button */}
            <div className="flex gap-3">


              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsManualTransactionOpen(true)}
                className="gap-2 border-2 border-dashed hover:border-solid hover:bg-primary/10"
              >
                <PlusCircle className="h-5 w-5" />
                Input Manual
              </Button>
            </div>

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
            {/* Advisor Promo Card */}
            <div className="w-full max-w-md">
              <AdvisorPromoCard 
                onAnalyze={handleAnalyze}
                isLoading={isAdvisorLoading}
              />
            </div>
          </div>

          {/* Budget Progress Widget - OPTIMIZED with dynamic loading */}
          <div className="animate-slide-up">
            <BudgetProgress budgets={budgetSummary} />
          </div>

          {/* Recent Transactions - OPTIMIZED with skeleton */}
          {isLoadingNonCritical ? (
            <div className="space-y-4 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="h-6 w-36 bg-muted rounded animate-pulse" />
                <div className="h-9 w-28 bg-muted rounded-md animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full bg-muted rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          ) : recentTransactions.length > 0 ? (
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
          ) : (
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
      </main>



      {/* Review Transcript Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="w-[95%] sm:max-w-md overflow-x-hidden rounded-xl">
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

      {selectedWalletForBalance && (
        <EditBalanceDialog
          walletId={selectedWalletForBalance.id}
          walletName={selectedWalletForBalance.name}
          currentBalance={selectedWalletForBalance.balance}
          open={isEditBalanceOpen}
          onOpenChange={setIsEditBalanceOpen}
          onSuccess={() => {
            handleBalanceUpdate()
            setSelectedWalletForBalance(null)
          }}
        />
      )}

      {/* Manual Transaction Dialog */}
      <ManualTransactionDialog
        open={isManualTransactionOpen}
        onOpenChange={setIsManualTransactionOpen}
        onSuccess={handleManualTransactionSuccess}
        wallets={wallets}
      />

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Antar Dompet</DialogTitle>
          </DialogHeader>
          <TransferForm
            wallets={wallets}
            onSuccess={handleTransferSuccess}
            onCancel={() => {
              setIsTransferOpen(false)
              setSelectedSourceWalletId(undefined)
            }}
            defaultSourceWalletId={selectedSourceWalletId}
          />
        </DialogContent>
      </Dialog>

      {/* Scan Dialog Hook */}
      {ScanDialog()}

      {/* Transaction Receipt Dialog */}
      <TransactionReceipt
        open={showReceipt}
        onOpenChange={setShowReceipt}
        data={lastTransactionData}
      />

      {/* PWA Help Button - Mobile Only */}
      <PWAHelpButton />

      <AppNavigation onScanClick={handleScanClick} />
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { WalletCarousel } from '@/components/WalletCarousel'
import { WalletSelector } from '@/components/WalletSelector'
import { TransactionCard } from '@/components/TransactionCard'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { LottieAvatarRecorder } from '@/components/LottieAvatarRecorder'
import { BottomNav } from '@/components/BottomNav'
import { AdvisorPromoCard } from '@/components/dashboard/AdvisorPromoCard'
import { useAIAdvisor } from '@/hooks/useAIAdvisor'
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
import type { User as UserProfile, Transaction, Wallet } from '@/types'
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
}

export function DashboardClient({
  initialUser,
  initialUserProfile,
  initialWallets,
  initialTotalBalance,
  initialGrowthPercentage,
  initialTransactions = [],
  initialBudgetSummary = [],
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

  // Review scan dialog state
  const [isReviewScanOpen, setIsReviewScanOpen] = useState(false)
  const [scannedData, setScannedData] = useState<{
    item: string
    amount: number
    category: string
    note: string | null
  } | null>(null)

  // Wallet management state
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
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

  // Receipt scan state
  const [isScanning, setIsScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      
      // If streaming finished, keep it visible for longer
      if (!lastMessage.isStreaming) {
        // Optional: Clear after a long delay or keep it until user dismisses
        // For now, let's keep it until user dismisses or new action
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

  const handleConfirmScan = async () => {
    if (!scannedData) return

    setIsReviewScanOpen(false)
    setIsProcessing(true)
    setStatus('Menyimpan transaksi...')

    try {
      const transactionResponse = await fetch('/api/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: scannedData.item,
          amount: scannedData.amount,
          category: scannedData.category,
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          voice_text: null,
          note: scannedData.note,
          wallet_id: selectedWalletId,
        }),
      })

      const transactionData = await transactionResponse.json()

      if (!transactionResponse.ok) {
        const errorMsg = transactionData.error || 'Gagal menyimpan transaksi'
        throw new Error(errorMsg)
      }

      // Reload data
      loadUserProfile()
      loadWallets()
      loadRecentTransactions()
      loadBudgetSummary()

      setStatus('Berhasil! Transaksi tersimpan')

      // Get wallet name if walletId is provided
      const selectedWalletName = selectedWalletId
        ? wallets.find((w) => w.id === selectedWalletId)?.name
        : undefined

      // Prepare transaction data for receipt
      const receiptData = {
        item: scannedData.item,
        amount: scannedData.amount,
        category: scannedData.category,
        type: 'expense' as const,
        date: new Date().toISOString().split('T')[0],
        wallet_name: selectedWalletName,
        location: null,
        payment_method: null,
      }

      // Show receipt dialog
      setLastTransactionData(receiptData)
      setShowReceipt(true)

      toast.success('Transaksi berhasil disimpan!')

      // Reset scan data and wallet selection
      setScannedData(null)
      setSelectedWalletId(null)



      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus(IDLE_STATUS)
    } catch (error) {
      console.error('Error saving transaction:', error)
      let errorMessage = 'Gagal menyimpan transaksi. Coba lagi ya'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      setStatus('Gagal menyimpan')

      setAiSentiment('error')
      setTimeout(() => setAiSentiment(undefined), 3000)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus(IDLE_STATUS)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelScan = () => {
    setIsReviewScanOpen(false)
    setScannedData(null)
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

  // Handle scan receipt button click
  const handleScanClick = () => {
    fileInputRef.current?.click()
  }

  // Convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Handle file selection for receipt scan
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }

    setIsScanning(true)
    setStatus('Memproses gambar struk...')

    try {
      // Convert image to base64
      const base64Image = await convertToBase64(file)

      // Send to scan API
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Image,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || 'Gagal membaca struk'
        throw new Error(errorMsg)
      }

      // Combine notes_summary, location, and payment_method into note
      const noteParts = []

      // Priority 1: Add notes_summary if exists (detail items from receipt)
      if (data.data.notes_summary) {
        noteParts.push(data.data.notes_summary)
      }

      // Priority 2: Add location if exists
      if (data.data.location) {
        noteParts.push(`📍 ${data.data.location}`)
      }

      // Priority 3: Add payment method if exists
      if (data.data.payment_method) {
        noteParts.push(`💳 ${data.data.payment_method}`)
      }

      const combinedNote = noteParts.length > 0 ? noteParts.join('\n') : null

      // Set scanned data for review
      setScannedData({
        item: data.data.item || '',
        amount: data.data.amount || 0,
        category: data.data.category || 'Lainnya',
        note: combinedNote,
      })

      // Open review dialog
      setIsReviewScanOpen(true)
      setStatus(IDLE_STATUS)
    } catch (error) {
      console.error('Error scanning receipt:', error)
      let errorMessage =
        'Gagal membaca struk. Coba foto lebih jelas atau gunakan Input Manual.'

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
      setStatus('Gagal memproses')

      setAiSentiment('error')
      setTimeout(() => setAiSentiment(undefined), 3000)

      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStatus(IDLE_STATUS)
    } finally {
      setIsScanning(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

  // Content bubble: prioritaskan roast message jika ada, kalau tidak tampilkan status
  const bubbleContent = roastMessage || status



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
      <BottomNav onScanClick={handleScanClick} />

      {/* Main Content */}
      <main className="md:pt-16 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pb-6 space-y-6">
          {/* Header Section */}
          <div className="md:hidden bg-[#f5f5f5] dark:bg-muted/20 px-6 py-4 -mx-4">
            <div className="flex justify-between items-center">
              {/* Left: App Title & Greeting */}
              <div className="flex items-center gap-3">
                {/* Placeholder Logo */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <WalletIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    HaloDompet
                  </h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hai,{' '}
                    <span className="font-medium">
                      {user?.user_metadata?.full_name?.split(' ')[0] ||
                        user?.user_metadata?.name?.split(' ')[0] ||
                        user?.email?.split('@')[0]}
                    </span>{' '}
                    👋
                  </p>
                </div>
              </div>

              {/* Right: Dark Mode Toggle & Settings */}
              <div className="flex items-center gap-1">
                <DarkModeToggle />
                <Link href="/settings">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    title="Pengaturan"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Wallet Carousel - Multi-Wallet Display */}
          <WalletCarousel
            wallets={wallets}
            totalBalance={totalBalance}
            growthPercentage={growthPercentage}
            isLoading={false}
            onAddWallet={handleAddWallet}
            onEditWallet={handleEditWallet}
            onTransfer={handleTransfer}
            onBalanceUpdate={handleBalanceUpdate}
          />

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
                  onClick={() => setRoastMessage(null)}
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
                    : aiSentiment // 3. Jika selesai & ada hasil -> EMOSI (Shocked/Proud/dll)
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

            {/* Hidden File Input for Scan Receipt */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

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
        </div>
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

      {/* Review Scan Dialog */}
      <Dialog open={isReviewScanOpen} onOpenChange={setIsReviewScanOpen}>
        <DialogContent className="w-[95%] sm:max-w-md overflow-x-hidden rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Hasil Scan</DialogTitle>
            <DialogDescription>
              Periksa dan edit hasil scan struk sebelum menyimpan transaksi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <label
                htmlFor="scan-item"
                className="text-sm font-medium text-foreground"
              >
                Nama Merchant:
              </label>
              <Input
                id="scan-item"
                value={scannedData?.item || ''}
                onChange={(e) =>
                  setScannedData((prev) =>
                    prev ? { ...prev, item: e.target.value } : null,
                  )
                }
                placeholder="Contoh: Alfamart"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="scan-amount"
                className="text-sm font-medium text-foreground"
              >
                Jumlah (Rp):
              </label>
              <Input
                id="scan-amount"
                type="number"
                value={scannedData?.amount || 0}
                onChange={(e) =>
                  setScannedData((prev) =>
                    prev ? { ...prev, amount: Number(e.target.value) } : null,
                  )
                }
                placeholder="0"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="scan-category"
                className="text-sm font-medium text-foreground"
              >
                Kategori:
              </label>
              <Input
                id="scan-category"
                value={scannedData?.category || ''}
                onChange={(e) =>
                  setScannedData((prev) =>
                    prev ? { ...prev, category: e.target.value } : null,
                  )
                }
                placeholder="Contoh: Makanan"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="scan-note"
                className="text-sm font-medium text-foreground"
              >
                Catatan (Opsional):
              </label>
              <Textarea
                id="scan-note"
                value={scannedData?.note || ''}
                onChange={(e) =>
                  setScannedData((prev) =>
                    prev ? { ...prev, note: e.target.value } : null,
                  )
                }
                placeholder="Detail item, lokasi, metode pembayaran, dll..."
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Info tambahan seperti detail belanja, lokasi toko, metode
                pembayaran, dll.
              </p>
            </div>

            {/* Wallet Selector */}
            <WalletSelector
              wallets={wallets}
              selectedWalletId={selectedWalletId}
              onSelectWallet={setSelectedWalletId}
              isLoading={false}
            />

            <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-2">
              💡 Hasil scan mungkin tidak 100% akurat. Silakan periksa dan edit
              jika diperlukan.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleCancelScan}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Batal
            </Button>
            <Button
              onClick={handleConfirmScan}
              disabled={!scannedData?.item || !scannedData?.amount}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction Receipt Dialog */}
      <TransactionReceipt
        open={showReceipt}
        onOpenChange={setShowReceipt}
        data={lastTransactionData}
      />

      {/* PWA Help Button - Mobile Only */}
      <PWAHelpButton />
    </div>
  )
}

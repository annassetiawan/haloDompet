"use client";

import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Plus, Wallet as WalletIcon, MoreVertical, Edit, Star, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, DollarSign, CreditCard } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from '@/lib/utils'
import type { Wallet } from '@/types'
import { EditBalanceDialog } from '@/components/EditBalanceDialog'

interface WalletCarouselProps {
  wallets: Wallet[]
  totalBalance: number
  growthPercentage?: number
  isLoading?: boolean
  onAddWallet?: () => void
  onEditWallet?: (wallet: Wallet) => void
}

export function WalletCarousel({
  wallets,
  totalBalance,
  growthPercentage = 0,
  isLoading = false,
  onAddWallet,
  onEditWallet
}: WalletCarouselProps) {
  const [isVisible, setIsVisible] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [selectedWalletForBalance, setSelectedWalletForBalance] = useState<Wallet | null>(null)

  const maskedAmount = (amount: number) => {
    return 'Rp ' + '•'.repeat(amount.toString().replace(/[^0-9]/g, '').length)
  }

  const getBalanceFontSize = (amount: number): string => {
    const formatted = formatCurrency(amount)
    const length = formatted.length
    if (length <= 12) return 'text-3xl'
    if (length <= 16) return 'text-2xl'
    return 'text-xl'
  }

  const colorGradients: Record<string, string> = {
    '#10b981': '#059669', '#3b82f6': '#2563eb', '#f59e0b': '#f97316',
    '#ef4444': '#dc2626', '#8b5cf6': '#7c3aed', '#ec4899': '#db2777',
    '#06b6d4': '#0891b2', '#84cc16': '#65a30d',
  }

  const getSecondaryColor = (primaryColor: string): string => {
    return colorGradients[primaryColor] || primaryColor
  }

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollLeftHandler = () => {
    scrollContainerRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  }

  const scrollRightHandler = () => {
    scrollContainerRef.current?.scrollBy({ left: 300, behavior: 'smooth' })
  }

  useEffect(() => {
    checkScrollPosition()
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [wallets])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 w-32 bg-muted rounded-xl animate-pulse" />
        <div className="w-full overflow-x-auto pb-3 scrollbar-hide">
          <div className="flex gap-4 px-1">
            {[1, 2].map((i) => (
              <div key={i} className="w-80 flex-shrink-0 h-40 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header Section - Blibli Style */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Atur pembayaran</h2>
        <button
          className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1"
          onClick={() => {/* Handle see all */}}
        >
          Lihat semua
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Carousel Container - Blibli Style */}
      <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3 snap-x snap-mandatory">

          {/* Card 1: Kartu Kredit atau Debit */}
          <div className="min-w-[280px] sm:min-w-[340px] flex-shrink-0 snap-start">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 p-4 transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">Kartu kredit atau debit</h3>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-white text-slate-700 hover:bg-white/90 font-medium rounded-full px-5 h-8"
                  onClick={onAddWallet}
                >
                  Buka
                </Button>
              </div>
            </div>
          </div>

          {/* Individual Wallet Cards - Blibli PayLater Style */}
          {wallets.map((wallet, index) => {
            const gradientStyles = [
              // Blue-Green gradient (Blibli Tiket PayLater style)
              'from-blue-500 via-blue-400 to-emerald-400',
              // Cyan gradient (BCA Blibli Card style)
              'from-cyan-400 via-cyan-300 to-blue-300',
              // Purple gradient
              'from-purple-500 via-purple-400 to-pink-400',
              // Orange gradient
              'from-orange-500 via-orange-400 to-yellow-400',
              // Pink gradient
              'from-pink-500 via-pink-400 to-rose-400',
            ]

            const gradientClass = gradientStyles[index % gradientStyles.length]

            return (
              <div key={wallet.id} className="min-w-[280px] sm:min-w-[340px] flex-shrink-0 snap-start">
                <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass} p-4 transition-transform hover:scale-[1.02]`}>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/5 rounded-full blur-2xl" />

                  {/* Card Content */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Icon/Logo Area */}
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{wallet.icon || '💳'}</span>
                      </div>

                      {/* Wallet Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm mb-0.5 truncate">
                          {wallet.name}
                        </h3>
                        <p className="text-white/80 text-xs">
                          {isVisible ? formatCurrency(wallet.balance) : maskedAmount(wallet.balance)}
                        </p>
                        {wallet.is_default && (
                          <span className="inline-block mt-1 text-[10px] text-white/70 bg-white/20 px-2 py-0.5 rounded-full">
                            Utama
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-white text-slate-700 hover:bg-white/90 font-medium rounded-full px-5 h-8 flex-shrink-0"
                        >
                          Buka
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setSelectedWalletForBalance(wallet)}
                          className="cursor-pointer"
                        >
                          <DollarSign className="mr-2 h-4 w-4" /> Sesuaikan Saldo
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onEditWallet && (
                          <DropdownMenuItem onClick={() => onEditWallet(wallet)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Edit Dompet
                          </DropdownMenuItem>
                        )}
                        {!wallet.is_default && onEditWallet && (
                          <DropdownMenuItem onClick={() => onEditWallet(wallet)} className="cursor-pointer">
                            <Star className="mr-2 h-4 w-4" /> Jadikan Utama
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Credit Card Chip (for visual interest) */}
                  {index === 0 && (
                    <div className="absolute bottom-3 left-4">
                      <div className="w-10 h-8 rounded bg-gradient-to-br from-yellow-200/40 to-yellow-300/40 backdrop-blur-sm" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Add Wallet Card */}
          {onAddWallet && wallets.length < 5 && (
            <div className="min-w-[280px] sm:min-w-[340px] flex-shrink-0 snap-start">
              <button
                onClick={onAddWallet}
                className="w-full h-full rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 hover:bg-muted/40 p-4 transition-all hover:scale-[1.02] hover:border-primary/50"
              >
                <div className="flex items-center justify-center gap-3 h-full min-h-[64px]">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">Tambah Dompet</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Balance Visibility Toggle (bottom right corner) */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {isVisible ? (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>Sembunyikan saldo</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>Tampilkan saldo</span>
            </>
          )}
        </button>
      </div>

      {/* Edit Balance Dialog */}
      {selectedWalletForBalance && (
        <EditBalanceDialog
          walletId={selectedWalletForBalance.id}
          walletName={selectedWalletForBalance.name}
          currentBalance={selectedWalletForBalance.balance}
          open={!!selectedWalletForBalance}
          onOpenChange={(open) => {
            if (!open) setSelectedWalletForBalance(null)
          }}
          onSuccess={() => {
            setSelectedWalletForBalance(null)
            // Refresh will be handled by router.refresh() in EditBalanceDialog
          }}
        />
      )}
    </div>
  )
}
"use client";

import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Plus, Wallet as WalletIcon, MoreVertical, Edit, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Wallet } from '@/types'

interface WalletCarouselProps {
  wallets: Wallet[]
  totalBalance: number
  isLoading?: boolean
  onAddWallet?: () => void
  onEditWallet?: (wallet: Wallet) => void
}

export function WalletCarousel({
  wallets,
  totalBalance,
  isLoading = false,
  onAddWallet,
  onEditWallet
}: WalletCarouselProps) {
  const [isVisible, setIsVisible] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const maskedAmount = (amount: number) => {
    return 'Rp ' + '•'.repeat(amount.toString().replace(/[^0-9]/g, '').length)
  }

  // Helper function to get responsive font size based on amount length
  const getBalanceFontSize = (amount: number): string => {
    const formatted = formatCurrency(amount)
    const length = formatted.length

    if (length <= 12) return 'text-3xl' // e.g., "Rp 100.000"
    if (length <= 16) return 'text-2xl' // e.g., "Rp 10.000.000"
    return 'text-xl' // e.g., "Rp 100.000.000"
  }

  // Color mapping for multi-color gradients
  const colorGradients: Record<string, string> = {
    '#10b981': '#059669', // Emerald
    '#3b82f6': '#2563eb', // Blue
    '#f59e0b': '#f97316', // Orange
    '#ef4444': '#dc2626', // Red
    '#8b5cf6': '#7c3aed', // Purple
    '#ec4899': '#db2777', // Pink
    '#06b6d4': '#0891b2', // Cyan
    '#84cc16': '#65a30d', // Lime
  }

  const getSecondaryColor = (primaryColor: string): string => {
    return colorGradients[primaryColor] || primaryColor
  }

  // Check scroll position to show/hide navigation buttons
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // -10 for threshold
    }
  }

  // Scroll navigation functions
  const scrollLeftHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRightHandler = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  // Set up scroll position tracking
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
        <div className="h-10 w-32 bg-muted/20 rounded-xl animate-pulse" />
        <div className="w-full overflow-x-auto pb-3 scrollbar-hide">
          <div className="flex gap-4 px-1">
            {[1, 2].map((i) => (
              <div key={i} className="w-80 flex-shrink-0 h-48 bg-muted/20 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header with toggle visibility */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Dompet Saya</h2>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 rounded-full hover:bg-muted/20 transition-all hover:scale-110"
            aria-label={isVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {onAddWallet && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddWallet}
            className="gap-2 text-sm font-medium hover:scale-105 transition-transform"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Dompet</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        )}
      </div>

      {/* Horizontal Scrollable Wallet Cards */}
      <div className="relative group">
        {/* Left Navigation Button */}
        {canScrollLeft && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollLeftHandler}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background hover:scale-110 transition-all border border-border/50"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Right Navigation Button */}
        {canScrollRight && (
          <Button
            variant="ghost"
            size="icon"
            onClick={scrollRightHandler}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background hover:scale-110 transition-all border border-border/50"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-3 scrollbar-hide">
          <div className="flex gap-4 snap-x snap-mandatory px-1">
        {/* Total Balance Card - Enhanced with Glassmorphism */}
        <div className="w-80 flex-shrink-0 snap-start">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] h-48">
            {/* Decorative Blur Circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 backdrop-blur-xl h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                    <WalletIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-medium">Total Aset</p>
                    <p className="text-white/60 text-xs">{wallets.length} dompet aktif</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                  <TrendingUp className="h-3 w-3 text-white" />
                  <span className="text-xs text-white font-medium">100%</span>
                </div>
              </div>

              <div>
                <p className={`${getBalanceFontSize(totalBalance)} font-bold text-white tracking-tight`}>
                  {isVisible ? formatCurrency(totalBalance) : maskedAmount(totalBalance)}
                </p>
              </div>

              {/* Bottom Shine Effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>
        </div>

        {/* Individual Wallet Cards - Full Gradient Style */}
        {wallets.map((wallet) => (
          <div key={wallet.id} className="w-80 flex-shrink-0 snap-start">
            <div
              className="relative overflow-hidden rounded-2xl h-48 p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
              style={{
                background: `linear-gradient(135deg, ${wallet.color || '#10b981'} 0%, ${getSecondaryColor(wallet.color || '#10b981')} 100%)`
              }}
            >
              {/* Decorative blur circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Header: Category + Name + Icon */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">
                      {wallet.is_default ? 'Utama' : 'Dompet'}
                    </p>
                    <h3 className="text-lg font-bold text-white">{wallet.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <span className="text-xl">{wallet.icon || '💰'}</span>
                    </div>
                    {/* More Options Menu */}
                    {onEditWallet && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all backdrop-blur-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onEditWallet(wallet)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Dompet
                          </DropdownMenuItem>
                          {!wallet.is_default && (
                            <DropdownMenuItem onClick={() => onEditWallet(wallet)} className="cursor-pointer">
                              <Star className="mr-2 h-4 w-4" />
                              Jadikan Utama
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Footer: Balance */}
                <div>
                  <p className="text-xs text-white/70 mb-1">Saldo Aktif</p>
                  <p className={`${getBalanceFontSize(wallet.balance)} font-bold text-white`}>
                    {isVisible ? formatCurrency(wallet.balance) : maskedAmount(wallet.balance)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Wallet Card - Modern Placeholder */}
        {onAddWallet && wallets.length < 5 && (
          <div className="w-80 flex-shrink-0 snap-start">
            <Card
              className="h-48 border-2 border-dashed border-border/50 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 group"
              onClick={onAddWallet}
            >
              <div className="p-6 h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground text-base">Tambah Dompet Baru</p>
                  <p className="text-xs mt-1 text-muted-foreground">Kelola keuangan lebih terorganisir</p>
                </div>
              </div>
            </Card>
          </div>
        )}
        </div>
        </div>
      </div>

      {/* Scroll Indicators - Subtle Dots */}
      {wallets.length > 0 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {[...Array(Math.min(wallets.length + 1, 5))].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 transition-all"
            />
          ))}
        </div>
      )}
    </div>
  )
}

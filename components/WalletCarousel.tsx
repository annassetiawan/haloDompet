"use client";

import { useState, useRef, useEffect } from 'react'
import { Eye, EyeOff, Plus, Wallet as WalletIcon, MoreVertical, Edit, Star, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react'
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-foreground">Dompet Saya</h2>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-2 rounded-full hover:bg-muted/20 transition-all hover:scale-110"
          >
            {isVisible ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
          </button>
        </div>
        {onAddWallet && (
          <Button variant="ghost" size="sm" onClick={onAddWallet} className="gap-2 text-sm font-medium hover:scale-105 transition-transform">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Dompet</span>
            <span className="sm:hidden">Tambah</span>
          </Button>
        )}
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <Button variant="ghost" size="icon" onClick={scrollLeftHandler} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {canScrollRight && (
          <Button variant="ghost" size="icon" onClick={scrollRightHandler} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border border-border/50">
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}

        <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-3 scrollbar-hide">
          {/* items-stretch: KUNCI agar semua kartu tingginya sama */}
          <div className="flex gap-4 snap-x snap-mandatory px-1 items-stretch">

            {/* --- TOTAL ASET CARD --- */}
            <div className="w-80 flex-shrink-0 snap-start">
              {/* UPDATED: Gunakan h-full di sini agar mengikuti tinggi tetangganya */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] h-full transition-all duration-300 hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                {/* Inner Content: justify-between agar spasi atas-bawah rapi */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-4 backdrop-blur-xl h-full flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                        <WalletIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/90 text-sm font-medium">Total Aset</p>
                        <p className="text-white/60 text-[10px]">{wallets.length} dompet aktif</p>
                      </div>
                    </div>
                    {growthPercentage === 0 ? (
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                        <span className="text-[10px] text-white font-medium">-</span>
                      </div>
                    ) : growthPercentage > 0 ? (
                      <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3 text-white" />
                        <span className="text-[10px] text-white font-medium">
                          +{growthPercentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-rose-500/30 px-2 py-1 rounded-full backdrop-blur-sm">
                        <TrendingDown className="h-3 w-3 text-white" />
                        <span className="text-[10px] text-white font-medium">
                          {growthPercentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className={`${getBalanceFontSize(totalBalance)} font-bold text-white tracking-tight leading-none`}>
                      {isVisible ? formatCurrency(totalBalance) : maskedAmount(totalBalance)}
                    </p>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
              </div>
            </div>

            {/* --- INDIVIDUAL WALLET CARDS --- */}
            {wallets.map((wallet) => (
              <div key={wallet.id} className="w-80 flex-shrink-0 snap-start">
                <div
                  className="relative overflow-hidden rounded-2xl p-4 text-white h-full flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                  style={{
                    background: `linear-gradient(135deg, ${wallet.color || '#10b981'} 0%, ${getSecondaryColor(wallet.color || '#10b981')} 100%)`
                  }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />

                  <div className="relative z-10 flex flex-col justify-between h-full gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-medium text-white/80 uppercase tracking-wider mb-1">
                          {wallet.is_default ? 'Utama' : 'Dompet'}
                        </p>
                        <h3 className="text-base font-bold text-white">{wallet.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                          <span className="text-lg">{wallet.icon || '💰'}</span>
                        </div>
                        {onEditWallet && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onEditWallet(wallet)} className="cursor-pointer">
                                <Edit className="mr-2 h-4 w-4" /> Edit Dompet
                              </DropdownMenuItem>
                              {!wallet.is_default && (
                                <DropdownMenuItem onClick={() => onEditWallet(wallet)} className="cursor-pointer">
                                  <Star className="mr-2 h-4 w-4" /> Jadikan Utama
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-white/70 mb-0.5">Saldo Aktif</p>
                      <p className={`${getBalanceFontSize(wallet.balance)} font-bold text-white leading-none`}>
                        {isVisible ? formatCurrency(wallet.balance) : maskedAmount(wallet.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* --- ADD WALLET CARD --- */}
            {onAddWallet && wallets.length < 5 && (
              <div className="w-80 flex-shrink-0 snap-start">
                <Card
                  className="h-full min-h-[140px] border-2 border-dashed border-border/50 rounded-3xl bg-gradient-to-br from-muted/30 to-muted/10 hover:from-muted/40 hover:to-muted/20 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 group"
                  onClick={onAddWallet}
                >
                  <div className="p-4 h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground text-sm">Tambah Dompet</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicators Mobile */}
      {wallets.length > 0 && (
        <div className="flex justify-center gap-1.5 md:hidden">
          {[...Array(Math.min(wallets.length + 1, 5))].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          ))}
        </div>
      )}
    </div>
  )
}
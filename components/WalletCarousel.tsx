"use client";

import { useState } from 'react'
import { Eye, EyeOff, Plus, Wallet as WalletIcon, MoreVertical, Edit, Star } from 'lucide-react'
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 w-32 bg-muted/20 rounded animate-pulse" />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2].map((i) => (
            <div key={i} className="min-w-[280px] h-40 bg-muted/20 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with toggle visibility */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-medium text-foreground">Dompet Saya</h2>
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1.5 rounded-lg hover:bg-muted/20 transition-colors"
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
            className="gap-1.5 text-xs"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </Button>
        )}
      </div>

      {/* Horizontal Scrollable Wallet Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {/* Total Balance Card */}
        <Card className="min-w-[280px] md:min-w-[320px] bg-gradient-to-br from-primary/90 to-primary/70 border-none shadow-lg snap-start">
          <div className="p-6 text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <WalletIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Total Aset</p>
                  <p className="text-xs opacity-70">{wallets.length} dompet</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-3xl md:text-4xl font-bold">
                {isVisible ? formatCurrency(totalBalance) : maskedAmount(totalBalance)}
              </p>
            </div>
          </div>
        </Card>

        {/* Individual Wallet Cards */}
        {wallets.map((wallet) => (
          <Card
            key={wallet.id}
            className="min-w-[280px] md:min-w-[320px] border-border/50 shadow-md hover:shadow-lg transition-shadow snap-start"
            style={{
              background: `linear-gradient(135deg, ${wallet.color || '#10b981'}15 0%, ${wallet.color || '#10b981'}05 100%)`
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                    style={{
                      backgroundColor: `${wallet.color || '#10b981'}20`,
                    }}
                  >
                    {wallet.icon || '💰'}
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{wallet.name}</h3>
                    {wallet.is_default && (
                      <span className="text-xs text-muted-foreground">Default</span>
                    )}
                  </div>
                </div>

                {/* More Options Menu */}
                {onEditWallet && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditWallet(wallet)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Dompet
                      </DropdownMenuItem>
                      {!wallet.is_default && (
                        <DropdownMenuItem onClick={() => onEditWallet(wallet)}>
                          <Star className="mr-2 h-4 w-4" />
                          Jadikan Default
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="mt-6">
                <p className="text-sm text-muted-foreground mb-1">Saldo</p>
                <p className="text-2xl md:text-3xl font-semibold text-foreground">
                  {isVisible ? formatCurrency(wallet.balance) : maskedAmount(wallet.balance)}
                </p>
              </div>
            </div>
          </Card>
        ))}

        {/* Add Wallet Card (optional placeholder) */}
        {onAddWallet && wallets.length < 5 && (
          <Card
            className="min-w-[280px] md:min-w-[320px] border-2 border-dashed border-border/50 bg-muted/20 hover:bg-muted/30 cursor-pointer transition-colors snap-start"
            onClick={onAddWallet}
          >
            <div className="p-6 h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-medium">Tambah Dompet</p>
                <p className="text-xs">Buat dompet baru</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Scrollbar hint on mobile */}
      {wallets.length > 1 && (
        <div className="flex justify-center md:hidden">
          <div className="flex gap-1">
            {[...Array(Math.min(wallets.length + 1, 4))].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

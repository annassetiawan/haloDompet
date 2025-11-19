"use client";

import { useState } from 'react'
import { Eye, EyeOff, TrendingDown } from 'lucide-react'

interface SaldoDisplayProps {
  currentBalance: number
  initialBalance?: number
  isLoading?: boolean
}

export function SaldoDisplay({ currentBalance, initialBalance, isLoading = false }: SaldoDisplayProps) {
  const [isVisible, setIsVisible] = useState(true)

  const formattedBalance = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(currentBalance)

  const totalSpent = initialBalance ? initialBalance - currentBalance : 0
  const spentPercentage = initialBalance ? ((totalSpent / initialBalance) * 100).toFixed(1) : 0

  // Generate masked text based on the length of formatted number
  const maskedBalance = 'Rp ' + '•'.repeat(formattedBalance.replace(/[^0-9]/g, '').length)
  const maskedSpent = 'Rp ' + '•'.repeat(totalSpent.toString().length)

  return (
    <div className="bg-gradient-to-br from-card/80 to-card/50 dark:from-card/90 dark:to-card/70 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Saldo Saat Ini</p>
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-48 bg-muted/20 rounded animate-pulse" />
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-normal text-foreground">
                  {isVisible ? formattedBalance : maskedBalance}
                </h2>
                <button
                  onClick={() => setIsVisible(!isVisible)}
                  className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                  aria-label={isVisible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
                >
                  {isVisible ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Spending Summary */}
      {initialBalance && !isLoading && (
        <div className="pt-4 border-t border-border/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-accent" />
              <span>Total Pengeluaran</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-normal text-foreground">
                {isVisible
                  ? new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(totalSpent)
                  : maskedSpent
                }
              </span>
              {isVisible && (
                <span className="text-xs text-muted-foreground">
                  ({spentPercentage}%)
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {isVisible && (
            <div className="mt-2 h-2 bg-muted/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(parseFloat(spentPercentage.toString()), 100)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

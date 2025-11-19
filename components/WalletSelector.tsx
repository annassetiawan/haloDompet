"use client";

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Wallet } from '@/types'

interface WalletSelectorProps {
  wallets: Wallet[]
  selectedWalletId: string | null
  onSelectWallet: (walletId: string) => void
  isLoading?: boolean
}

export function WalletSelector({
  wallets,
  selectedWalletId,
  onSelectWallet,
  isLoading = false
}: WalletSelectorProps) {
  // Get default wallet if no selection
  const defaultWallet = wallets.find(w => w.is_default)
  const currentSelection = selectedWalletId || defaultWallet?.id || wallets[0]?.id

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Pilih Dompet</Label>
        <div className="flex gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 flex-1 bg-muted/20 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (wallets.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-muted/20 border border-border">
        <p className="text-sm text-muted-foreground">
          Tidak ada dompet tersedia
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label>Pilih Dompet</Label>
      <RadioGroup
        value={currentSelection}
        onValueChange={onSelectWallet}
        className="grid grid-cols-2 gap-2"
      >
        {wallets.map((wallet) => (
          <div key={wallet.id} className="relative">
            <RadioGroupItem
              value={wallet.id}
              id={wallet.id}
              className="peer sr-only"
            />
            <Label
              htmlFor={wallet.id}
              className="flex flex-col items-start gap-2 rounded-lg border-2 border-muted p-3 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 transition-all"
              style={{
                background: currentSelection === wallet.id
                  ? `linear-gradient(135deg, ${wallet.color || '#10b981'}20 0%, ${wallet.color || '#10b981'}10 100%)`
                  : undefined
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{
                    backgroundColor: `${wallet.color || '#10b981'}20`,
                  }}
                >
                  {wallet.icon || '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm leading-none truncate">
                    {wallet.name}
                  </p>
                  {wallet.is_default && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Default
                    </p>
                  )}
                </div>
              </div>
              <div className="w-full">
                <p className="text-xs text-muted-foreground truncate">
                  Rp {wallet.balance.toLocaleString('id-ID')}
                </p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

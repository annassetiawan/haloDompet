'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Wallet } from '@/types'
import { toast } from 'sonner'
import { Loader2, ArrowRightLeft } from 'lucide-react'

interface TransferFormProps {
  wallets: Wallet[]
  onSuccess: () => void
  onCancel: () => void
  defaultSourceWalletId?: string
}

export function TransferForm({
  wallets,
  onSuccess,
  onCancel,
  defaultSourceWalletId,
}: TransferFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sourceWalletId, setSourceWalletId] = useState<string>(
    defaultSourceWalletId || ''
  )
  const [targetWalletId, setTargetWalletId] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState<string>('')

  // Set default source wallet if available and not set
  useEffect(() => {
    if (wallets.length > 0 && !sourceWalletId) {
      if (defaultSourceWalletId) {
        setSourceWalletId(defaultSourceWalletId)
      } else {
        const defaultWallet = wallets.find((w) => w.is_default)
        setSourceWalletId(defaultWallet ? defaultWallet.id : wallets[0].id)
      }
    }
  }, [wallets, sourceWalletId, defaultSourceWalletId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceWalletId || !targetWalletId) {
      toast.error('Pilih dompet asal dan tujuan')
      return
    }

    if (sourceWalletId === targetWalletId) {
      toast.error('Dompet asal dan tujuan tidak boleh sama')
      return
    }

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Masukkan jumlah transfer yang valid')
      return
    }

    // Check balance
    const sourceWallet = wallets.find((w) => w.id === sourceWalletId)
    if (sourceWallet && sourceWallet.balance < numAmount) {
      toast.error('Saldo dompet asal tidak mencukupi')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/transaction/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_wallet_id: sourceWalletId,
          target_wallet_id: targetWalletId,
          amount: numAmount,
          date,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal melakukan transfer')
      }

      toast.success('Transfer berhasil!')
      onSuccess()
    } catch (error) {
      console.error('Transfer error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Gagal melakukan transfer'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source-wallet">Dari Dompet</Label>
          <Select value={sourceWalletId} onValueChange={setSourceWalletId}>
            <SelectTrigger id="source-wallet">
              <SelectValue placeholder="Pilih dompet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id}>
                  {wallet.name} (Rp {wallet.balance.toLocaleString('id-ID')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-wallet">Ke Dompet</Label>
          <Select value={targetWalletId} onValueChange={setTargetWalletId}>
            <SelectTrigger id="target-wallet">
              <SelectValue placeholder="Pilih dompet" />
            </SelectTrigger>
            <SelectContent>
              {wallets
                .filter((w) => w.id !== sourceWalletId)
                .map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Nominal Transfer</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            Rp
          </span>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            className="pl-9"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (Opsional)</Label>
        <Textarea
          id="notes"
          placeholder="Contoh: Bayar utang, Tabungan bulan ini"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transfer Sekarang
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

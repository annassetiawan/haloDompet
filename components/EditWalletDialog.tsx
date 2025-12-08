"use client";

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Wallet } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface EditWalletDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wallet: Wallet | null
  onSuccess?: () => void
}



export function EditWalletDialog({ open, onOpenChange, wallet, onSuccess }: EditWalletDialogProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Reset form when wallet changes
  useEffect(() => {
    if (wallet) {
      setName(wallet.name)
    }
  }, [wallet])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!wallet) return

    if (!name.trim()) {
      toast.error('Nama dompet harus diisi')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/wallet/${wallet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          icon: wallet.icon || '💰', // Maintain existing icon
          color: '#000000', // Default Black
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate dompet')
      }

      toast.success(`Dompet "${name}" berhasil diupdate!`)

      // Close dialog
      onOpenChange(false)

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error updating wallet:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengupdate dompet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!wallet) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/wallet/${wallet.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus dompet')
      }

      toast.success(`Dompet "${wallet.name}" berhasil dihapus`)

      // Close dialogs
      setShowDeleteDialog(false)
      onOpenChange(false)

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error deleting wallet:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus dompet')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSetDefault = async () => {
    if (!wallet) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/wallet/${wallet.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_default: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengatur dompet default')
      }

      toast.success(`"${wallet.name}" sekarang menjadi dompet default`)

      // Close dialog
      onOpenChange(false)

      // Trigger success callback
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error setting default wallet:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal mengatur dompet default')
    } finally {
      setIsLoading(false)
    }
  }

  if (!wallet) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95%] max-w-md max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Dompet</DialogTitle>
            <DialogDescription>
              Ubah detail dompet Anda
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 py-4">
              {/* Wallet Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-wallet-name">Nama Dompet</Label>
                <Input
                  id="edit-wallet-name"
                  placeholder="Contoh: Bank BCA, GoPay, Tunai"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {/* Balance Info (Read-only) */}
              <div className="space-y-2">
                <Label>Saldo Saat Ini</Label>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-lg font-semibold">
                    Rp {wallet.balance.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saldo diupdate otomatis saat transaksi
                  </p>
                </div>
              </div>

              {/* Default Wallet Toggle */}
              {!wallet.is_default && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSetDefault}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Jadikan Dompet Default
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Transaksi baru akan otomatis menggunakan dompet default
                  </p>
                </div>
              )}

              {wallet.is_default && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    ✓ Ini adalah dompet default Anda
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <div className="flex-1">
                {!wallet.is_default && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dompet?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus dompet "{wallet?.name}"?
              <br />
              <br />
              <strong>Transaksi yang terkait dengan dompet ini akan kehilangan referensi wallet.</strong>
              <br />
              <br />
              Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus Dompet'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BottomNav } from '@/components/BottomNav'
import { AddWalletDialog } from '@/components/AddWalletDialog'
import { EditWalletDialog } from '@/components/EditWalletDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Save, Loader2, Wallet, Plus, Edit, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile, Wallet as WalletType } from '@/types'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingWallets, setIsLoadingWallets] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [mode, setMode] = useState<'simple' | 'webhook'>('simple')
  const [webhookUrl, setWebhookUrl] = useState('')

  // Wallet management state
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false)
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [walletToDelete, setWalletToDelete] = useState<WalletType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
    } else {
      setUser(user)
      loadUserProfile()
      loadWallets()
    }
  }

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user')
      const data = await response.json()

      if (response.ok && data.user) {
        setUserProfile(data.user)
        setMode(data.user.mode || 'simple')
        setWebhookUrl(data.user.webhook_url || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWallets = async () => {
    try {
      setIsLoadingWallets(true)
      const response = await fetch('/api/wallet')
      const data = await response.json()

      if (response.ok) {
        setWallets(data.wallets || [])
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
    } finally {
      setIsLoadingWallets(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          webhook_url: mode === 'webhook' ? webhookUrl : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      // Update localStorage for backward compatibility
      localStorage.setItem('halodompet_mode', mode)
      if (mode === 'webhook' && webhookUrl) {
        localStorage.setItem('halodompet_webhook_url', webhookUrl)
      }

      toast.success('Pengaturan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Gagal menyimpan pengaturan. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditWallet = (wallet: WalletType) => {
    setSelectedWallet(wallet)
    setIsEditWalletOpen(true)
  }

  const handleDeleteWallet = (wallet: WalletType) => {
    setWalletToDelete(wallet)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteWallet = async () => {
    if (!walletToDelete) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/wallet/${walletToDelete.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete wallet')
      }

      toast.success(`Dompet "${walletToDelete.name}" berhasil dihapus`)
      loadWallets() // Reload wallets
      setIsDeleteDialogOpen(false)
      setWalletToDelete(null)
    } catch (error) {
      console.error('Error deleting wallet:', error)
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus dompet')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleWalletSuccess = () => {
    loadWallets() // Reload wallets after add/edit
  }

  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance.toString()), 0)

  return (
    <main className="relative min-h-screen flex flex-col p-4 md:p-8 pb-20 md:pb-8 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
      <div className="relative z-10 w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 animate-slide-down">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-normal text-foreground">
              Pengaturan
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola dompet dan preferensi akun Anda
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 animate-scale-in">
            {/* Account Info */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h2 className="text-lg font-normal text-foreground mb-4">
                Informasi Akun
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-base font-normal text-foreground mt-1">
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">User ID</label>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {user?.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Wallet Management Section */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-normal text-foreground">
                    Dompet Saya
                  </h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddWalletOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Buat Dompet
                </Button>
              </div>

              {/* Total Balance */}
              <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Saldo</p>
                <p className="text-2xl font-semibold text-foreground">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(totalBalance)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dari {wallets.length} dompet
                </p>
              </div>

              {/* Wallets List */}
              {isLoadingWallets ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : wallets.length === 0 ? (
                <div className="text-center py-8 px-4 border border-dashed border-border rounded-lg">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Belum ada dompet
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddWalletOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Dompet Pertama
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.id}
                      className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background/50 hover:bg-accent/50 transition-colors"
                    >
                      {/* Icon & Color */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          backgroundColor: `${wallet.color || '#10b981'}20`,
                        }}
                      >
                        {wallet.icon || '💰'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground truncate">
                            {wallet.name}
                          </h3>
                          {wallet.is_default && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                          }).format(parseFloat(wallet.balance.toString()))}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditWallet(wallet)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWallet(wallet)}
                          className="h-8 w-8 p-0 hover:text-red-500"
                          disabled={wallets.length === 1}
                          title={wallets.length === 1 ? 'Tidak bisa hapus dompet terakhir' : 'Hapus dompet'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning if only 1 wallet */}
              {wallets.length === 1 && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Minimal harus ada 1 dompet aktif. Buat dompet baru sebelum menghapus yang ini.
                  </p>
                </div>
              )}
            </div>

            {/* Mode Settings */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h2 className="text-lg font-normal text-foreground mb-4">
                Mode Penyimpanan
              </h2>
              <div className="space-y-3">
                {/* Simple Mode */}
                <Button
                  type="button"
                  variant={mode === 'simple' ? 'default' : 'outline'}
                  onClick={() => setMode('simple')}
                  className="w-full h-auto p-4 justify-start"
                >
                  <div className="flex items-start gap-3 text-left">
                    <div className="text-2xl">📱</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base">Mode Sederhana</h3>
                      <p className="text-xs opacity-80 mt-1 font-normal">
                        Data tersimpan di database Supabase
                      </p>
                    </div>
                  </div>
                </Button>

                {/* Webhook Mode */}
                <Button
                  type="button"
                  variant={mode === 'webhook' ? 'default' : 'outline'}
                  onClick={() => setMode('webhook')}
                  className="w-full h-auto p-4 justify-start"
                >
                  <div className="flex items-start gap-3 text-left">
                    <div className="text-2xl">🔗</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-base">Mode Webhook</h3>
                      <p className="text-xs opacity-80 mt-1 font-normal">
                        Kirim data ke n8n atau layanan lainnya
                      </p>
                    </div>
                  </div>
                </Button>

                {/* Webhook URL Input */}
                {mode === 'webhook' && (
                  <div className="pt-2">
                    <label htmlFor="webhook-url" className="text-sm text-muted-foreground mb-2 block">
                      URL Webhook
                    </label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://your-n8n-instance.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="h-12"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || (mode === 'webhook' && !webhookUrl)}
              className="w-full h-12 gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dompet?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus dompet <strong>{walletToDelete?.name}</strong>?
              <br /><br />
              Semua transaksi yang terkait dengan dompet ini akan kehilangan referensi wallet-nya.
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWallet}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

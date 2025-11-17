"use client";

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/types'

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [initialBalance, setInitialBalance] = useState('')
  const [mode, setMode] = useState<'simple' | 'webhook'>('simple')
  const [webhookUrl, setWebhookUrl] = useState('')

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
    }
  }

  const loadUserProfile = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user')
      const data = await response.json()

      if (response.ok && data.user) {
        setUserProfile(data.user)
        setInitialBalance(data.user.initial_balance?.toString() || '')
        setMode(data.user.mode || 'simple')
        setWebhookUrl(data.user.webhook_url || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
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
          initial_balance: parseFloat(initialBalance),
          mode,
          webhook_url: mode === 'webhook' ? webhookUrl : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      // Update localStorage for backward compatibility
      localStorage.setItem('halodompet_initial_balance', initialBalance)
      localStorage.setItem('halodompet_mode', mode)
      if (mode === 'webhook' && webhookUrl) {
        localStorage.setItem('halodompet_webhook_url', webhookUrl)
      }

      alert('Pengaturan berhasil disimpan!')
      router.push('/')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Gagal menyimpan pengaturan. Silakan coba lagi.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/20 dark:to-muted/10">
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
              Kelola preferensi akun Anda
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

            {/* Balance Settings */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h2 className="text-lg font-normal text-foreground mb-4">
                Pengaturan Saldo
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="initial-balance" className="text-sm text-muted-foreground mb-2 block">
                    Saldo Awal (Rp)
                  </label>
                  <Input
                    id="initial-balance"
                    type="number"
                    placeholder="1000000"
                    value={initialBalance}
                    onChange={(e) => setInitialBalance(e.target.value)}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Saldo saat ini: {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(userProfile?.current_balance || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Settings */}
            <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
              <h2 className="text-lg font-normal text-foreground mb-4">
                Mode Penyimpanan
              </h2>
              <div className="space-y-3">
                {/* Simple Mode */}
                <button
                  onClick={() => setMode('simple')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    mode === 'simple'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📱</div>
                    <div>
                      <h3 className="font-normal text-foreground">Mode Sederhana</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Data tersimpan di database Supabase
                      </p>
                    </div>
                  </div>
                </button>

                {/* Webhook Mode */}
                <button
                  onClick={() => setMode('webhook')}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    mode === 'webhook'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔗</div>
                    <div>
                      <h3 className="font-normal text-foreground">Mode Webhook</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Kirim data ke n8n atau layanan lainnya
                      </p>
                    </div>
                  </div>
                </button>

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
    </main>
  )
}

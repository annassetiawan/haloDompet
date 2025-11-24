"use client"

import { useState, useEffect } from 'react'
import { usePWAInstallPrompt } from '@/hooks/usePWAInstallPrompt'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Smartphone, Zap, Shield } from 'lucide-react'

/**
 * Komponen banner untuk mengajak user menginstall PWA
 * Muncul di bagian bawah layar ketika PWA dapat diinstall
 */
export function PWAInstallBanner() {
  const { isInstallable, promptToInstall } = usePWAInstallPrompt()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Cek apakah user sudah pernah dismiss banner
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }
  }, [])

  useEffect(() => {
    // Tampilkan banner dengan delay untuk animasi smooth
    if (isInstallable && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000) // Delay 2 detik setelah page load

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isDismissed])

  const handleInstall = async () => {
    await promptToInstall()
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Simpan ke localStorage agar tidak muncul lagi dalam 7 hari
    const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 hari
    localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString())
    setIsDismissed(true)
  }

  // Jangan render jika tidak installable atau sudah dismissed
  if (!isInstallable || isDismissed) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-500 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-2xl backdrop-blur-sm">
        {/* Tombol Close */}
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 rounded-full p-1 transition-colors hover:bg-primary/10"
          aria-label="Tutup"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-4 p-4">
          {/* Icon Aplikasi */}
          <div className="flex-shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
              <Smartphone className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          {/* Konten */}
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold leading-tight text-foreground">
              Pasang HaloDompet Lite
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Akses lebih cepat, hemat kuota, dan aman langsung dari layar utama HP-mu.
            </p>

            {/* Fitur Highlights */}
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                <span>Super Cepat</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5 text-green-500" />
                <span>Aman</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                <span>Hemat Kuota</span>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 font-semibold shadow-md transition-all hover:shadow-lg"
              >
                Install Sekarang
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-muted-foreground"
              >
                Nanti Saja
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient line */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { usePWAInstallPrompt } from '@/hooks/usePWAInstallPrompt'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Smartphone } from 'lucide-react'

/**
 * Komponen dialog simple untuk mengajak user menginstall PWA
 * Muncul di tengah layar ketika PWA dapat diinstall
 * HANYA untuk user yang sudah login
 */
export function PWAInstallBanner() {
  const { isInstallable, promptToInstall } = usePWAInstallPrompt()
  const [isOpen, setIsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const [isDevMode, setIsDevMode] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Deteksi development mode
    const isDev =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    setIsDevMode(isDev)

    // Deteksi iOS
    const iOS =
      typeof window !== 'undefined' &&
      /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Cek authentication status
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const isAuth = !!user
      setIsAuthenticated(isAuth)
    }

    checkAuth()

    // Di production, cek apakah user sudah pernah dismiss banner
    if (!isDev) {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        setIsDismissed(true)
      }
    }
  }, [])

  useEffect(() => {
    // Di dev mode: skip auth check untuk testing
    // Di production: HANYA tampilkan jika user sudah login
    if (!isDevMode && !isAuthenticated) {
      return
    }

    // Di dev mode: selalu tampilkan dialog untuk testing (bahkan di iOS)
    // Di production: hanya tampilkan jika installable dan belum dismissed
    const shouldShow = isDevMode || (isInstallable && !isDismissed)

    if (shouldShow) {
      const delay = isDevMode ? 1000 : 2000

      const timer = setTimeout(() => {
        setIsOpen(true)
      }, delay)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isInstallable, isDismissed, isDevMode, isAuthenticated])

  const handleInstall = async () => {
    // Untuk iOS, tampilkan instruksi manual
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (isIOS) {
      // iOS tidak support beforeinstallprompt, tampilkan instruksi
      alert(
        '📱 Untuk install di iOS:\n\n' +
        '1. Tap tombol Share (ikon kotak dengan panah)\n' +
        '2. Scroll dan pilih "Add to Home Screen"\n' +
        '3. Tap "Add" untuk konfirmasi'
      )
      setIsOpen(false)
      // Simpan dismiss agar tidak muncul terus
      if (!isDevMode) {
        const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000
        localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString())
        setIsDismissed(true)
      }
    } else {
      // Android/Chrome - gunakan native prompt
      await promptToInstall()
      setIsOpen(false)
    }
  }

  const handleDismiss = () => {
    setIsOpen(false)
    // Di production, simpan ke localStorage agar tidak muncul lagi dalam 7 hari
    if (!isDevMode) {
      const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 hari
      localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString())
      setIsDismissed(true)
    }
  }

  // Prevent hydration mismatch - don't render until mounted on client
  if (!isMounted) {
    return null
  }

  // Di dev mode: skip auth check untuk testing
  // Di production: jangan render jika user belum login
  if (!isDevMode && !isAuthenticated) {
    return null
  }

  // Di dev mode: selalu render untuk testing (termasuk di iOS!)
  // Di production: jangan render jika tidak installable atau sudah dismissed
  if (!isDevMode && (!isInstallable || isDismissed)) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        {/* Dev Mode Badge */}
        {isDevMode && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
            DEV
          </div>
        )}

        <DialogHeader className="items-center space-y-4 pb-2 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2 px-2">
            <DialogTitle className="text-xl">Pasang HaloDompet</DialogTitle>
            <DialogDescription className="text-center text-sm leading-relaxed">
              {isIOS
                ? 'Install aplikasi ke home screen untuk akses lebih cepat. Tap tombol Share, lalu "Add to Home Screen".'
                : 'Install aplikasi ke home screen untuk akses lebih cepat dan pengalaman lebih baik.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 pt-2 sm:flex-col">
          <Button onClick={handleInstall} className="w-full" size="lg">
            {isIOS ? 'Lihat Cara Install' : 'Install Sekarang'}
          </Button>
          <Button onClick={handleDismiss} variant="ghost" className="w-full" size="lg">
            Nanti Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

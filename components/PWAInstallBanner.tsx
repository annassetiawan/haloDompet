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

  useEffect(() => {
    // Deteksi development mode
    const isDev =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1')
    setIsDevMode(isDev)

    console.log('🔧 PWA Banner - Dev Mode:', isDev)

    // Cek authentication status
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const isAuth = !!user
      setIsAuthenticated(isAuth)
      console.log('🔐 PWA Banner - Authenticated:', isAuth)
    }

    checkAuth()

    // Di production, cek apakah user sudah pernah dismiss banner
    if (!isDev) {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        setIsDismissed(true)
        console.log('❌ PWA Banner - Dismissed in localStorage')
      }
    }
  }, [])

  useEffect(() => {
    // Di dev mode: skip auth check untuk testing
    // Di production: HANYA tampilkan jika user sudah login
    if (!isDevMode && !isAuthenticated) {
      console.log('⏸️  PWA Dialog - Waiting for authentication')
      return
    }

    // Di dev mode: selalu tampilkan dialog untuk testing
    // Di production: hanya tampilkan jika installable dan belum dismissed
    const shouldShow = isDevMode || (isInstallable && !isDismissed)

    console.log('🎯 PWA Dialog - Should Show:', shouldShow, {
      isDevMode,
      isInstallable,
      isDismissed,
      isAuthenticated,
    })

    if (shouldShow) {
      const timer = setTimeout(() => {
        console.log('✅ PWA Dialog - Showing dialog!')
        setIsOpen(true)
      }, isDevMode ? 1000 : 2000) // Dev: 1 detik, Production: 2 detik

      return () => clearTimeout(timer)
    }
  }, [isInstallable, isDismissed, isDevMode, isAuthenticated])

  const handleInstall = async () => {
    await promptToInstall()
    setIsOpen(false)
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

  // Di dev mode: skip auth check untuk testing
  // Di production: jangan render jika user belum login
  if (!isDevMode && !isAuthenticated) {
    console.log('🚫 PWA Dialog - Not rendering (not authenticated)')
    return null
  }

  // Di dev mode: selalu render untuk testing
  // Di production: jangan render jika tidak installable atau sudah dismissed
  if (!isDevMode && (!isInstallable || isDismissed)) {
    console.log('🚫 PWA Dialog - Not rendering (not installable or dismissed)')
    return null
  }

  console.log('🎨 PWA Dialog - Rendering component')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        {/* Dev Mode Badge */}
        {isDevMode && (
          <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
            DEV
          </div>
        )}

        <DialogHeader className="items-center space-y-4 text-center">
          {/* Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <DialogTitle className="text-xl">Pasang HaloDompet</DialogTitle>
            <DialogDescription className="text-center">
              Install aplikasi ke home screen untuk akses lebih cepat dan pengalaman lebih baik.
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleInstall} className="w-full">
            Install Sekarang
          </Button>
          <Button onClick={handleDismiss} variant="ghost" className="w-full">
            Nanti Saja
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

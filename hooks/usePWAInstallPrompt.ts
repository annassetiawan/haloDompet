"use client"

import { useEffect, useState } from 'react'

// Interface untuk BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

/**
 * Custom hook untuk menangani PWA install prompt
 * Mendeteksi kemampuan instalasi dan menyediakan fungsi untuk memunculkan prompt
 */
export function usePWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Handler untuk event beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Mencegah mini-infobar bawaan browser muncul
      e.preventDefault()

      // Simpan event untuk digunakan nanti
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      console.log('PWA install prompt tersedia')
    }

    // Tambahkan event listener
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Cleanup: hapus event listener saat component unmount
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  /**
   * Fungsi untuk memunculkan install prompt
   */
  const promptToInstall = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt tidak tersedia')
      return
    }

    try {
      // Tampilkan prompt install
      await deferredPrompt.prompt()

      // Tunggu respon dari user
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        console.log('User menerima install prompt')
      } else {
        console.log('User menolak install prompt')
      }

      // Reset deferred prompt setelah digunakan
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error saat menampilkan install prompt:', error)
    }
  }

  return {
    isInstallable: !!deferredPrompt,
    promptToInstall,
  }
}

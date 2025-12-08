"use client"

import { useState } from 'react'
import { HelpCircle, Smartphone } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

/**
 * Button help untuk menjelaskan tentang PWA dan cara install
 * Ditampilkan di atas bottom navigation (mobile only)
 */
export function PWAHelpButton() {
  const [isOpen, setIsOpen] = useState(false)

  // Deteksi iOS untuk memberikan instruksi yang berbeda
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

  return (
    <>
      {/* Help Button - Floating above bottom nav */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
        aria-label="Bantuan PWA"
      >
        <HelpCircle className="h-6 w-6" />
      </button>

      {/* Help Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader className="items-center space-y-4 pb-2 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>

            {/* Title & Description */}
            <div className="space-y-3 px-2">
              <DialogTitle className="text-xl">Tentang HaloDompet</DialogTitle>
              <div className="space-y-3 text-left text-sm leading-relaxed text-muted-foreground">
                <p>
                  <strong className="text-foreground">HaloDompet mengadopsi teknologi Progressive Web App (PWA)</strong> -
                  untuk memberikan pengalaman pengguna yang cepat dan responsif. Aplikasi ini dapat diinstal langsung ke perangkat Anda layaknya aplikasi native
                </p>

                <div>
                  <p className="font-semibold text-foreground mb-2">Cara Install:</p>
                  {isIOS ? (
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Tap tombol <strong>Share</strong> (ikon kotak dengan panah) di Safari</li>
                      <li>Scroll ke bawah dan pilih <strong>"Add to Home Screen"</strong></li>
                      <li>Tap <strong>"Add"</strong> untuk konfirmasi</li>
                    </ol>
                  ) : (
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Tap menu browser (⋮) di pojok kanan atas</li>
                      <li>Pilih <strong>"Add to Home screen"</strong> atau <strong>"Install app"</strong></li>
                      <li>Tap <strong>"Install"</strong> untuk konfirmasi</li>
                    </ol>
                  )}
                </div>

                <div>
                  <p className="font-semibold text-foreground mb-1">Keuntungan:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Akses lebih cepat dari home screen</li>
                    <li>Pengalaman seperti aplikasi native</li>
                    <li>Bisa dibuka tanpa membuka browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="pt-2">
            <Button onClick={() => setIsOpen(false)} className="w-full" size="lg">
              Mengerti
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

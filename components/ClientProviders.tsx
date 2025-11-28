'use client'

// PHASE 3 FIX: Client Component wrapper untuk non-critical UI
// Next.js 16 Server Components tidak support next/dynamic dengan ssr: false

import dynamic from 'next/dynamic'

// Lazy load Toaster (notification system)
const Toaster = dynamic(
  () => import('sonner').then((mod) => ({ default: mod.Toaster })),
  { ssr: false }
)

// Lazy load PWA Install Banner
const PWAInstallBannerLazy = dynamic(
  () => import('@/components/PWAInstallBannerLazy').then((mod) => ({ default: mod.PWAInstallBannerLazy })),
  { ssr: false }
)

export function ClientProviders() {
  return (
    <>
      <Toaster richColors position="top-center" />
      <PWAInstallBannerLazy />
    </>
  )
}

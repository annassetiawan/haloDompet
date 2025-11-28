'use client'

import dynamic from 'next/dynamic'

// Lazy load PWAInstallBanner - not critical for initial page load
export const PWAInstallBannerLazy = dynamic(
  () => import('@/components/PWAInstallBanner').then(mod => ({ default: mod.PWAInstallBanner })),
  {
    ssr: false,
  }
)

import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { PWAInstallBannerLazy } from '@/components/PWAInstallBannerLazy'
import './globals.css'

// OPTIMIZED: Font loading strategy untuk better LCP
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true, // Keep preload for main font only
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: true, // Enable to reduce CLS on font swap
})

// OPTIMIZED: Monospace font tidak di-preload (hanya untuk code blocks)
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'optional', // Use optional for non-critical font
  preload: false, // No preload untuk reduce blocking resources
  fallback: ['ui-monospace', 'Courier New', 'monospace'],
  adjustFontFallback: true, // Enable to reduce CLS
})

export const metadata: Metadata = {
  title: 'HaloDompet - Voice-powered Expense Tracker',
  description: 'Catat keuangan secara otomatis dengan suara menggunakan AI',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HaloDompet',
  },
}

export const viewport: Viewport = {
  themeColor: '#090909',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* OPTIMIZED: Preload critical LCP asset (avatar placeholder) */}
        <link
          rel="preload"
          href="/avatar-placeholder.svg"
          as="image"
          type="image/svg+xml"
          fetchPriority="high"
        />

        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
        {/* OPTIMIZED: Eruda mobile debugger - Only in development to reduce production overhead */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/eruda';
                  script.onload = function() {
                    if (window.eruda) {
                      window.eruda.init();
                      console.log('Eruda mobile debugger loaded');
                    }
                  };
                  document.head.appendChild(script);
                })();
              `,
            }}
          />
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        {children}
        <Toaster richColors position="top-center" />
        <SpeedInsights />
        <Analytics />
        <PWAInstallBannerLazy />
      </body>
    </html>
  )
}

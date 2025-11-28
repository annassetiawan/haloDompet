import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import { PWAInstallBannerLazy } from '@/components/PWAInstallBannerLazy'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  adjustFontFallback: false,
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['ui-monospace', 'monospace'],
  adjustFontFallback: false,
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
        {/* Eruda mobile debugger - Only load in development or when debug=true in URL */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const hasDebugParam = window.location.search.includes('debug=true');

                if (isDev || hasDebugParam) {
                  var script = document.createElement('script');
                  script.src = 'https://cdn.jsdelivr.net/npm/eruda';
                  script.onload = function() {
                    if (window.eruda) {
                      window.eruda.init();
                      console.log('Eruda mobile debugger loaded');
                    }
                  };
                  document.head.appendChild(script);
                }
              })();
            `,
          }}
        />
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

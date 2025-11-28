'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Target, BarChart3, Sparkles, Camera } from 'lucide-react'

interface BottomNavProps {
  onScanClick?: () => void
}

export function BottomNav({ onScanClick }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
        >
          <div
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </div>
        </Link>

        <Link
          href="/budget"
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
        >
          <div
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/budget' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Target className="h-5 w-5" />
            <span className="text-xs font-medium">Budget</span>
          </div>
        </Link>

        {/* Scan Struk Button - Center with special styling */}
        <button
          onClick={onScanClick}
          disabled={!onScanClick}
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative -mt-8"
        >
          <div className="flex flex-col items-center justify-center gap-1 transition-all">
            <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-4 border-background">
              <Camera className="h-7 w-7" />
            </div>
          </div>
        </button>

        <Link
          href="/advisor"
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
        >
          <div
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/advisor' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-medium">Advisor</span>
          </div>
        </Link>

        <Link
          href="/reports"
          className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
        >
          <div
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${pathname === '/reports' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-medium">Laporan</span>
          </div>
        </Link>
      </div>
    </nav>
  )
}

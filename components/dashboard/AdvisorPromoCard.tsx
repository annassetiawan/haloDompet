'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Bot, Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdvisorPromoCardProps {
  onAnalyze?: () => void
  isLoading?: boolean
}

export function AdvisorPromoCard({ onAnalyze, isLoading = false }: AdvisorPromoCardProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onAnalyze) {
      onAnalyze()
    } else {
      router.push('/advisor')
    }
  }

  return (
    <div 
      className="inline-flex items-center justify-center w-full"
      onClick={handleClick}
    >
      <div className="relative group cursor-pointer active:scale-95 transition-all duration-200">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-200" />
        <div className="relative flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-white/10 hover:border-violet-500/50 dark:hover:border-violet-500/50 transition-colors shadow-sm">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          )}
          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            {isLoading ? 'Menganalisa...' : 'Analisa AI'}
          </span>
        </div>
      </div>
    </div>
  )
}

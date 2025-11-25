'use client'

import { Clock, Mail } from 'lucide-react'
import { shouldShowWarning, getDaysLeft, type UserProfile } from '@/lib/trial'
import { Button } from './ui/button'

interface TrialWarningBannerProps {
  profile: UserProfile | null
}

export function TrialWarningBanner({ profile }: TrialWarningBannerProps) {
  // Show trial warning banner if needed
  if (!profile || !shouldShowWarning(profile)) {
    return null
  }

  const daysLeft = getDaysLeft(profile.trial_ends_at)

  const handleContactAdmin = () => {
    if (typeof window !== 'undefined') {
      window.open('mailto:support@halodompet.com?subject=Trial Extension Request', '_blank')
    }
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex-shrink-0">
          <Clock className="h-5 w-5 text-amber-500" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
            {daysLeft === 1 ? 'Trial kamu tinggal 1 hari lagi!' : `Trial kamu tinggal ${daysLeft} hari lagi`}
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-200 mb-3">
            Hubungi admin untuk memperpanjang trial atau mengaktifkan akun sebelum akses berakhir.
          </p>

          <Button
            onClick={handleContactAdmin}
            size="sm"
            variant="outline"
            className="gap-2 h-8 text-xs border-amber-500/30 hover:bg-amber-500/10"
          >
            <Mail className="h-3 w-3" />
            Hubungi Admin
          </Button>
        </div>
      </div>
    </div>
  )
}

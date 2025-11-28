'use client'

import { type UserProfile } from '@/lib/trial'

interface TrialWarningBannerProps {
  profile: UserProfile | null
}

/**
 * Trial Warning Banner Component
 * DISABLED: Trial system has been disabled - all users have unlimited access
 * This component will always return null (no warning banner shown)
 */
export function TrialWarningBanner({ profile }: TrialWarningBannerProps) {
  // Trial system disabled - no warning banner needed
  return null
}

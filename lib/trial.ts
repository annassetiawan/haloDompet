/**
 * Trial System Helper Functions
 *
 * Provides utilities for checking and managing user trial status
 */

export type AccountStatus = 'trial' | 'active' | 'expired' | 'blocked'

export interface UserProfile {
  id: string
  email: string
  account_status: AccountStatus
  trial_ends_at: string | null
  trial_started_at: string | null
  initial_balance: number
  current_balance: number
}

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(profile: UserProfile | null): boolean {
  if (!profile) return false

  // Blocked users cannot access
  if (profile.account_status === 'blocked') return true

  // Expired status
  if (profile.account_status === 'expired') return true

  // Active users have unlimited access
  if (profile.account_status === 'active') return false

  // Check trial end date
  if (profile.account_status === 'trial' && profile.trial_ends_at) {
    const now = new Date()
    const endDate = new Date(profile.trial_ends_at)
    return endDate < now
  }

  return false
}

/**
 * Get number of days left in trial
 * Returns negative number if expired
 */
export function getDaysLeft(trialEndsAt: string | null): number {
  if (!trialEndsAt) return 0

  const now = new Date()
  const endDate = new Date(trialEndsAt)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if user should see warning banner (7 days or less)
 */
export function shouldShowWarning(profile: UserProfile | null): boolean {
  if (!profile) return false
  if (profile.account_status !== 'trial') return false
  if (!profile.trial_ends_at) return false

  const daysLeft = getDaysLeft(profile.trial_ends_at)
  return daysLeft <= 7 && daysLeft > 0
}

/**
 * Format trial end date for display
 */
export function formatTrialEndDate(trialEndsAt: string | null): string {
  if (!trialEndsAt) return 'Tidak diketahui'

  const date = new Date(trialEndsAt)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
  }).format(date)
}

/**
 * Get status badge color
 */
export function getStatusColor(status: AccountStatus): string {
  switch (status) {
    case 'trial':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'active':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'expired':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    case 'blocked':
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: AccountStatus): string {
  switch (status) {
    case 'trial':
      return 'Trial'
    case 'active':
      return 'Aktif'
    case 'expired':
      return 'Kadaluarsa'
    case 'blocked':
      return 'Diblokir'
    default:
      return 'Tidak diketahui'
  }
}

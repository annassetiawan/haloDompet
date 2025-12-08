import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWallets, getTotalBalance, getAssetGrowth, getTransactions, getUserProfile, getMonthlyStats } from '@/lib/db'
import { getUserBudgetSummary } from '@/lib/budget'
import { DashboardClient } from '@/components/DashboardClient'
import { LandingPage } from '@/components/landing/LandingPage'
import type { User } from '@supabase/supabase-js'
import type { User as UserProfile } from '@/types'

// OPTIMIZED: Component to fetch ONLY critical data (wallets, balance) for LCP
async function DashboardCriticalData({ user, userProfile }: { user: User; userProfile: UserProfile }) {
  // Fetch ONLY critical data for LCP (wallets and balance - user sees these immediately)
  const [wallets, totalBalance, growthPercentage, monthlyStats] = await Promise.all([
    getWallets(user.id),
    getTotalBalance(user.id),
    getAssetGrowth(user.id),
    getMonthlyStats(user.id),
  ])

  return (
    <DashboardClient
      initialUser={user}
      initialUserProfile={userProfile}
      initialWallets={wallets}
      initialTotalBalance={totalBalance}
      initialGrowthPercentage={growthPercentage}
      initialMonthlyStats={monthlyStats}
    />
  )
}

export default async function DashboardPage() {
  // Create Supabase client
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Show landing page for non-authenticated users
  if (authError || !user) {
    return <LandingPage />
  }

  // Fetch only user profile first (fastest query)
  const userProfile = await getUserProfile(user.id)

  // Handle user profile checks
  if (!userProfile) {
    redirect('/login')
  }

  // Onboarding is now auto-completed by trigger, skip this check
  // if (!userProfile.is_onboarded) {
  //   redirect('/onboarding')
  // }

  // Trial system disabled - all users have unlimited access
  // if (isTrialExpired(userProfile)) {
  //   redirect('/trial-expired')
  // }

  // Stream the rest of the data with Suspense
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardCriticalData user={user} userProfile={userProfile} />
    </Suspense>
  )
}

// Import loading component to use as fallback
function DashboardLoadingFallback() {
  // Use the same loading UI from loading.tsx
  const { BottomNav } = require('@/components/BottomNav')

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Skeleton - Desktop Only */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-9 w-9 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
              <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />

      {/* Main Content */}
      <main className="md:pt-16 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 pb-6 space-y-6">
          {/* Header Section Skeleton - Mobile Only */}
          <div className="md:hidden bg-[#f5f5f5] dark:bg-muted/20 px-6 py-4 -mx-4">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-7 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-9 w-9 rounded-md bg-muted animate-pulse" />
            </div>
          </div>

          {/* Wallet Stack Skeleton (Center Card) */}
          <div className="flex justify-center py-2">
            <div className="relative w-[340px] h-[290px]">
              {/* Backing Layer */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[250px] bg-muted/50 rounded-[32px] animate-pulse" />
              
              {/* Card Placeholder */}
              <div className="absolute top-[14px] left-[20px] w-[300px] h-[230px] bg-muted rounded-[24px] border border-white/10 shadow-sm animate-pulse">
                {/* Content lines */}
                <div className="pt-8 px-6 space-y-4">
                  <div className="h-3 w-16 bg-black/10 dark:bg-white/10 rounded" />
                  <div className="h-8 w-32 bg-black/10 dark:bg-white/10 rounded" />
                  <div className="h-5 w-24 bg-black/10 dark:bg-white/10 rounded" />
                </div>
              </div>

              {/* Pocket Shape Imitation (Bottom) */}
              <div className="absolute bottom-0 w-full h-[220px] pointer-events-none overflow-hidden">
                <div className="absolute top-[45px] left-0 w-full h-full bg-gradient-to-b from-transparent to-muted/20" />
              </div>
            </div>
          </div>

          {/* Chat Bubble Skeleton */}
          <div className="relative w-full max-w-[400px] mx-auto mb-4 flex flex-col justify-end items-center">
            <div className="relative w-full px-4">
              <div className="w-full h-16 rounded-2xl bg-muted animate-pulse" />
            </div>
          </div>

          {/* Voice Recording Button Skeleton */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-40 h-40 rounded-full bg-muted animate-pulse" />
            <div className="w-40 h-11 rounded-lg bg-muted animate-pulse" />
            <div className="w-72 h-9 rounded-full bg-muted/50 animate-pulse" />
          </div>

          {/* Recent Transactions Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-36 bg-muted rounded animate-pulse" />
              <div className="h-9 w-28 bg-muted rounded-md animate-pulse" />
            </div>

            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 w-full bg-muted rounded-xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

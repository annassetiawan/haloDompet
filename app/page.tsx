import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWallets, getTotalBalance, getAssetGrowth, getTransactions, getUserProfile } from '@/lib/db'
import { getUserBudgetSummary } from '@/lib/budget'
import { isTrialExpired } from '@/lib/trial'
import { DashboardClient } from '@/components/DashboardClient'
import { LandingPage } from '@/components/landing/LandingPage'

export default async function DashboardPage() {
  // Create Supabase client
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Show landing page for non-authenticated users
  if (authError || !user) {
    return <LandingPage />
  }

  // Fetch all data in parallel for optimal performance
  const [userProfile, wallets, totalBalance, growthPercentage, recentTransactions, budgetSummary] = await Promise.all([
    getUserProfile(user.id),
    getWallets(user.id),
    getTotalBalance(user.id),
    getAssetGrowth(user.id),
    getTransactions(user.id, { limit: 5 }),
    getUserBudgetSummary(user.id)
  ])

  // Handle user profile checks
  if (!userProfile) {
    redirect('/login')
  }

  // Onboarding is now auto-completed by trigger, skip this check
  // if (!userProfile.is_onboarded) {
  //   redirect('/onboarding')
  // }

  if (isTrialExpired(userProfile)) {
    redirect('/trial-expired')
  }

  // Pass all data to client component
  return (
    <DashboardClient
      initialUser={user}
      initialUserProfile={userProfile}
      initialWallets={wallets}
      initialTotalBalance={totalBalance}
      initialGrowthPercentage={growthPercentage}
      initialTransactions={recentTransactions}
      initialBudgetSummary={budgetSummary}
    />
  )
}

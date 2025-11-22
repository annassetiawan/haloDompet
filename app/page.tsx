import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getWallets, getTotalBalance, getAssetGrowth, getTransactions, getUserProfile } from '@/lib/db'
import { isTrialExpired } from '@/lib/trial'
import { DashboardClient } from '@/components/DashboardClient'
import { LandingPage } from '@/components/landing/LandingPage'

export default async function HomePage() {
  // Create Supabase client
  const supabase = await createClient()

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // If user is not logged in, show Landing Page
  if (authError || !user) {
    return <LandingPage />
  }

  // User is logged in - proceed with dashboard logic
  // Fetch all data in parallel for optimal performance
  const [userProfile, wallets, totalBalance, growthPercentage, recentTransactions] = await Promise.all([
    getUserProfile(user.id),
    getWallets(user.id),
    getTotalBalance(user.id),
    getAssetGrowth(user.id),
    getTransactions(user.id, { limit: 5 })
  ])

  // Handle user profile checks
  if (!userProfile) {
    redirect('/login')
  }

  if (!userProfile.is_onboarded) {
    redirect('/onboarding')
  }

  if (isTrialExpired(userProfile)) {
    redirect('/trial-expired')
  }

  // Pass all data to client component - Show Dashboard for logged in users
  return (
    <DashboardClient
      initialUser={user}
      initialUserProfile={userProfile}
      initialWallets={wallets}
      initialTotalBalance={totalBalance}
      initialGrowthPercentage={growthPercentage}
      initialTransactions={recentTransactions}
    />
  )
}

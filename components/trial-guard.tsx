import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isTrialExpired } from '@/lib/trial'

/**
 * Server Component to check trial status and redirect if expired
 * Use this in protected page layouts or pages
 */
export async function TrialGuard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile with trial info
  const { data: profile } = await supabase
    .from('users')
    .select('account_status, trial_ends_at, trial_started_at')
    .eq('id', user.id)
    .single()

  // Check if trial is expired
  if (profile && isTrialExpired(profile as any)) {
    redirect('/trial-expired')
  }

  return null
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Check if user has completed onboarding
      const { data: { user } } = await supabase.auth.getUser()
      let redirectPath = '/onboarding' // Default for new users

      if (user) {
        // Check if user profile exists and has initial_balance set
        const { data: profile } = await supabase
          .from('users')
          .select('initial_balance')
          .eq('id', user.id)
          .single()

        // If profile exists and initial_balance is set (not null and not 0), user has completed onboarding
        if (profile && profile.initial_balance !== null && profile.initial_balance !== undefined) {
          redirectPath = '/' // Go to dashboard
        }
      }

      // Allow override with "next" param if provided
      const next = searchParams.get('next') ?? redirectPath

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

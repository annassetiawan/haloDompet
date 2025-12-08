import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams, origin } = requestUrl
  const code = searchParams.get('code')

  // Debug logging
  console.log('🔍 Auth Callback Debug:', {
    fullUrl: request.url,
    origin,
    host: request.headers.get('host'),
    forwardedHost: request.headers.get('x-forwarded-host'),
    forwardedProto: request.headers.get('x-forwarded-proto'),
  })

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Onboarding is auto-completed, redirect directly to dashboard
      const redirectPath = '/'

      // Allow override with "next" param if provided
      const next = searchParams.get('next') ?? redirectPath

      // Determine redirect URL - use actual request host, not URL origin
      // This ensures redirect goes to the same domain user is accessing from
      const host = request.headers.get('host') || new URL(request.url).host
      const protocol = request.headers.get('x-forwarded-proto') ||
                      (host.includes('localhost') ? 'http' : 'https')

      const redirectUrl = `${protocol}://${host}${next}`

      console.log('✅ Redirecting to:', redirectUrl)

      return NextResponse.redirect(redirectUrl)
    } else {
      console.error('❌ Auth Error in Callback:', error)
    }
  }

  // return the user to an error page with instructions
  const host = request.headers.get('host') || new URL(request.url).host
  const protocol = request.headers.get('x-forwarded-proto') ||
                  (host.includes('localhost') ? 'http' : 'https')
  return NextResponse.redirect(`${protocol}://${host}/login?error=auth_failed&details=${encodeURIComponent('Check server logs')}`)
}

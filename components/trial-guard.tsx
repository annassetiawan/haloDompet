/**
 * Server Component to check trial status and redirect if expired
 * DISABLED: Trial system has been disabled - all users have unlimited access
 * Use this in protected page layouts or pages
 */
export async function TrialGuard() {
  // Trial system disabled - all users have unlimited access
  // No redirect to trial-expired page
  return null
}

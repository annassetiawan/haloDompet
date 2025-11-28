// PHASE 3: Web Vitals monitoring untuk track LCP improvements
// Client-side only - measures real user performance

export function reportWebVitals(metric: {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating)
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Vercel Analytics automatically captures web vitals
    // Custom tracking can be added here if needed
    try {
      // Example: Send to custom endpoint
      // fetch('/api/analytics', {
      //   method: 'POST',
      //   body: JSON.stringify(metric),
      // })

      // Performance mark for debugging
      if (typeof window !== 'undefined' && 'performance' in window) {
        performance.mark(`web-vital-${metric.name}`)
      }
    } catch (error) {
      // Silently fail - don't break user experience
      console.error('Failed to report web vital:', error)
    }
  }
}

// LCP threshold check
export function isLCPGood(value: number): boolean {
  return value <= 2500 // 2.5s is "good" threshold
}

export function isLCPNeedsImprovement(value: number): boolean {
  return value > 2500 && value <= 4000
}

export function isLCPPoor(value: number): boolean {
  return value > 4000
}

// Get LCP rating
export function getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
  if (isLCPGood(value)) return 'good'
  if (isLCPNeedsImprovement(value)) return 'needs-improvement'
  return 'poor'
}

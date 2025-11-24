import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserBudgetSummary } from '@/lib/budget'

/**
 * GET /api/budget/summary
 * Fetch budget summary (with spending data) for the authenticated user
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      )
    }

    const budgets = await getUserBudgetSummary(authUser.id)

    return NextResponse.json({
      success: true,
      budgets,
    })
  } catch (error: any) {
    console.error('GET /api/budget/summary error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch budget summary',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

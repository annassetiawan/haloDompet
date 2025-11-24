import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getBudgets } from '@/lib/budget'

/**
 * GET /api/budget
 * Fetch all budgets for the authenticated user
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

    const budgets = await getBudgets(authUser.id)

    return NextResponse.json({
      success: true,
      budgets,
    })
  } catch (error: any) {
    console.error('GET /api/budget error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch budgets',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

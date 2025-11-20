import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update user to premium status with unlimited trial
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        account_status: 'active',
        trial_ends_at: null, // NULL = unlimited
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error upgrading user to premium:', error)
      return NextResponse.json(
        { error: 'Failed to upgrade account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Congratulations! Your account has been upgraded to Premium!',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Claim premium API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

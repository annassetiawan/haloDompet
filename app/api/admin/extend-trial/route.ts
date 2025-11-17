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

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminData) {
      return NextResponse.json(
        { error: 'Forbidden: Not an admin' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, days = 30 } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get current user data
    const { data: targetUser } = await supabase
      .from('users')
      .select('trial_ends_at, account_status')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate new trial end date
    const currentEnd = targetUser.trial_ends_at ? new Date(targetUser.trial_ends_at) : new Date()
    const now = new Date()
    const baseDate = currentEnd > now ? currentEnd : now
    const newEndDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)

    // Update user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        trial_ends_at: newEndDate.toISOString(),
        account_status: 'trial',
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to extend trial' },
        { status: 500 }
      )
    }

    // Log to audit trail
    await supabase.from('audit_log').insert({
      admin_id: adminData.id,
      action: 'extend_trial',
      target_user_id: userId,
      old_value: { trial_ends_at: targetUser.trial_ends_at },
      new_value: { trial_ends_at: newEndDate.toISOString(), days },
    })

    return NextResponse.json({
      success: true,
      message: `Trial extended by ${days} days`,
      new_end_date: newEndDate.toISOString(),
    })
  } catch (error) {
    console.error('Extend trial API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

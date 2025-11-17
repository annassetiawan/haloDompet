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
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get current user status
    const { data: targetUser } = await supabase
      .from('users')
      .select('account_status')
      .eq('id', userId)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Block user
    const { error: updateError } = await supabase
      .from('users')
      .update({
        account_status: 'blocked',
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error blocking user:', updateError)
      return NextResponse.json(
        { error: 'Failed to block user' },
        { status: 500 }
      )
    }

    // Log to audit trail
    await supabase.from('audit_log').insert({
      admin_id: adminData.id,
      action: 'block_user',
      target_user_id: userId,
      old_value: { account_status: targetUser.account_status },
      new_value: { account_status: 'blocked' },
    })

    return NextResponse.json({
      success: true,
      message: 'User blocked successfully',
    })
  } catch (error) {
    console.error('Block user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

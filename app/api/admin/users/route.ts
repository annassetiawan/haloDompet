import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/users
 * Fetch all users for admin panel (bypasses RLS using service role)
 */
export async function GET(request: NextRequest) {
  try {
    // First authenticate the requesting user
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

    // Fetch all users using service role (bypasses RLS)
    const adminClient = createAdminClient()
    const { data: users, error } = await adminClient
      .from('users')
      .select('id, email, account_status, trial_ends_at, trial_started_at, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      users: users || [],
      count: users?.length || 0,
    })
  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

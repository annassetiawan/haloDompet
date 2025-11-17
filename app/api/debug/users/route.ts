import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Debug endpoint to check user table state
 * Access: /api/debug/users
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        error: 'Not authenticated',
      }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!adminData) {
      return NextResponse.json({
        error: 'Not authorized - admin only',
      }, { status: 403 })
    }

    // 1. Check all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    // 2. Check all users in public.users table
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    // 3. Check table schema
    const { data: schemaCheck, error: schemaError } = await supabase.rpc('check_users_schema', {})
      .catch(() => ({ data: null, error: 'RPC not available' }))

    // 4. Count mismatches
    const authUserIds = authUsers?.users.map(u => u.id) || []
    const publicUserIds = publicUsers?.map(u => u.id) || []
    const missingInPublic = authUserIds.filter(id => !publicUserIds.includes(id))

    return NextResponse.json({
      auth_users_count: authUsers?.users.length || 0,
      public_users_count: publicUsers?.length || 0,
      auth_users: authUsers?.users.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
      })) || [],
      public_users: publicUsers || [],
      missing_in_public: missingInPublic,
      errors: {
        auth: authError?.message || null,
        public: publicError?.message || null,
        schema: schemaError || null,
      },
      hint: missingInPublic.length > 0
        ? `${missingInPublic.length} users exist in auth but not in public.users table. The handle_new_user() trigger may not be working.`
        : 'All auth users have corresponding rows in public.users',
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 })
  }
}

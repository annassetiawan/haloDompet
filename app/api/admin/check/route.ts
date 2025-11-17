import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Debug endpoint to check admin status
 * Access: /api/admin/check
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        message: 'Not logged in',
      })
    }

    // Check if user exists in admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Check if admin_users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1)

    return NextResponse.json({
      authenticated: true,
      user_id: user.id,
      email: user.email,
      is_admin: !!adminData,
      admin_record: adminData,
      admin_error: adminError?.message || null,
      table_exists: !tableError,
      table_error: tableError?.message || null,
      debug_info: {
        hint: !tableError && !adminData
          ? `Run this SQL in Supabase:\n\nINSERT INTO public.admin_users (user_id, email)\nVALUES ('${user.id}', '${user.email}');\n\nThen SELECT * FROM public.admin_users;`
          : 'Admin record found!',
      }
    }, { status: 200 })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 })
  }
}

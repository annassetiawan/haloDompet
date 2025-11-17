import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Debug endpoint to test user profile update
 * Access: /api/debug/test-update
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

    // 1. Check if user exists in public.users
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json({
        step: 'fetch_user',
        error: fetchError.message,
        code: fetchError.code,
        details: fetchError.details,
        hint: fetchError.hint,
      })
    }

    // 2. Try to update the user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        mode: 'simple',
        webhook_url: null,
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({
        step: 'update_user',
        error: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        existingUser: existingUser,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Update successful!',
      user: updatedUser,
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
    }, { status: 500 })
  }
}

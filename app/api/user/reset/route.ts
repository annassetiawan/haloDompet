import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/user/reset
 * Reset all user data (transactions and wallet balances)
 * This endpoint:
 * 1. Deletes all transactions for the user
 * 2. Resets all wallet balances to 0
 * 3. Does NOT change is_onboarded status (user stays in dashboard)
 * 4. Does NOT delete user account
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🗑️ Resetting all data for user:', user.id)

    // Call PostgreSQL function to reset user data
    // This function safely handles trigger conflicts by temporarily disabling them
    const { data, error } = await supabase.rpc('reset_user_data', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error resetting user data:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: 'Failed to reset user data', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Reset successful:', data)
    console.log('🎉 Data reset complete!')

    return NextResponse.json({
      success: true,
      message: 'All data reset successfully',
      data: {
        transactionsDeleted: data.transactions_deleted || 0,
        walletsReset: data.wallets_reset || 0,
        userBalanceReset: true,
      },
    })
  } catch (error) {
    console.error('Reset data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

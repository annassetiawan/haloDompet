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

    // Step 1: Delete all transactions for the user
    const { error: deleteTransactionsError } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user.id)

    if (deleteTransactionsError) {
      console.error('Error deleting transactions:', deleteTransactionsError)
      return NextResponse.json(
        { error: 'Failed to delete transactions', details: deleteTransactionsError.message },
        { status: 500 }
      )
    }

    console.log('✅ All transactions deleted')

    // Step 2: Reset all wallet balances to 0
    const { error: resetWalletsError } = await supabase
      .from('wallets')
      .update({ balance: 0 })
      .eq('user_id', user.id)

    if (resetWalletsError) {
      console.error('Error resetting wallet balances:', resetWalletsError)
      return NextResponse.json(
        { error: 'Failed to reset wallet balances', details: resetWalletsError.message },
        { status: 500 }
      )
    }

    console.log('✅ All wallet balances reset to 0')

    // Step 3: Reset user's current_balance to 0 for backward compatibility
    const { error: resetUserBalanceError } = await supabase
      .from('users')
      .update({ current_balance: 0 })
      .eq('id', user.id)

    if (resetUserBalanceError) {
      console.error('Error resetting user balance:', resetUserBalanceError)
      return NextResponse.json(
        { error: 'Failed to reset user balance', details: resetUserBalanceError.message },
        { status: 500 }
      )
    }

    console.log('✅ User balance reset to 0')
    console.log('🎉 Data reset complete!')

    return NextResponse.json({
      success: true,
      message: 'All data reset successfully',
      data: {
        transactionsDeleted: true,
        walletsReset: true,
        userBalanceReset: true,
      },
    })
  } catch (error) {
    console.error('Reset data API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Step 1: Call PostgreSQL function to delete all transactions
    // Function only deletes transactions to avoid trigger conflicts
    const { data, error } = await supabase.rpc('reset_user_data', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error deleting transactions:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: 'Failed to delete transactions', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Transactions deleted:', data.transactions_deleted)

    // Step 2: Reset wallet balances to 0 (separate query to avoid trigger conflict)
    const { error: walletsError } = await supabase
      .from('wallets')
      .update({ balance: 0 })
      .eq('user_id', user.id)

    if (walletsError) {
      console.error('Error resetting wallets:', walletsError)
      return NextResponse.json(
        { error: 'Failed to reset wallet balances', details: walletsError.message },
        { status: 500 }
      )
    }

    console.log('✅ Wallet balances reset to 0')

    // Step 3: Reset user's current_balance to 0
    const { error: userError } = await supabase
      .from('users')
      .update({ current_balance: 0 })
      .eq('id', user.id)

    if (userError) {
      console.error('Error resetting user balance:', userError)
      return NextResponse.json(
        { error: 'Failed to reset user balance', details: userError.message },
        { status: 500 }
      )
    }

    console.log('✅ User balance reset to 0')
    console.log('🎉 Data reset complete!')

    return NextResponse.json({
      success: true,
      message: 'All data reset successfully',
      data: {
        transactionsDeleted: data.transactions_deleted || 0,
        walletsReset: data.wallets_count || 0,
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

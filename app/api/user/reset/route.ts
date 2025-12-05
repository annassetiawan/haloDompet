import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/user/reset
 * Reset all user data (transactions and wallet balances)
 * This endpoint:
 * 1. Calls reset_user_data() to delete all transactions
 * 2. Calls reset_wallet_balances() in SEPARATE RPC to reset wallet balances
 * 3. Does NOT change is_onboarded status (user stays in dashboard)
 * 4. Does NOT delete user account
 *
 * IMPORTANT: Two separate RPC calls are used to avoid PostgreSQL trigger conflicts.
 * The auto_update_wallet_balance trigger fires when transactions are deleted,
 * so wallet balance resets must happen in a separate transaction context.
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

    // Step 0: Break circular dependencies (foreign key constraints)
    // We must set related_transaction_id to NULL before deleting to avoid FK violations
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ related_transaction_id: null })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error breaking circular dependencies:', updateError)
      // We continue anyway, hoping for the best, but log the error
    }

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

    // Step 2: Call separate PostgreSQL function to reset wallet balances
    // This is in a SEPARATE RPC call to avoid trigger conflicts
    console.log('🔄 Resetting wallet balances...')

    const { data: walletsData, error: walletsError } = await supabase.rpc('reset_wallet_balances', {
      p_user_id: user.id,
    })

    if (walletsError) {
      console.error('Error resetting wallet balances:', walletsError)
      console.error('Error details:', {
        code: walletsError.code,
        message: walletsError.message,
        details: walletsError.details,
        hint: walletsError.hint,
      })
      return NextResponse.json(
        { error: 'Failed to reset wallet balances', details: walletsError.message },
        { status: 500 }
      )
    }

    console.log('✅ Wallet balances reset:', walletsData.wallets_reset)
    console.log('✅ User balance reset to 0')
    console.log('🎉 Data reset complete!')

    return NextResponse.json({
      success: true,
      message: 'All data reset successfully',
      data: {
        transactionsDeleted: data.transactions_deleted || 0,
        walletsReset: walletsData.wallets_reset || 0,
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

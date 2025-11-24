import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDefaultWallet } from '@/lib/db'

/**
 * POST /api/transaction/adjustment
 * Create adjustment transaction to correct wallet balance
 *
 * This will create a transaction of type 'adjustment' that bridges the gap
 * between current wallet balance and target balance
 */
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

    const body = await request.json()
    const { target_balance, notes, wallet_id } = body

    // Validation
    if (typeof target_balance !== 'number') {
      return NextResponse.json(
        { error: 'Target balance must be a number' },
        { status: 400 }
      )
    }

    // If wallet_id not provided, use default wallet
    let targetWalletId = wallet_id
    if (!targetWalletId) {
      const defaultWallet = await getDefaultWallet(user.id)
      if (!defaultWallet) {
        return NextResponse.json(
          { error: 'No default wallet found. Please create a wallet first.' },
          { status: 400 }
        )
      }
      targetWalletId = defaultWallet.id
    }

    // Get current wallet balance
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('balance, name')
      .eq('id', targetWalletId)
      .single()

    if (walletError) {
      console.error('Error fetching wallet:', walletError)
      return NextResponse.json(
        { error: 'Failed to get wallet balance' },
        { status: 500 }
      )
    }

    const currentBalance = walletData.balance
    const difference = target_balance - currentBalance

    if (difference === 0) {
      return NextResponse.json(
        { error: 'Target balance is same as current balance. No adjustment needed.' },
        { status: 400 }
      )
    }

    // Use fixed amount (absolute value of difference)
    const adjustmentAmount = Math.abs(difference)

    // Create adjustment transaction with type 'adjustment'
    // This ensures adjustment transactions don't pollute income/expense statistics
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: targetWalletId,
        item: 'Penyesuaian Saldo',
        amount: adjustmentAmount,
        category: 'Penyesuaian Saldo',
        date: new Date().toISOString().split('T')[0],
        type: 'adjustment', // Use 'adjustment' type to exclude from reports
        notes: notes || `Koreksi saldo manual: ${difference > 0 ? '+' : '-'}${adjustmentAmount.toLocaleString('id-ID')}. Saldo sebelum: ${currentBalance.toLocaleString('id-ID')}, Saldo baru: ${target_balance.toLocaleString('id-ID')}`,
        voice_text: null,
        location: null,
        payment_method: null
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating adjustment transaction:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create adjustment transaction' },
        { status: 500 }
      )
    }

    // Manually update wallet balance since trigger might not handle 'adjustment' type
    // This ensures the balance is exactly what the user requested
    const { error: walletUpdateError } = await supabase
      .from('wallets')
      .update({ balance: target_balance })
      .eq('id', targetWalletId)
      .eq('user_id', user.id)

    if (walletUpdateError) {
      console.error('Error updating wallet balance:', walletUpdateError)
      // Rollback: delete the transaction we just created
      await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      return NextResponse.json(
        { error: 'Failed to update wallet balance' },
        { status: 500 }
      )
    }

    console.log('✅ Adjustment transaction created:', {
      wallet: walletData.name,
      wallet_id: targetWalletId,
      difference,
      amount: adjustmentAmount,
      target_balance
    })

    return NextResponse.json({
      success: true,
      transaction,
      adjustment: {
        wallet_id: targetWalletId,
        wallet_name: walletData.name,
        previous_balance: currentBalance,
        new_balance: target_balance,
        difference: difference
      }
    })
  } catch (error) {
    console.error('Adjustment transaction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

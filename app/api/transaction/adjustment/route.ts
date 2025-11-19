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

    // Determine adjustment type based on difference
    // Positive difference = need to add money (income)
    // Negative difference = need to subtract money (expense)
    const adjustmentType = difference > 0 ? 'income' : 'expense'
    const adjustmentAmount = Math.abs(difference)

    // Create adjustment transaction
    // The database trigger will automatically update wallet balance
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: targetWalletId,
        item: 'Penyesuaian Saldo',
        amount: adjustmentAmount,
        category: 'Adjustment',
        date: new Date().toISOString().split('T')[0],
        type: adjustmentType, // Use income/expense, not 'adjustment'
        notes: notes || `Koreksi saldo ${difference > 0 ? 'naik' : 'turun'} ${adjustmentAmount.toLocaleString('id-ID')}`,
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

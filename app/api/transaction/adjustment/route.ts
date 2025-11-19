import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/transaction/adjustment
 * Create adjustment transaction to correct balance
 *
 * This will create a transaction of type 'adjustment' that bridges the gap
 * between current balance and target balance
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
    const { target_balance, notes } = body

    // Validation
    if (typeof target_balance !== 'number') {
      return NextResponse.json(
        { error: 'Target balance must be a number' },
        { status: 400 }
      )
    }

    // Get current balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('current_balance')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return NextResponse.json(
        { error: 'Failed to get current balance' },
        { status: 500 }
      )
    }

    const currentBalance = userData.current_balance
    const difference = target_balance - currentBalance

    if (difference === 0) {
      return NextResponse.json(
        { error: 'Target balance is same as current balance. No adjustment needed.' },
        { status: 400 }
      )
    }

    // Determine adjustment type
    const adjustmentType = difference > 0 ? 'income' : 'expense'
    const adjustmentAmount = Math.abs(difference)

    // Create adjustment transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        item: 'Penyesuaian Saldo',
        amount: adjustmentAmount,
        category: 'Adjustment',
        date: new Date().toISOString().split('T')[0],
        type: adjustmentType,
        notes: notes || 'Koreksi saldo manual',
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

    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ current_balance: target_balance })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating balance:', updateError)
      // Rollback transaction if balance update fails
      await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)

      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      )
    }

    console.log('✅ Adjustment transaction created:', {
      difference,
      type: adjustmentType,
      amount: adjustmentAmount,
      target_balance
    })

    return NextResponse.json({
      success: true,
      transaction,
      adjustment: {
        previous_balance: currentBalance,
        new_balance: target_balance,
        difference: difference,
        type: adjustmentType
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

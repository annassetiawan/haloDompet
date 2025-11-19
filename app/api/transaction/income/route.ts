import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/transaction/income
 * Create income transaction (gajian, transfer, etc.)
 *
 * This adds money to the current balance
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
    const { item, amount, date, notes } = body

    // Validation
    if (!item || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: item, amount' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
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
    const newBalance = currentBalance + amount

    // Create income transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        item,
        amount,
        category: 'Pemasukan',
        date: date || new Date().toISOString().split('T')[0],
        type: 'income',
        notes: notes || null,
        voice_text: null,
        location: null,
        payment_method: null
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating income transaction:', transactionError)
      return NextResponse.json(
        { error: 'Failed to create income transaction' },
        { status: 500 }
      )
    }

    // Update user balance
    const { error: updateError } = await supabase
      .from('users')
      .update({ current_balance: newBalance })
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

    console.log('✅ Income transaction created:', {
      item,
      amount,
      newBalance
    })

    return NextResponse.json({
      success: true,
      transaction,
      balance: {
        previous: currentBalance,
        current: newBalance,
        added: amount
      }
    })
  } catch (error) {
    console.error('Income transaction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

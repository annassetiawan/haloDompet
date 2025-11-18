import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/user/update-saldo-awal
 * Update initial_balance and recalculate current_balance
 *
 * Formula: current_balance = initial_balance - total_expenses + total_income
 */
export async function PATCH(request: NextRequest) {
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
    const { initial_balance } = body

    // Validation
    if (typeof initial_balance !== 'number' || initial_balance < 0) {
      return NextResponse.json(
        { error: 'Initial balance must be a non-negative number' },
        { status: 400 }
      )
    }

    // Calculate total expenses (type='expense' or null for backward compatibility)
    const { data: expenseData, error: expenseError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .or('type.eq.expense,type.is.null')

    if (expenseError) {
      console.error('Error fetching expenses:', expenseError)
      return NextResponse.json(
        { error: 'Failed to calculate expenses' },
        { status: 500 }
      )
    }

    const totalExpenses = expenseData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0

    // Calculate total income
    const { data: incomeData, error: incomeError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'income')

    if (incomeError) {
      console.error('Error fetching income:', incomeError)
      return NextResponse.json(
        { error: 'Failed to calculate income' },
        { status: 500 }
      )
    }

    const totalIncome = incomeData?.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0

    // Calculate new current balance
    const newCurrentBalance = initial_balance - totalExpenses + totalIncome

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        initial_balance,
        current_balance: newCurrentBalance
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user:', updateError)
      return NextResponse.json(
        { error: 'Failed to update balance' },
        { status: 500 }
      )
    }

    console.log('✅ Initial balance updated and recalculated:', {
      initial_balance,
      totalExpenses,
      totalIncome,
      newCurrentBalance
    })

    return NextResponse.json({
      success: true,
      initial_balance,
      current_balance: newCurrentBalance,
      calculation: {
        total_expenses: totalExpenses,
        total_income: totalIncome
      }
    })
  } catch (error) {
    console.error('Update saldo awal API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

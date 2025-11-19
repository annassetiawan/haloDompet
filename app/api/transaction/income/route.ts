import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDefaultWallet } from '@/lib/db'

/**
 * POST /api/transaction/income
 * Create income transaction (gajian, transfer, etc.)
 *
 * This adds money to the wallet balance (handled by database trigger)
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
    const { item, amount, date, notes, wallet_id } = body

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

    // Get wallet info before transaction (for response)
    const { data: walletData, error: walletError } = await supabase
      .from('wallets')
      .select('balance, name')
      .eq('id', targetWalletId)
      .single()

    if (walletError) {
      console.error('Error fetching wallet:', walletError)
      return NextResponse.json(
        { error: 'Failed to get wallet information' },
        { status: 500 }
      )
    }

    const previousBalance = walletData.balance

    // Create income transaction
    // The database trigger will automatically update wallet balance
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        wallet_id: targetWalletId,
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

    console.log('✅ Income transaction created:', {
      item,
      amount,
      wallet: walletData.name,
      wallet_id: targetWalletId
    })

    return NextResponse.json({
      success: true,
      transaction,
      wallet: {
        id: targetWalletId,
        name: walletData.name,
        previous_balance: previousBalance,
        new_balance: previousBalance + amount,
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

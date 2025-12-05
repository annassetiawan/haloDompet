import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTransaction, getWallets } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { source_wallet_id, target_wallet_id, amount, date, notes } = body

    // Validation
    if (!source_wallet_id || !target_wallet_id || !amount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (source_wallet_id === target_wallet_id) {
      return NextResponse.json(
        { error: 'Source and target wallets must be different' },
        { status: 400 }
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Get wallet names for transaction items
    const wallets = await getWallets(user.id)
    const sourceWallet = wallets.find((w) => w.id === source_wallet_id)
    const targetWallet = wallets.find((w) => w.id === target_wallet_id)

    if (!sourceWallet || !targetWallet) {
      return NextResponse.json(
        { error: 'One or both wallets not found' },
        { status: 404 }
      )
    }

    // 1. Create Transfer Out (Expense)
    const transferOut = await createTransaction(user.id, {
      item: `Transfer ke ${targetWallet.name}`,
      amount: amount,
      category: 'Transfer Keluar', // Ensure this category exists or is handled
      date: date,
      wallet_id: source_wallet_id,
      type: 'expense',
      notes: notes,
    })

    if (!transferOut) {
      return NextResponse.json(
        { error: 'Failed to create transfer out transaction' },
        { status: 500 }
      )
    }

    // 2. Create Transfer In (Income)
    const transferIn = await createTransaction(user.id, {
      item: `Transfer dari ${sourceWallet.name}`,
      amount: amount,
      category: 'Transfer Masuk', // Ensure this category exists or is handled
      date: date,
      wallet_id: target_wallet_id,
      type: 'income',
      notes: notes,
      related_transaction_id: transferOut.id,
    })

    if (!transferIn) {
      // Rollback: Delete the first transaction if second fails
      // Note: Ideally this should be a DB transaction
      await supabase.from('transactions').delete().eq('id', transferOut.id)
      return NextResponse.json(
        { error: 'Failed to create transfer in transaction' },
        { status: 500 }
      )
    }

    // 3. Update Transfer Out with related_transaction_id
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ related_transaction_id: transferIn.id })
      .eq('id', transferOut.id)

    if (updateError) {
      console.error('Failed to link transactions:', updateError)
      // Non-critical error, transaction still valid but not fully linked
    }

    return NextResponse.json({
      success: true,
      data: {
        transferOut,
        transferIn,
      },
    })
  } catch (error) {
    console.error('Transfer API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

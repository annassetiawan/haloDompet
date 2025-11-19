import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTransaction, getTransactions, deleteTransaction, getDefaultWallet } from '@/lib/db'

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
    const { item, amount, category, date, voice_text, location, payment_method, wallet_id } = body

    // Validation
    if (!item || !amount || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: item, amount, category, date' },
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

    // Create transaction
    const transaction = await createTransaction(user.id, {
      item,
      amount,
      category,
      date,
      voice_text,
      location: location || null,
      payment_method: payment_method || null,
      wallet_id: targetWalletId,
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction,
    })
  } catch (error) {
    console.error('Transaction API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const category = searchParams.get('category') || undefined

    // Get transactions
    const transactions = await getTransactions(user.id, {
      limit,
      offset,
      startDate,
      endDate,
      category,
    })

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    })
  } catch (error) {
    console.error('Transaction GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      )
    }

    // Delete transaction
    const success = await deleteTransaction(user.id, id)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted successfully',
    })
  } catch (error) {
    console.error('Transaction DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

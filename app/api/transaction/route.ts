import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createTransaction, getTransactions, deleteTransaction, getDefaultWallet, updateTransaction, getTransaction } from '@/lib/db'

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
    const { item, amount, category, date, voice_text, location, payment_method, wallet_id, type, note } = body

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

    // Validate transaction type
    const transactionType = type || 'expense' // Default to expense if not provided
    if (!['income', 'expense', 'adjustment'].includes(transactionType)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: income, expense, or adjustment' },
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
      note: note || null,
      wallet_id: targetWalletId,
      type: transactionType,
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

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query parameters for transaction ID
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      )
    }

    // Verify transaction ownership
    const existingTransaction = await getTransaction(id)
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (existingTransaction.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only edit your own transactions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { item, amount, category, date, wallet_id, type, note } = body

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

    // Validate transaction type if provided
    if (type && !['income', 'expense', 'adjustment'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: income, expense, or adjustment' },
        { status: 400 }
      )
    }

    // Update transaction
    const updatedTransaction = await updateTransaction(id, {
      item,
      amount,
      category,
      date,
      wallet_id: wallet_id || existingTransaction.wallet_id,
      type: type || existingTransaction.type,
      note: note !== undefined ? note : existingTransaction.note,
    })

    if (!updatedTransaction) {
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Transaction updated successfully',
    })
  } catch (error) {
    console.error('Transaction PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

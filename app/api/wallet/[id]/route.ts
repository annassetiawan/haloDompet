import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateWallet, deleteWallet } from '@/lib/db'

// PUT /api/wallet/[id] - Update wallet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const walletId = params.id
    const body = await request.json()
    const { name, icon, color, is_default } = body

    // Validation
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name must be a string' },
        { status: 400 }
      )
    }

    if (name !== undefined && name.trim() === '') {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      )
    }

    // Update wallet
    const wallet = await updateWallet(walletId, {
      ...(name !== undefined && { name: name.trim() }),
      ...(icon !== undefined && { icon }),
      ...(color !== undefined && { color }),
      ...(is_default !== undefined && { is_default }),
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      wallet,
    })
  } catch (error) {
    console.error('Wallet PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/wallet/[id] - Delete wallet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const walletId = params.id

    // Check if this is the default wallet
    const { data: wallet, error: fetchError } = await supabase
      .from('wallets')
      .select('is_default')
      .eq('id', walletId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      )
    }

    if (wallet.is_default) {
      return NextResponse.json(
        { error: 'Cannot delete default wallet. Please set another wallet as default first.' },
        { status: 400 }
      )
    }

    // Delete wallet
    const success = await deleteWallet(user.id, walletId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet deleted successfully',
    })
  } catch (error) {
    console.error('Wallet DELETE API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

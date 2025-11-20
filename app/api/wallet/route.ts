import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWallets, createWallet, getTotalBalance, getAssetGrowth } from '@/lib/db'

// GET /api/wallet - Get all wallets for the authenticated user
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

    // Get all wallets
    const wallets = await getWallets(user.id)

    // Get total balance across all wallets
    const totalBalance = await getTotalBalance(user.id)

    // Get asset growth percentage for current month
    const growthPercentage = await getAssetGrowth(user.id)

    return NextResponse.json({
      success: true,
      wallets,
      totalBalance,
      growthPercentage,
    })
  } catch (error) {
    console.error('Wallet GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/wallet - Create a new wallet
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
    const { name, balance, icon, color, is_default } = body

    // Validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Wallet name is required' },
        { status: 400 }
      )
    }

    if (balance !== undefined && (typeof balance !== 'number' || balance < 0)) {
      return NextResponse.json(
        { error: 'Balance must be a non-negative number' },
        { status: 400 }
      )
    }

    // Create new wallet
    const wallet = await createWallet(user.id, {
      name: name.trim(),
      balance: balance || 0,
      icon: icon || '💰',
      color: color || '#10b981',
      is_default: is_default || false,
    })

    if (!wallet) {
      return NextResponse.json(
        { error: 'Failed to create wallet' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      wallet,
    })
  } catch (error) {
    console.error('Wallet POST API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

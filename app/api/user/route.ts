import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserProfile, createOrUpdateUserProfile } from '@/lib/db'

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

    const profile = await getUserProfile(user.id)

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: profile,
    })
  } catch (error) {
    console.error('User GET API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const { initial_balance, mode, webhook_url } = body

    // Validation
    if (initial_balance !== undefined && (typeof initial_balance !== 'number' || initial_balance < 0)) {
      return NextResponse.json(
        { error: 'Initial balance must be a non-negative number' },
        { status: 400 }
      )
    }

    if (mode && !['simple', 'webhook'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be either "simple" or "webhook"' },
        { status: 400 }
      )
    }

    // Create or update user profile
    console.log('📝 POST /api/user - Attempting to create/update profile')
    console.log('User ID:', user.id)
    console.log('User Email:', user.email)
    console.log('Profile data to save:', { initial_balance, mode, webhook_url })

    const profile = await createOrUpdateUserProfile(user.id, user.email!, {
      initial_balance,
      current_balance: initial_balance, // Set current balance to initial balance on first setup
      mode,
      webhook_url,
      is_onboarded: true, // Mark user as onboarded when they complete onboarding
    })

    if (!profile) {
      console.error('❌ createOrUpdateUserProfile returned null for user:', user.id)
      console.error('This usually means UPDATE or INSERT failed due to RLS policy or permission issue')
      return NextResponse.json(
        {
          error: 'Failed to update user profile',
          details: 'Database operation failed. Check server logs and RLS policies.',
          userId: user.id,
        },
        { status: 500 }
      )
    }

    console.log('✅ Profile saved successfully!')
    console.log('Saved data:', {
      id: profile.id,
      email: profile.email,
      initial_balance: profile.initial_balance,
      current_balance: profile.current_balance,
      mode: profile.mode,
    })

    return NextResponse.json({
      success: true,
      user: profile,
    })
  } catch (error) {
    console.error('User POST API error:', error)
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

    const body = await request.json()
    const { initial_balance, current_balance, mode, webhook_url } = body

    // Validation
    if (initial_balance !== undefined && (typeof initial_balance !== 'number' || initial_balance < 0)) {
      return NextResponse.json(
        { error: 'Initial balance must be a non-negative number' },
        { status: 400 }
      )
    }

    if (current_balance !== undefined && typeof current_balance !== 'number') {
      return NextResponse.json(
        { error: 'Current balance must be a number' },
        { status: 400 }
      )
    }

    if (mode && !['simple', 'webhook'].includes(mode)) {
      return NextResponse.json(
        { error: 'Mode must be either "simple" or "webhook"' },
        { status: 400 }
      )
    }

    // Update user profile
    const profile = await createOrUpdateUserProfile(user.id, user.email!, {
      initial_balance,
      current_balance,
      mode,
      webhook_url,
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: profile,
    })
  } catch (error) {
    console.error('User PUT API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

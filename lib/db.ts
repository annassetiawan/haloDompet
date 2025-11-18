import { createClient } from '@/lib/supabase/server'
import type { User, Transaction } from '@/types'

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function createOrUpdateUserProfile(
  userId: string,
  email: string,
  data: {
    initial_balance?: number
    current_balance?: number
    mode?: 'simple' | 'webhook'
    webhook_url?: string
  }
): Promise<User | null> {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    console.error('No authenticated user in createOrUpdateUserProfile')
    return null
  }
  if (authUser.id !== userId) {
    console.error('Authenticated user ID does not match target user ID:', {
      authUserId: authUser.id,
      targetUserId: userId,
    })
    return null
  }

  // Check if user exists
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching existing user:', {
      code: fetchError.code,
      message: fetchError.message,
      details: fetchError.details,
      hint: fetchError.hint,
    })
    return null
  }

  if (existingUser) {
    // Update existing user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating user profile:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId,
        dataToUpdate: data,
      })
      return null
    }

    return updatedUser
  } else {
    // Create new user (this should rarely happen since trigger creates users)
    console.log('Creating new user profile for:', userId)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        initial_balance: data.initial_balance || 0,
        current_balance: data.current_balance || data.initial_balance || 0,
        mode: data.mode || 'simple',
        webhook_url: data.webhook_url || null,
        account_status: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        trial_started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating user profile:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId,
        email,
        dataToInsert: data,
      })
      return null
    }

    return newUser
  }
}

export async function updateUserBalance(
  userId: string,
  newBalance: number
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({ current_balance: newBalance })
    .eq('id', userId)

  if (error) {
    console.error('Error updating balance:', error)
    return false
  }

  return true
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export async function createTransaction(
  userId: string,
  transaction: {
    item: string
    amount: number
    category: string
    date: string
    voice_text?: string
    location?: string | null
    payment_method?: string | null
  }
): Promise<Transaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      ...transaction,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    return null
  }

  return data
}

export async function getTransactions(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    startDate?: string
    endDate?: string
    category?: string
  }
): Promise<Transaction[]> {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Apply filters
  if (options?.startDate) {
    query = query.gte('date', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate)
  }
  if (options?.category) {
    query = query.eq('category', options.category)
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export async function getTransaction(
  transactionId: string
): Promise<Transaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error) {
    console.error('Error fetching transaction:', error)
    return null
  }

  return data
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
): Promise<Transaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    return null
  }

  return data
}

export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Delete with user verification for security
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting transaction:', error)
    return false
  }

  return true
}

// ============================================
// ANALYTICS & STATS
// ============================================

export async function getTransactionStats(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<{
  totalSpent: number
  totalTransactions: number
  averageTransaction: number
  categorySummary: { category: string; total: number; count: number }[]
}> {
  const transactions = await getTransactions(userId, { startDate, endDate })

  const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
  const totalTransactions = transactions.length
  const averageTransaction = totalTransactions > 0 ? totalSpent / totalTransactions : 0

  // Group by category
  const categoryMap = new Map<string, { total: number; count: number }>()
  transactions.forEach(t => {
    const existing = categoryMap.get(t.category) || { total: 0, count: 0 }
    categoryMap.set(t.category, {
      total: existing.total + parseFloat(t.amount.toString()),
      count: existing.count + 1,
    })
  })

  const categorySummary = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    total: data.total,
    count: data.count,
  }))

  return {
    totalSpent,
    totalTransactions,
    averageTransaction,
    categorySummary,
  }
}

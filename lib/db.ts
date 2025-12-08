import { createClient } from '@/lib/supabase/server'
import type { User, Transaction, Wallet, Category } from '@/types'

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
    is_onboarded?: boolean
  }
): Promise<User | null> {
  const supabase = await createClient()

  // Verify authentication
  console.log('🔐 Verifying authentication for userId:', userId)
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.error('❌ Auth error:', authError)
  }

  console.log('Auth data:', authData)
  const authUser = authData?.user

  if (!authUser) {
    console.error('❌ No authenticated user in createOrUpdateUserProfile')
    console.error('Auth data received:', JSON.stringify(authData, null, 2))
    return null
  }

  console.log('✅ Authenticated user:', authUser.id, authUser.email)

  if (authUser.id !== userId) {
    console.error('❌ Authenticated user ID does not match target user ID:', {
      authUserId: authUser.id,
      targetUserId: userId,
    })
    return null
  }

  console.log('✅ User ID matches, proceeding with update')

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
    console.log('📝 Updating existing user:', userId)
    console.log('Current user data:', JSON.stringify(existingUser, null, 2))
    console.log('Data to update:', JSON.stringify(data, null, 2))

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating user profile:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        userId,
        dataToUpdate: data,
        existingUser: existingUser,
      })

      // Log full error for debugging
      console.error('Full error object:', JSON.stringify(error, null, 2))
      return null
    }

    console.log('✅ Successfully updated user')
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
        is_onboarded: data.is_onboarded ?? false,
        account_status: 'trial',
        // Don't set trial_ends_at and trial_started_at here
        // Let the database default values and early adopter trigger handle it
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
    wallet_id?: string | null
    type?: 'income' | 'expense' | 'adjustment'
    notes?: string | null
    related_transaction_id?: string | null
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
// WALLET OPERATIONS (Multi-Wallet Support)
// ============================================

export async function getWallets(userId: string): Promise<Wallet[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching wallets:', error)
    return []
  }

  return data || []
}

export async function getDefaultWallet(userId: string): Promise<Wallet | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single()

  if (error) {
    console.error('Error fetching default wallet:', error)
    return null
  }

  return data
}

export async function createWallet(
  userId: string,
  walletData: {
    name: string
    balance?: number
    icon?: string
    color?: string
    is_default?: boolean
  }
): Promise<Wallet | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wallets')
    .insert({
      user_id: userId,
      name: walletData.name,
      balance: walletData.balance || 0,
      icon: walletData.icon || '💰',
      color: walletData.color || '#10b981',
      is_default: walletData.is_default || false,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating wallet:', error)
    return null
  }

  return data
}

export async function updateWallet(
  walletId: string,
  updates: Partial<Wallet>
): Promise<Wallet | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('wallets')
    .update(updates)
    .eq('id', walletId)
    .select()
    .single()

  if (error) {
    console.error('Error updating wallet:', error)
    return null
  }

  return data
}

export async function deleteWallet(
  userId: string,
  walletId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Delete with user verification for security
  const { error } = await supabase
    .from('wallets')
    .delete()
    .eq('id', walletId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting wallet:', error)
    return false
  }

  return true
}

export async function getTotalBalance(userId: string): Promise<number> {
  const supabase = await createClient()

  // Use the database function we created in migration
  const { data, error } = await supabase.rpc('get_total_balance', {
    p_user_id: userId,
  })

  if (error) {
    console.error('Error getting total balance:', error)
    // Fallback: manually sum wallet balances
    const wallets = await getWallets(userId)
    return wallets.reduce((sum, w) => sum + parseFloat(w.balance.toString()), 0)
  }

  return data || 0
}

// ============================================
// CATEGORY OPERATIONS
// ============================================

/**
 * Get categories for a user (includes default categories + user's custom categories)
 * @param userId - The user ID
 * @param type - Optional filter by type ('income' or 'expense')
 * @returns Array of categories
 */
export async function getCategories(
  userId: string,
  type?: 'income' | 'expense'
): Promise<Category[]> {
  const supabase = await createClient()

  let query = supabase
    .from('categories')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${userId}`)
    .order('user_id', { ascending: true, nullsFirst: true }) // Default categories first
    .order('name', { ascending: true })

  // Apply type filter if provided
  if (type) {
    query = query.eq('type', type)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

/**
 * Create a new custom category for a user
 * @param userId - The user ID
 * @param name - Category name
 * @param type - Category type ('income' or 'expense')
 * @returns Created category or null if error
 */
export async function createCategory(
  userId: string,
  name: string,
  type: 'income' | 'expense'
): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userId,
      name: name.trim(),
      type,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    return null
  }

  return data
}

/**
 * Update a custom category (only user's own categories can be updated)
 * @param categoryId - The category ID
 * @param name - New category name
 * @returns Updated category or null if error
 */
export async function updateCategory(
  categoryId: string,
  name: string
): Promise<Category | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', categoryId)
    .select()
    .single()

  if (error) {
    console.error('Error updating category:', error)
    return null
  }

  return data
}

/**
 * Delete a custom category (only user's own categories can be deleted)
 * @param userId - The user ID (for security verification)
 * @param categoryId - The category ID to delete
 * @returns True if successful, false otherwise
 */
export async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<boolean> {
  const supabase = await createClient()

  // Delete with user verification for security
  // RLS policy will ensure only user's own categories can be deleted (not default ones)
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting category:', error)
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
  const allTransactions = await getTransactions(userId, { startDate, endDate })
  
  // Filter for expenses only and exclude transfers to get pure spending stats
  const transactions = allTransactions.filter(
    (t) => t.type === 'expense' && t.category !== 'Transfer Keluar'
  )

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

/**
 * Get asset growth percentage for current month
 * Calculates: ((currentBalance - startOfMonthBalance) / startOfMonthBalance) * 100
 * @param userId - The user ID
 * @returns Growth percentage (positive or negative)
 */
export async function getAssetGrowth(userId: string): Promise<number> {
  const supabase = await createClient()

  try {
    // Step 1: Get total current balance from wallets
    const totalCurrentBalance = await getTotalBalance(userId)

    // Step 2: Calculate net flow for current month (Income - Expense)
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId)
      .gte('date', startOfMonthStr)

    if (error) {
      console.error('Error fetching transactions for asset growth:', error)
      return 0
    }

    // Calculate net flow (income - expense)
    let netFlow = 0
    if (transactions && transactions.length > 0) {
      netFlow = transactions.reduce((sum: number, t: { type: string; amount: number | string }) => {
        const amount = parseFloat(t.amount.toString())
        if (t.type === 'income') {
          return sum + amount
        } else if (t.type === 'expense') {
          return sum - amount
        }
        return sum
      }, 0)
    }

    // Step 3: Calculate start of month balance
    const startOfMonthBalance = totalCurrentBalance - netFlow

    // Step 4: Calculate growth percentage
    // Handle edge cases
    if (startOfMonthBalance <= 0) {
      // User was at zero or negative balance at start of month
      if (totalCurrentBalance > 0) {
        // Now positive, return 100% growth
        return 100
      }
      // Still zero or negative, return 0
      return 0
    }

    // Normal calculation
    const growthPercentage =
      ((totalCurrentBalance - startOfMonthBalance) / startOfMonthBalance) * 100

    // Round to 1 decimal place
    return Math.round(growthPercentage * 10) / 10
  } catch (error) {
    console.error('Error calculating asset growth:', error)
    return 0
  }
}

/**
 * Get monthly income and expense stats for a user
 * @param userId - The user ID
 * @returns Object containing total income and expense for current month
 */
export async function getMonthlyStats(userId: string): Promise<{ income: number; expense: number }> {
  const supabase = await createClient()
  
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('type, amount, category')
    .eq('user_id', userId)
    .gte('date', startOfMonth)
    .lte('date', endOfMonth)

  if (error) {
    console.error('Error fetching monthly stats:', error)
    return { income: 0, expense: 0 }
  }

  let income = 0
  let expense = 0

  transactions?.forEach((t) => {
    // Exclude 'Transfer Masuk' and 'Transfer Keluar' to avoid double counting if used for transfers
    // Also internal transfers if specific types exist, but here we check category just in case
    if (t.category === 'Transfer Masuk' || t.category === 'Transfer Keluar') return

    // Safety check for amount
    const rawAmount = t.amount
    const amount = rawAmount ? parseFloat(rawAmount.toString()) : 0
    
    if (t.type === 'income') {
      income += amount
    } else if (t.type === 'expense') {
      expense += amount
    }
  })

  return { income, expense }
}

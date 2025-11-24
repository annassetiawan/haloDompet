import { createClient } from '@/lib/supabase/server'

// ============================================
// BUDGET TYPES
// ============================================

export interface Budget {
  id: string
  user_id: string
  category: string
  limit_amount: number
  created_at: string
  updated_at: string
}

export interface BudgetSummary {
  category: string
  limit_amount: number
  spent_amount: number
  percentage_used: number
}

// ============================================
// BUDGET OPERATIONS
// ============================================

/**
 * Get user's budget summary for current month
 * Combines budget limits with actual spending data from transactions
 * @param userId - The user ID
 * @returns Array of budget summaries with spending data
 */
export async function getUserBudgetSummary(userId: string): Promise<BudgetSummary[]> {
  const supabase = await createClient()

  try {
    // Step 1: Get start and end of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const startDateStr = startOfMonth.toISOString().split('T')[0]
    const endDateStr = endOfMonth.toISOString().split('T')[0]

    // Step 2: Get all budgets for this user
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)

    if (budgetError) {
      console.error('Error fetching budgets:', budgetError)
      return []
    }

    if (!budgets || budgets.length === 0) {
      return []
    }

    // Step 3: Get all expense transactions for current month, grouped by category
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('category, amount, type')
      .eq('user_id', userId)
      .gte('date', startDateStr)
      .lte('date', endDateStr)

    if (transactionError) {
      console.error('Error fetching transactions:', transactionError)
      return []
    }

    // Step 4: Calculate spending per category (only expenses)
    const spendingByCategory = new Map<string, number>()

    if (transactions && transactions.length > 0) {
      transactions.forEach((transaction) => {
        // Only count expenses
        if (transaction.type === 'expense' || !transaction.type) {
          const category = transaction.category
          const amount = parseFloat(transaction.amount.toString())
          const currentSpent = spendingByCategory.get(category) || 0
          spendingByCategory.set(category, currentSpent + amount)
        }
      })
    }

    // Step 5: Combine budgets with spending data
    const budgetSummaries: BudgetSummary[] = budgets.map((budget) => {
      const spent = spendingByCategory.get(budget.category) || 0
      const limit = parseFloat(budget.limit_amount.toString())
      const percentage = limit > 0 ? (spent / limit) * 100 : 0

      return {
        category: budget.category,
        limit_amount: limit,
        spent_amount: spent,
        percentage_used: Math.round(percentage * 10) / 10, // Round to 1 decimal
      }
    })

    // Sort by percentage used (highest first) to show over-budget categories first
    budgetSummaries.sort((a, b) => b.percentage_used - a.percentage_used)

    return budgetSummaries
  } catch (error) {
    console.error('Error in getUserBudgetSummary:', error)
    return []
  }
}

/**
 * Get all budgets for a user
 * @param userId - The user ID
 * @returns Array of budgets
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true })

  if (error) {
    console.error('Error fetching budgets:', error)
    return []
  }

  return data || []
}

/**
 * Get a specific budget by category
 * @param userId - The user ID
 * @param category - The category name
 * @returns Budget or null if not found
 */
export async function getBudgetByCategory(
  userId: string,
  category: string
): Promise<Budget | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - budget doesn't exist for this category
      return null
    }
    console.error('Error fetching budget:', error)
    return null
  }

  return data
}

/**
 * Create or update a budget (upsert)
 * @param userId - The user ID
 * @param category - The category name
 * @param limitAmount - The budget limit amount
 * @returns Created/updated budget or null if error
 */
export async function upsertBudget(
  userId: string,
  category: string,
  limitAmount: number
): Promise<Budget | null> {
  const supabase = await createClient()

  // Upsert: Insert new or update existing budget
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: userId,
        category,
        limit_amount: limitAmount,
      },
      {
        onConflict: 'user_id,category',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting budget:', error)
    return null
  }

  return data
}

/**
 * Delete a budget
 * @param userId - The user ID
 * @param category - The category to delete budget for
 * @returns True if successful, false otherwise
 */
export async function deleteBudget(
  userId: string,
  category: string
): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId)
    .eq('category', category)

  if (error) {
    console.error('Error deleting budget:', error)
    return false
  }

  return true
}

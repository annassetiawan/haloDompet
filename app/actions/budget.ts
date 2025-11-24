'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { upsertBudget as upsertBudgetDb, deleteBudget as deleteBudgetDb } from '@/lib/budget'

// ============================================
// SERVER ACTIONS FOR BUDGET MANAGEMENT
// ============================================

/**
 * Server action to create or update a budget
 * @param category - The category name
 * @param limitAmount - The budget limit amount
 * @returns Success status with optional error message
 */
export async function upsertBudgetAction(category: string, limitAmount: number) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please login.',
      }
    }

    // Validate input
    if (!category || category.trim() === '') {
      return {
        success: false,
        error: 'Category is required.',
      }
    }

    if (limitAmount < 0) {
      return {
        success: false,
        error: 'Budget limit must be a positive number.',
      }
    }

    // Upsert budget
    const result = await upsertBudgetDb(user.id, category, limitAmount)

    if (!result) {
      return {
        success: false,
        error: 'Failed to save budget. Please try again.',
      }
    }

    // Revalidate pages that display budget data
    revalidatePath('/')
    revalidatePath('/budget')

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Error in upsertBudgetAction:', error)
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}

/**
 * Server action to delete a budget
 * @param category - The category name to delete budget for
 * @returns Success status with optional error message
 */
export async function deleteBudgetAction(category: string) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Unauthorized. Please login.',
      }
    }

    // Validate input
    if (!category || category.trim() === '') {
      return {
        success: false,
        error: 'Category is required.',
      }
    }

    // Delete budget
    const result = await deleteBudgetDb(user.id, category)

    if (!result) {
      return {
        success: false,
        error: 'Failed to delete budget. Please try again.',
      }
    }

    // Revalidate pages that display budget data
    revalidatePath('/')
    revalidatePath('/budget')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error in deleteBudgetAction:', error)
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}

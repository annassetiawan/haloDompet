-- =====================================================
-- HALODOMPET - MONTHLY CATEGORY BUDGETING FEATURE
-- Migration: Create Budgets Table
-- Description: Allows users to set monthly spending limits per category
-- =====================================================

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount NUMERIC(15,2) NOT NULL CHECK (limit_amount >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one budget per category per user
  CONSTRAINT unique_budget_per_category UNIQUE (user_id, category)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON public.budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_user_category ON public.budgets(user_id, category);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own budgets
CREATE POLICY "Users can view own budgets"
  ON public.budgets
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own budgets
CREATE POLICY "Users can insert own budgets"
  ON public.budgets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own budgets
CREATE POLICY "Users can update own budgets"
  ON public.budgets
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
  ON public.budgets
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================

-- Trigger for budgets table (reusing existing function)
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
--
-- To apply this migration in Supabase:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Paste this entire script
-- 3. Run the script
--
-- To verify:
-- SELECT * FROM public.budgets;
--
-- =====================================================

-- =====================================================
-- HALODOMPET - CUSTOM CATEGORIES FEATURE
-- Migration: Create Categories Table
-- Description: Allows users to create custom transaction categories
-- =====================================================

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique category names per user and type
  -- NULL user_id means global default category
  CONSTRAINT unique_category_per_user UNIQUE (user_id, name, type)
);

-- Create index for faster queries
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can READ default categories (user_id IS NULL) AND their own categories
CREATE POLICY "Users can read default and own categories"
  ON categories
  FOR SELECT
  USING (
    user_id IS NULL OR user_id = auth.uid()
  );

-- Policy 2: Users can CREATE their own categories only
CREATE POLICY "Users can create own categories"
  ON categories
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND user_id IS NOT NULL
  );

-- Policy 3: Users can UPDATE their own categories only (not default categories)
CREATE POLICY "Users can update own categories"
  ON categories
  FOR UPDATE
  USING (
    user_id = auth.uid() AND user_id IS NOT NULL
  )
  WITH CHECK (
    user_id = auth.uid() AND user_id IS NOT NULL
  );

-- Policy 4: Users can DELETE their own categories only (not default categories)
CREATE POLICY "Users can delete own categories"
  ON categories
  FOR DELETE
  USING (
    user_id = auth.uid() AND user_id IS NOT NULL
  );

-- =====================================================
-- SEED DEFAULT CATEGORIES
-- These are global categories available to all users
-- =====================================================

-- Insert default EXPENSE categories
INSERT INTO categories (user_id, name, type) VALUES
  (NULL, 'Makanan', 'expense'),
  (NULL, 'Minuman', 'expense'),
  (NULL, 'Transport', 'expense'),
  (NULL, 'Belanja', 'expense'),
  (NULL, 'Hiburan', 'expense'),
  (NULL, 'Kesehatan', 'expense'),
  (NULL, 'Pendidikan', 'expense'),
  (NULL, 'Tagihan', 'expense'),
  (NULL, 'Olahraga', 'expense'),
  (NULL, 'Lainnya', 'expense')
ON CONFLICT (user_id, name, type) DO NOTHING;

-- Insert default INCOME categories
INSERT INTO categories (user_id, name, type) VALUES
  (NULL, 'Gaji', 'income'),
  (NULL, 'Bonus', 'income'),
  (NULL, 'Investasi', 'income'),
  (NULL, 'Hadiah', 'income'),
  (NULL, 'Penjualan', 'income'),
  (NULL, 'Lainnya', 'income')
ON CONFLICT (user_id, name, type) DO NOTHING;

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
-- SELECT * FROM categories WHERE user_id IS NULL;
--
-- =====================================================

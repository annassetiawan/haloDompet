-- ============================================
-- HALODOMPET DATABASE SCHEMA
-- ============================================
-- Run this SQL in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste & Run

-- ============================================
-- 1. CREATE USERS TABLE
-- ============================================
-- Extends auth.users with app-specific data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  initial_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  mode TEXT CHECK (mode IN ('simple', 'webhook')) DEFAULT 'simple',
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read/update their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CREATE TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  voice_text TEXT,
  location TEXT,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_transactions_user_id
  ON public.transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
  ON public.transactions(date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category
  ON public.transactions(category);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON public.transactions(created_at DESC);

-- ============================================
-- 4. CREATE FUNCTION TO AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for transactions table
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CREATE FUNCTION TO UPDATE BALANCE
-- ============================================
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When inserting new transaction, subtract from balance
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.users
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- When updating transaction, adjust balance
  IF (TG_OP = 'UPDATE') THEN
    UPDATE public.users
    SET current_balance = current_balance + OLD.amount - NEW.amount
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- When deleting transaction, add back to balance
  IF (TG_OP = 'DELETE') THEN
    UPDATE public.users
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update balance on transaction changes
CREATE TRIGGER auto_update_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance();

-- ============================================
-- 6. CREATE FUNCTION TO AUTO-CREATE USER PROFILE
-- ============================================
-- This function runs when a new user signs up via auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Test by creating a transaction
-- 2. Check if RLS policies work correctly
-- 3. Verify triggers are updating balances

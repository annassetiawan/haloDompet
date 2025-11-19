-- ============================================
-- MULTI-WALLET MIGRATION - PHASE 1
-- ============================================
-- This migration adds support for multiple wallets per user
-- Run this SQL in Supabase SQL Editor

-- ============================================
-- 1. CREATE WALLETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0,
  icon TEXT DEFAULT '💰',
  color TEXT DEFAULT '#10b981',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_wallets_user_id
  ON public.wallets(user_id);

CREATE INDEX IF NOT EXISTS idx_wallets_is_default
  ON public.wallets(user_id, is_default);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own wallets
CREATE POLICY "Users can view own wallets"
  ON public.wallets
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets"
  ON public.wallets
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets"
  ON public.wallets
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. CREATE TRIGGER FOR AUTO-UPDATE TIMESTAMPS
-- ============================================
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. CREATE FUNCTION TO ENSURE ONLY ONE DEFAULT WALLET
-- ============================================
-- This function ensures that when a wallet is set as default,
-- all other wallets for the same user are set to non-default
CREATE OR REPLACE FUNCTION ensure_single_default_wallet()
RETURNS TRIGGER AS $$
BEGIN
  -- If this wallet is being set as default
  IF NEW.is_default = true THEN
    -- Set all other wallets for this user to non-default
    UPDATE public.wallets
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default wallet
CREATE TRIGGER enforce_single_default_wallet
  BEFORE INSERT OR UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_wallet();

-- ============================================
-- 6. DATA MIGRATION: CREATE DEFAULT WALLET FOR EXISTING USERS
-- ============================================
-- This script creates a "Tunai" (Cash) wallet for each existing user
-- and migrates their current_balance to this new wallet

DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through all existing users
  FOR user_record IN SELECT id, current_balance FROM public.users
  LOOP
    -- Create default "Tunai" wallet for each user
    INSERT INTO public.wallets (user_id, name, balance, icon, color, is_default)
    VALUES (
      user_record.id,
      'Tunai',
      COALESCE(user_record.current_balance, 0),
      '💵',
      '#10b981',
      true
    );

    -- Log progress (optional, for debugging)
    RAISE NOTICE 'Created default wallet for user: %', user_record.id;
  END LOOP;
END $$;

-- ============================================
-- 7. ADD WALLET_ID TO TRANSACTIONS TABLE
-- ============================================
-- Add wallet_id column to transactions table (nullable for now)
-- This allows us to track which wallet was used for each transaction
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.wallets(id) ON DELETE SET NULL;

-- Create index for wallet_id
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id
  ON public.transactions(wallet_id);

-- ============================================
-- 8. MIGRATE EXISTING TRANSACTIONS TO DEFAULT WALLET
-- ============================================
-- Update all existing transactions to point to the user's default wallet
DO $$
DECLARE
  user_record RECORD;
  default_wallet_id UUID;
BEGIN
  -- Loop through all users
  FOR user_record IN SELECT DISTINCT user_id FROM public.transactions WHERE wallet_id IS NULL
  LOOP
    -- Get the default wallet for this user
    SELECT id INTO default_wallet_id
    FROM public.wallets
    WHERE user_id = user_record.user_id AND is_default = true
    LIMIT 1;

    -- Update all transactions for this user to use the default wallet
    IF default_wallet_id IS NOT NULL THEN
      UPDATE public.transactions
      SET wallet_id = default_wallet_id
      WHERE user_id = user_record.user_id AND wallet_id IS NULL;

      RAISE NOTICE 'Migrated transactions for user: %', user_record.user_id;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 9. UPDATE BALANCE TRIGGER TO USE WALLETS
-- ============================================
-- Replace the old update_user_balance function to work with wallets
-- This will update the wallet balance instead of user balance

CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- When inserting new transaction, subtract from wallet balance
  IF (TG_OP = 'INSERT') THEN
    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance - NEW.amount
    WHERE id = NEW.wallet_id;

    -- Also update user's current_balance for backward compatibility
    UPDATE public.users
    SET current_balance = current_balance - NEW.amount
    WHERE id = NEW.user_id;

    RETURN NEW;
  END IF;

  -- When updating transaction, adjust wallet balance
  IF (TG_OP = 'UPDATE') THEN
    -- If wallet changed, update both old and new wallet
    IF OLD.wallet_id IS DISTINCT FROM NEW.wallet_id THEN
      -- Add back to old wallet
      UPDATE public.wallets
      SET balance = balance + OLD.amount
      WHERE id = OLD.wallet_id;

      -- Subtract from new wallet
      UPDATE public.wallets
      SET balance = balance - NEW.amount
      WHERE id = NEW.wallet_id;
    ELSE
      -- Same wallet, just adjust the difference
      UPDATE public.wallets
      SET balance = balance + OLD.amount - NEW.amount
      WHERE id = NEW.wallet_id;
    END IF;

    -- Update user's current_balance for backward compatibility
    UPDATE public.users
    SET current_balance = current_balance + OLD.amount - NEW.amount
    WHERE id = NEW.user_id;

    RETURN NEW;
  END IF;

  -- When deleting transaction, add back to wallet balance
  IF (TG_OP = 'DELETE') THEN
    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance + OLD.amount
    WHERE id = OLD.wallet_id;

    -- Also update user's current_balance for backward compatibility
    UPDATE public.users
    SET current_balance = current_balance + OLD.amount
    WHERE id = OLD.user_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger
DROP TRIGGER IF EXISTS auto_update_balance ON public.transactions;

-- Create new trigger for wallet balance updates
CREATE TRIGGER auto_update_wallet_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- ============================================
-- 10. CREATE FUNCTION TO GET TOTAL BALANCE
-- ============================================
-- Helper function to calculate total balance across all wallets
CREATE OR REPLACE FUNCTION get_total_balance(p_user_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
  total_balance DECIMAL(15,2);
BEGIN
  SELECT COALESCE(SUM(balance), 0)
  INTO total_balance
  FROM public.wallets
  WHERE user_id = p_user_id;

  RETURN total_balance;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. CREATE FUNCTION TO AUTO-CREATE DEFAULT WALLET FOR NEW USERS
-- ============================================
-- This function runs when a new user signs up
-- It creates a default "Tunai" wallet for them

CREATE OR REPLACE FUNCTION create_default_wallet_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default "Tunai" wallet for new user
  INSERT INTO public.wallets (user_id, name, balance, icon, color, is_default)
  VALUES (
    NEW.id,
    'Tunai',
    COALESCE(NEW.initial_balance, 0),
    '💵',
    '#10b981',
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create default wallet for new users
CREATE TRIGGER auto_create_default_wallet
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_wallet_for_new_user();

-- ============================================
-- MIGRATION COMPLETE!
-- ============================================
-- Summary:
-- ✅ Created wallets table with RLS policies
-- ✅ Migrated existing user balances to default "Tunai" wallet
-- ✅ Added wallet_id to transactions table
-- ✅ Updated balance triggers to use wallets
-- ✅ Created helper functions for total balance calculation
-- ✅ Auto-create default wallet for new users
--
-- Next steps:
-- 1. Update TypeScript types to include Wallet interface
-- 2. Add backend functions: getWallets, createWallet, getTotalBalance
-- 3. Update frontend to display multiple wallets
-- 4. Update transaction creation to use wallet_id
-- ============================================

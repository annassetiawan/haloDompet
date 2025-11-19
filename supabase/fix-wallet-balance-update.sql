-- ============================================
-- FIX: Wallet Balance Update Trigger
-- ============================================
-- This migration fixes the bug where wallet balances don't update
-- when transactions are created because the trigger doesn't differentiate
-- between income and expense transactions.
--
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. ADD TYPE COLUMN TO TRANSACTIONS TABLE
-- ============================================
-- Add type column to differentiate income, expense, and adjustment
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS type TEXT
CHECK (type IN ('income', 'expense', 'adjustment'))
DEFAULT 'expense';

-- Create index for type column for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_type
  ON public.transactions(type);

-- ============================================
-- 2. UPDATE EXISTING TRANSACTIONS
-- ============================================
-- Set default type for existing transactions
-- Transactions with specific income categories will be marked as 'income'
-- All others default to 'expense'

UPDATE public.transactions
SET type = 'income'
WHERE type IS NULL
  AND category IN ('Gaji', 'Pendapatan', 'Bonus', 'Investasi', 'Hadiah', 'Lainnya (Income)');

UPDATE public.transactions
SET type = 'expense'
WHERE type IS NULL;

-- ============================================
-- 3. DROP OLD TRIGGER AND FUNCTION
-- ============================================
DROP TRIGGER IF EXISTS auto_update_wallet_balance ON public.transactions;
DROP TRIGGER IF EXISTS auto_update_balance ON public.transactions;

-- ============================================
-- 4. CREATE NEW WALLET BALANCE UPDATE FUNCTION
-- ============================================
-- This function correctly handles income/expense based on the 'type' column
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
DECLARE
  balance_delta DECIMAL(15,2);
BEGIN
  -- ==========================================
  -- INSERT: Add new transaction
  -- ==========================================
  IF (TG_OP = 'INSERT') THEN
    -- Skip if wallet_id is NULL (shouldn't happen, but safety check)
    IF NEW.wallet_id IS NULL THEN
      RAISE WARNING 'Transaction % has NULL wallet_id, skipping wallet balance update', NEW.id;
      RETURN NEW;
    END IF;

    -- Calculate balance change based on transaction type
    IF NEW.type = 'income' THEN
      balance_delta := NEW.amount;  -- Income increases balance
    ELSE
      balance_delta := -NEW.amount; -- Expense decreases balance (default)
    END IF;

    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance + balance_delta
    WHERE id = NEW.wallet_id;

    -- Update user's current_balance for backward compatibility
    UPDATE public.users
    SET current_balance = current_balance + balance_delta
    WHERE id = NEW.user_id;

    RETURN NEW;
  END IF;

  -- ==========================================
  -- UPDATE: Modify existing transaction
  -- ==========================================
  IF (TG_OP = 'UPDATE') THEN
    -- Skip if both wallet_ids are NULL
    IF OLD.wallet_id IS NULL AND NEW.wallet_id IS NULL THEN
      RAISE WARNING 'Transaction % has NULL wallet_id in both OLD and NEW, skipping wallet balance update', NEW.id;
      RETURN NEW;
    END IF;

    -- Calculate old balance delta
    DECLARE
      old_balance_delta DECIMAL(15,2);
      new_balance_delta DECIMAL(15,2);
    BEGIN
      -- Calculate what the old transaction did to the balance
      IF OLD.type = 'income' THEN
        old_balance_delta := OLD.amount;
      ELSE
        old_balance_delta := -OLD.amount;
      END IF;

      -- Calculate what the new transaction should do to the balance
      IF NEW.type = 'income' THEN
        new_balance_delta := NEW.amount;
      ELSE
        new_balance_delta := -NEW.amount;
      END IF;

      -- If wallet changed, update both old and new wallet
      IF OLD.wallet_id IS DISTINCT FROM NEW.wallet_id THEN
        -- Reverse the old transaction from old wallet
        IF OLD.wallet_id IS NOT NULL THEN
          UPDATE public.wallets
          SET balance = balance - old_balance_delta
          WHERE id = OLD.wallet_id;
        END IF;

        -- Apply the new transaction to new wallet
        IF NEW.wallet_id IS NOT NULL THEN
          UPDATE public.wallets
          SET balance = balance + new_balance_delta
          WHERE id = NEW.wallet_id;
        END IF;
      ELSE
        -- Same wallet, just adjust the difference
        IF NEW.wallet_id IS NOT NULL THEN
          UPDATE public.wallets
          SET balance = balance - old_balance_delta + new_balance_delta
          WHERE id = NEW.wallet_id;
        END IF;
      END IF;

      -- Update user's current_balance for backward compatibility
      UPDATE public.users
      SET current_balance = current_balance - old_balance_delta + new_balance_delta
      WHERE id = NEW.user_id;
    END;

    RETURN NEW;
  END IF;

  -- ==========================================
  -- DELETE: Remove transaction
  -- ==========================================
  IF (TG_OP = 'DELETE') THEN
    -- Skip if wallet_id is NULL
    IF OLD.wallet_id IS NULL THEN
      RAISE WARNING 'Deleted transaction % had NULL wallet_id, skipping wallet balance update', OLD.id;
      RETURN OLD;
    END IF;

    -- Calculate balance delta to reverse
    IF OLD.type = 'income' THEN
      balance_delta := -OLD.amount;  -- Reverse income: decrease balance
    ELSE
      balance_delta := OLD.amount;   -- Reverse expense: increase balance
    END IF;

    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance + balance_delta
    WHERE id = OLD.wallet_id;

    -- Update user's current_balance for backward compatibility
    UPDATE public.users
    SET current_balance = current_balance + balance_delta
    WHERE id = OLD.user_id;

    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. CREATE NEW TRIGGER
-- ============================================
CREATE TRIGGER auto_update_wallet_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- ============================================
-- 6. RECALCULATE ALL WALLET BALANCES
-- ============================================
-- This fixes any incorrect balances from the old broken trigger
-- WARNING: This will recalculate all balances from scratch

DO $$
DECLARE
  wallet_record RECORD;
  calculated_balance DECIMAL(15,2);
BEGIN
  -- Loop through all wallets
  FOR wallet_record IN SELECT id, user_id, name FROM public.wallets
  LOOP
    -- Calculate balance from all transactions
    SELECT COALESCE(SUM(
      CASE
        WHEN type = 'income' THEN amount
        ELSE -amount  -- expense (default)
      END
    ), 0)
    INTO calculated_balance
    FROM public.transactions
    WHERE wallet_id = wallet_record.id;

    -- Update wallet with correct balance
    UPDATE public.wallets
    SET balance = calculated_balance
    WHERE id = wallet_record.id;

    RAISE NOTICE 'Recalculated wallet "%" (%) for user %: Balance = %',
      wallet_record.name,
      wallet_record.id,
      wallet_record.user_id,
      calculated_balance;
  END LOOP;

  -- Also update users.current_balance to match total of all their wallets
  UPDATE public.users u
  SET current_balance = (
    SELECT COALESCE(SUM(balance), 0)
    FROM public.wallets w
    WHERE w.user_id = u.id
  );

  RAISE NOTICE 'Balance recalculation complete!';
END $$;

-- ============================================
-- 7. UPDATE TRANSACTIONS WITH NULL WALLET_ID
-- ============================================
-- Assign default wallet to any transactions that don't have a wallet_id
DO $$
DECLARE
  user_record RECORD;
  default_wallet_id UUID;
  updated_count INTEGER;
BEGIN
  -- Loop through users who have transactions without wallet_id
  FOR user_record IN
    SELECT DISTINCT user_id
    FROM public.transactions
    WHERE wallet_id IS NULL
  LOOP
    -- Get the default wallet for this user
    SELECT id INTO default_wallet_id
    FROM public.wallets
    WHERE user_id = user_record.user_id
      AND is_default = true
    LIMIT 1;

    -- If no default wallet, get any wallet
    IF default_wallet_id IS NULL THEN
      SELECT id INTO default_wallet_id
      FROM public.wallets
      WHERE user_id = user_record.user_id
      LIMIT 1;
    END IF;

    -- Update transactions
    IF default_wallet_id IS NOT NULL THEN
      UPDATE public.transactions
      SET wallet_id = default_wallet_id
      WHERE user_id = user_record.user_id
        AND wallet_id IS NULL;

      GET DIAGNOSTICS updated_count = ROW_COUNT;
      RAISE NOTICE 'Assigned wallet % to % transactions for user %',
        default_wallet_id, updated_count, user_record.user_id;
    ELSE
      RAISE WARNING 'User % has no wallets! Cannot assign wallet_id to transactions.', user_record.user_id;
    END IF;
  END LOOP;
END $$;

-- ============================================
-- 8. VERIFICATION QUERY
-- ============================================
-- Run this to verify the fix worked correctly

SELECT
  w.id as wallet_id,
  w.user_id,
  w.name as wallet_name,
  w.balance as current_balance,
  (
    SELECT COALESCE(SUM(
      CASE
        WHEN t.type = 'income' THEN t.amount
        ELSE -t.amount
      END
    ), 0)
    FROM public.transactions t
    WHERE t.wallet_id = w.id
  ) as calculated_balance,
  (
    w.balance - (
      SELECT COALESCE(SUM(
        CASE
          WHEN t.type = 'income' THEN t.amount
          ELSE -t.amount
        END
      ), 0)
      FROM public.transactions t
      WHERE t.wallet_id = w.id
    )
  ) as difference
FROM public.wallets w
ORDER BY w.user_id, w.name;

-- ============================================
-- SUCCESS! ✅
-- ============================================
-- Summary of changes:
-- ✅ Added 'type' column to transactions table
-- ✅ Updated existing transactions with appropriate type
-- ✅ Created new trigger that correctly handles income/expense
-- ✅ Recalculated all wallet balances from scratch
-- ✅ Assigned default wallet to transactions without wallet_id
-- ✅ Added verification query
--
-- Next steps:
-- 1. Update API to include 'type' parameter in transaction creation
-- 2. Test creating new income and expense transactions
-- 3. Verify balances update correctly
-- ============================================

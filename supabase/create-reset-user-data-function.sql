-- ============================================
-- CREATE RESET USER DATA FUNCTION
-- ============================================
-- This function safely resets all user data without trigger conflicts
-- It disables the auto_update_wallet_balance trigger temporarily

-- Drop function if exists
DROP FUNCTION IF EXISTS reset_user_data(UUID);

-- Create the reset function
CREATE OR REPLACE FUNCTION reset_user_data(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_transactions_count INTEGER;
  v_wallets_count INTEGER;
  v_result JSON;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get counts before deletion
  SELECT COUNT(*) INTO v_transactions_count
  FROM public.transactions
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_wallets_count
  FROM public.wallets
  WHERE user_id = p_user_id;

  -- Disable trigger temporarily to avoid conflicts
  ALTER TABLE public.transactions DISABLE TRIGGER auto_update_wallet_balance;

  -- Delete all transactions for the user
  DELETE FROM public.transactions
  WHERE user_id = p_user_id;

  -- Re-enable trigger
  ALTER TABLE public.transactions ENABLE TRIGGER auto_update_wallet_balance;

  -- Reset all wallet balances to 0
  UPDATE public.wallets
  SET balance = 0
  WHERE user_id = p_user_id;

  -- Reset user's current_balance to 0 for backward compatibility
  UPDATE public.users
  SET current_balance = 0
  WHERE id = p_user_id;

  -- Build result JSON
  v_result := json_build_object(
    'success', true,
    'transactions_deleted', v_transactions_count,
    'wallets_reset', v_wallets_count,
    'user_id', p_user_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-enable trigger in case of error
    ALTER TABLE public.transactions ENABLE TRIGGER auto_update_wallet_balance;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_data(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION reset_user_data(UUID) IS
'Safely resets all user data (transactions and wallet balances) by temporarily disabling triggers to avoid update conflicts';

-- ============================================
-- USAGE EXAMPLE
-- ============================================
-- To reset current user's data:
-- SELECT reset_user_data(auth.uid());
--
-- Result will be JSON:
-- {
--   "success": true,
--   "transactions_deleted": 10,
--   "wallets_reset": 2,
--   "user_id": "..."
-- }
-- ============================================

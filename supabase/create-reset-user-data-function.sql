-- ============================================
-- CREATE RESET USER DATA FUNCTION
-- ============================================
-- This function safely resets all user data without trigger conflicts
-- Using a different approach: batch delete with proper ordering

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

  -- APPROACH: Set wallet_id to NULL first, then delete transactions
  -- This prevents the trigger from trying to update wallet balances

  -- Step 1: Unlink transactions from wallets
  UPDATE public.transactions
  SET wallet_id = NULL
  WHERE user_id = p_user_id;

  -- Step 2: Delete all transactions (trigger won't update wallets since wallet_id is NULL)
  DELETE FROM public.transactions
  WHERE user_id = p_user_id;

  -- Step 3: Reset all wallet balances to 0
  UPDATE public.wallets
  SET balance = 0
  WHERE user_id = p_user_id;

  -- Step 4: Reset user's current_balance to 0 for backward compatibility
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
    -- Re-raise the exception with details
    RAISE EXCEPTION 'Reset failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reset_user_data(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION reset_user_data(UUID) IS
'Safely resets all user data (transactions and wallet balances) by unlinking transactions from wallets before deletion';

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

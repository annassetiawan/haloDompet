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
  v_transaction_id UUID;
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

  -- APPROACH: Delete transactions one by one in a loop to avoid batch conflicts
  -- This is slower but avoids "tuple already modified" error

  -- Step 1: Delete each transaction individually
  FOR v_transaction_id IN
    SELECT id FROM public.transactions WHERE user_id = p_user_id
  LOOP
    DELETE FROM public.transactions WHERE id = v_transaction_id;
  END LOOP;

  -- Step 2: After all transactions deleted, manually reset wallet balances to 0
  -- The trigger should have updated balances during deletion, but we force reset to ensure 0
  UPDATE public.wallets
  SET balance = 0
  WHERE user_id = p_user_id;

  -- Step 3: Reset user's current_balance to 0 for backward compatibility
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
'Safely resets all user data by deleting transactions (which updates wallets via trigger) then force-resetting wallet balances to 0';

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

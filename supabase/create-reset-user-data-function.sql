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

  -- APPROACH: Only delete transactions in this function
  -- Wallet balance reset will be done separately in API endpoint to avoid trigger conflicts

  -- Step 1: Delete each transaction individually
  FOR v_transaction_id IN
    SELECT id FROM public.transactions WHERE user_id = p_user_id
  LOOP
    DELETE FROM public.transactions WHERE id = v_transaction_id;
  END LOOP;

  -- NOTE: We DON'T update wallets here to avoid conflict with trigger
  -- The trigger has already updated wallet balances during deletion
  -- The API endpoint will reset wallet balances to 0 after this function returns

  -- Build result JSON
  v_result := json_build_object(
    'success', true,
    'transactions_deleted', v_transactions_count,
    'wallets_count', v_wallets_count,
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
'Safely resets user data by deleting transactions one-by-one. Wallet balances are reset separately by API endpoint to avoid trigger conflicts.';

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

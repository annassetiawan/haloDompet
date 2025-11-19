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
-- CREATE RESET WALLET BALANCES FUNCTION
-- ============================================
-- Separate function to reset wallet balances
-- Called AFTER transactions are deleted in a separate transaction context

DROP FUNCTION IF EXISTS reset_wallet_balances(UUID);

CREATE OR REPLACE FUNCTION reset_wallet_balances(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_wallet_id UUID;
  v_wallets_reset INTEGER := 0;
  v_result JSON;
BEGIN
  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Reset each wallet balance to 0, one by one
  FOR v_wallet_id IN
    SELECT id FROM public.wallets WHERE user_id = p_user_id
  LOOP
    UPDATE public.wallets
    SET balance = 0
    WHERE id = v_wallet_id;

    v_wallets_reset := v_wallets_reset + 1;
  END LOOP;

  -- Also reset user's current_balance
  UPDATE public.users
  SET current_balance = 0
  WHERE id = p_user_id;

  -- Build result JSON
  v_result := json_build_object(
    'success', true,
    'wallets_reset', v_wallets_reset,
    'user_id', p_user_id
  );

  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Reset wallets failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION reset_wallet_balances(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION reset_wallet_balances(UUID) IS
'Resets all wallet balances to 0 for a user. Called after transactions are deleted.';

-- ============================================
-- USAGE EXAMPLE
-- ============================================
-- IMPORTANT: These functions must be called in SEPARATE RPC calls
-- to avoid trigger conflicts. Do NOT call them in the same transaction.
--
-- Example from API endpoint (app/api/user/reset/route.ts):
--
-- // Step 1: Delete transactions (first RPC call)
-- const { data, error } = await supabase.rpc('reset_user_data', {
--   p_user_id: user.id,
-- })
--
-- // Step 2: Reset wallet balances (SEPARATE RPC call)
-- const { data: walletsData, error: walletsError } = await supabase.rpc('reset_wallet_balances', {
--   p_user_id: user.id,
-- })
--
-- Each function returns JSON:
-- {
--   "success": true,
--   "transactions_deleted": 10,  // from reset_user_data
--   "wallets_reset": 2,           // from reset_wallet_balances
--   "user_id": "..."
-- }
-- ============================================

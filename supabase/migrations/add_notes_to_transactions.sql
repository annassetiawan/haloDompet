-- Migration: Add notes column to transactions table
-- Description: Add a TEXT column to store additional notes/details for transactions
-- This is useful for storing detailed item lists from receipt scans or manual notes

-- Add notes column (nullable)
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS notes TEXT NULL;

-- Add comment to explain the column purpose
COMMENT ON COLUMN transactions.notes IS 'Additional notes or detailed item list from receipt scan. Can contain summary of purchased items or manual notes from user.';

-- Create index for full-text search on notes (optional, for future search feature)
CREATE INDEX IF NOT EXISTS idx_transactions_notes_search
ON transactions USING gin(to_tsvector('indonesian', notes))
WHERE notes IS NOT NULL;

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'transactions'
    AND column_name = 'notes'
  ) THEN
    RAISE NOTICE 'Column "notes" successfully added to transactions table';
  ELSE
    RAISE EXCEPTION 'Failed to add column "notes" to transactions table';
  END IF;
END $$;

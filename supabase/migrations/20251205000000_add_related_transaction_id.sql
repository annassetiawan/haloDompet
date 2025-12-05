-- Add related_transaction_id to transactions table
ALTER TABLE transactions 
ADD COLUMN related_transaction_id UUID REFERENCES transactions(id);

-- Add index for better performance on queries involving related transactions
CREATE INDEX idx_transactions_related_id ON transactions(related_transaction_id);

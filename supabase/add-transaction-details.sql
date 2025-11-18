-- Add location and payment_method columns to transactions table

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN public.transactions.location IS 'Location where transaction occurred (e.g., fore, pertamina, guardian)';
COMMENT ON COLUMN public.transactions.payment_method IS 'Payment method used (e.g., gopay, ovo, cash, credit card)';

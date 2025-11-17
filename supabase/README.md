# HaloDompet Database Setup

## Overview
This directory contains the database schema for HaloDompet. The schema is designed for Supabase PostgreSQL and includes:
- User profiles table
- Transactions table
- Row Level Security (RLS) policies
- Automatic triggers for balance updates
- Indexes for performance optimization

## Setup Instructions

### 1. Prerequisites
- Supabase project created (https://supabase.com/dashboard)
- Environment variables configured in `.env.local`

### 2. Run Schema SQL

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor** (in the left sidebar)
3. Click **"New Query"**
4. Copy the entire content of `schema.sql`
5. Paste into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter`

### 3. Verify Tables

After running the schema, verify the tables were created:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'transactions');
```

You should see:
- `users`
- `transactions`

### 4. Verify RLS Policies

Check if Row Level Security policies are enabled:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('users', 'transactions');
```

Both tables should have `rowsecurity = true`.

### 5. Test Database Functions

#### Test User Profile Creation
When a new user signs up via Google OAuth, a profile should be automatically created:

```sql
-- This trigger runs automatically on auth.users INSERT
-- You can verify by checking the trigger exists:
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

#### Test Balance Update Trigger
The `update_user_balance()` function automatically updates user balance when transactions are created/updated/deleted.

Verify the trigger exists:

```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'auto_update_balance';
```

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY,              -- References auth.users(id)
  email TEXT NOT NULL,
  initial_balance DECIMAL(15,2),   -- Saldo awal
  current_balance DECIMAL(15,2),   -- Saldo saat ini (auto-updated)
  mode TEXT,                        -- 'simple' or 'webhook'
  webhook_url TEXT,                 -- n8n webhook URL (optional)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Transactions Table
```sql
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY,
  user_id UUID,                     -- References users(id)
  item TEXT NOT NULL,               -- Item yang dibeli
  amount DECIMAL(15,2) NOT NULL,    -- Jumlah pengeluaran
  category TEXT NOT NULL,           -- Kategori (makanan, transport, etc)
  date DATE NOT NULL,               -- Tanggal transaksi
  voice_text TEXT,                  -- Original voice transcript
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled. Users can only:
- View their own data
- Insert their own data
- Update their own data
- Delete their own data

### Automatic Triggers

#### 1. Auto-Create User Profile
When a new user signs up:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  EXECUTE FUNCTION handle_new_user();
```

#### 2. Auto-Update Balance
When a transaction is created/updated/deleted:
```sql
CREATE TRIGGER auto_update_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  EXECUTE FUNCTION update_user_balance();
```

#### 3. Auto-Update Timestamps
Both tables have triggers to update `updated_at`:
```sql
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON public.[table]
  EXECUTE FUNCTION update_updated_at_column();
```

## Performance Indexes

Indexes created for optimal query performance:

```sql
-- Transactions indexes
idx_transactions_user_id      -- For user's transactions lookup
idx_transactions_date          -- For date-based queries (DESC)
idx_transactions_category      -- For category filtering
idx_transactions_created_at    -- For recent transactions
```

## API Routes

The database is accessed via these API routes:

### User Routes
- `POST /api/user` - Create/update user profile
- `GET /api/user` - Get user profile
- `PUT /api/user` - Update user profile

### Transaction Routes
- `POST /api/transaction` - Create new transaction
- `GET /api/transaction` - Get all transactions (with filters)
- `GET /api/transaction/[id]` - Get single transaction
- `PUT /api/transaction/[id]` - Update transaction
- `DELETE /api/transaction/[id]` - Delete transaction

## Troubleshooting

### Common Issues

#### 1. "permission denied for schema public"
**Solution:** Run the schema SQL in the Supabase SQL Editor, not in a local psql client.

#### 2. "relation 'users' already exists"
**Solution:** The table already exists. You can drop it first:
```sql
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```
Then re-run the schema.

#### 3. RLS policies blocking inserts
**Solution:** Make sure you're authenticated. Check:
```sql
SELECT auth.uid();
```
Should return your user ID, not NULL.

#### 4. Balance not updating automatically
**Solution:** Check if the trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'auto_update_balance';
```

## Data Migration

If you have existing data in localStorage, you can migrate it via the API:

```javascript
// Example migration script (run in browser console)
const initialBalance = localStorage.getItem('halodompet_initial_balance');
const mode = localStorage.getItem('halodompet_mode');
const webhookUrl = localStorage.getItem('halodompet_webhook_url');

await fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    initial_balance: parseFloat(initialBalance),
    mode,
    webhook_url: webhookUrl,
  }),
});
```

## Backup

To backup your data:

1. Go to Supabase Dashboard
2. Navigate to: **Database** > **Backups**
3. Supabase automatically creates daily backups
4. For manual backup, use the SQL Editor:

```sql
-- Export users
COPY (SELECT * FROM public.users) TO STDOUT WITH CSV HEADER;

-- Export transactions
COPY (SELECT * FROM public.transactions) TO STDOUT WITH CSV HEADER;
```

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the schema in `schema.sql`
- Check API route implementations in `app/api/`

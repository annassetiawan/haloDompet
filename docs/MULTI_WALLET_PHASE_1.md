# Multi-Wallet Feature - Fase 1 Implementation Guide

## Overview
Fase 1 fokus pada **Database Schema & Dashboard UI** untuk fitur Multi-Wallet. User sekarang bisa memiliki banyak dompet (misal: Tunai, BCA, GoPay).

## What's New in Phase 1

### ✅ Database Changes
- **New Table**: `wallets` dengan kolom:
  - `id` (uuid, PK)
  - `user_id` (uuid, FK ke users)
  - `name` (text) - nama dompet (misal: "Tunai", "BCA")
  - `balance` (numeric) - saldo dompet
  - `icon` (text) - emoji/icon untuk dompet
  - `color` (text) - warna untuk card dompet
  - `is_default` (boolean) - flag default wallet
  - `created_at`, `updated_at`

- **Updated Table**: `transactions`
  - Added `wallet_id` (uuid, FK ke wallets)

- **New Functions**:
  - `ensure_single_default_wallet()` - Ensure hanya 1 default wallet per user
  - `get_total_balance(user_id)` - Hitung total balance dari semua wallets
  - `create_default_wallet_for_new_user()` - Auto create wallet "Tunai" untuk user baru
  - `update_wallet_balance()` - Update wallet balance saat transaction berubah

### ✅ Backend Changes
- **New Types**: `Wallet` interface di `types/index.ts`
- **New Functions** di `lib/db.ts`:
  - `getWallets(userId)` - Get all wallets
  - `getDefaultWallet(userId)` - Get default wallet
  - `createWallet(userId, data)` - Create new wallet
  - `updateWallet(walletId, updates)` - Update wallet
  - `deleteWallet(userId, walletId)` - Delete wallet
  - `getTotalBalance(userId)` - Get total balance across all wallets

- **New API Endpoint**: `/api/wallet`
  - `GET` - Get all wallets + total balance
  - `POST` - Create new wallet

### ✅ Frontend Changes
- **New Component**: `WalletCarousel.tsx` - Horizontal scrollable wallet cards
  - Card pertama: "Total Aset" (sum semua wallet)
  - Card selanjutnya: Individual wallet cards
  - Eye toggle untuk hide/show balance
  - Add wallet placeholder card

- **Updated**: `app/page.tsx` - Dashboard menggunakan `WalletCarousel`

### ✅ Data Migration
- Auto create default "Tunai" wallet untuk existing users
- Migrate `users.current_balance` ke wallet default
- Assign semua existing transactions ke default wallet

---

## Installation Steps

### 1. Run Database Migration

**Option A: Supabase Dashboard (Recommended)**
1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Navigate ke **SQL Editor**
4. Buka file `/supabase/migration-multi-wallet-phase-1.sql`
5. Copy-paste isinya ke SQL Editor
6. Click **Run** atau tekan `Ctrl/Cmd + Enter`
7. Tunggu sampai selesai (cek notifications)

**Option B: Supabase CLI**
```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Link project (jika belum)
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

### 2. Verify Migration Success

Setelah migration berhasil, verify dengan query berikut di SQL Editor:

```sql
-- Check wallets table created
SELECT * FROM public.wallets LIMIT 5;

-- Check if existing users got default wallet
SELECT
  u.email,
  w.name,
  w.balance,
  w.is_default
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Check total balance function works
SELECT get_total_balance('YOUR_USER_ID');
```

Expected results:
- ✅ Wallets table exists dengan RLS policies
- ✅ Setiap existing user punya 1 wallet "Tunai" dengan `is_default = true`
- ✅ Balance di wallet sama dengan `users.current_balance` sebelumnya
- ✅ Function `get_total_balance()` return correct total

### 3. Deploy Frontend Changes

Jika menggunakan Vercel/production:
```bash
# Commit changes
git add .
git commit -m "feat: Add multi-wallet support (Phase 1)"
git push origin claude/multi-wallet-phase-one-01NWvaQw6XZyZpFfiormRQ8J

# Deploy akan otomatis trigger
```

Jika local development:
```bash
# Install dependencies (jika ada yang baru)
npm install

# Run dev server
npm run dev
```

---

## Testing Checklist

### ✅ Database Testing
- [ ] Migration runs without errors
- [ ] All existing users have default "Tunai" wallet
- [ ] Wallet balances match previous user balances
- [ ] RLS policies work (users can't see other users' wallets)
- [ ] Default wallet constraint works (only 1 default per user)

### ✅ API Testing
```bash
# Test GET wallets
curl -X GET http://localhost:3000/api/wallet \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response:
{
  "success": true,
  "wallets": [
    {
      "id": "...",
      "user_id": "...",
      "name": "Tunai",
      "balance": 1000000,
      "icon": "💵",
      "color": "#10b981",
      "is_default": true
    }
  ],
  "totalBalance": 1000000
}

# Test POST create wallet
curl -X POST http://localhost:3000/api/wallet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Bank BCA",
    "balance": 5000000,
    "icon": "🏦",
    "color": "#3B82F6"
  }'
```

### ✅ Frontend Testing
- [ ] Dashboard loads without errors
- [ ] WalletCarousel displays correctly
- [ ] "Total Aset" card shows sum of all wallets
- [ ] Individual wallet cards display name, icon, balance
- [ ] Horizontal scroll works smoothly on mobile
- [ ] Eye toggle hides/shows balances
- [ ] Responsive design (mobile & desktop)

### ✅ Transaction Testing
- [ ] Create new transaction works (assigns to default wallet)
- [ ] Wallet balance updates after transaction
- [ ] User's total balance updates correctly
- [ ] Transaction list displays correctly

---

## What's NOT Changed Yet (Phase 2)

⚠️ **Important Notes:**
- **Transaction Input**: Masih menggunakan default wallet
- **AI Voice**: Belum bisa pilih wallet specific
- **Wallet Management**: Belum ada UI untuk edit/delete wallet
- **Transfer Between Wallets**: Belum tersedia

Fitur-fitur di atas akan diimplementasikan di **Phase 2**.

---

## Rollback Plan

Jika terjadi masalah, rollback dengan SQL berikut:

```sql
-- WARNING: This will delete all wallet data!
-- Backup your data first before running this

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS auto_update_wallet_balance ON public.transactions;
DROP TRIGGER IF EXISTS auto_create_default_wallet ON public.users;
DROP TRIGGER IF EXISTS enforce_single_default_wallet ON public.wallets;
DROP TRIGGER IF EXISTS update_wallets_updated_at ON public.wallets;

-- Drop functions
DROP FUNCTION IF EXISTS update_wallet_balance();
DROP FUNCTION IF EXISTS create_default_wallet_for_new_user();
DROP FUNCTION IF EXISTS ensure_single_default_wallet();
DROP FUNCTION IF EXISTS get_total_balance(UUID);

-- Remove wallet_id from transactions
ALTER TABLE public.transactions DROP COLUMN IF EXISTS wallet_id;

-- Drop wallets table
DROP TABLE IF EXISTS public.wallets;

-- Recreate old balance trigger
CREATE TRIGGER auto_update_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_balance();

COMMIT;
```

---

## Support & Troubleshooting

### Common Issues

**Issue**: Migration fails with "relation already exists"
- **Solution**: Drop existing tables first atau skip yang error

**Issue**: RLS policies block access
- **Solution**: Check `auth.uid()` matches user_id in policies

**Issue**: Default wallet not created
- **Solution**: Run migration script section 6 manually

**Issue**: Frontend shows empty wallets
- **Solution**: Check API response, verify RLS policies

---

## Next Steps (Phase 2)

1. **Wallet Management UI**
   - Add/Edit/Delete wallet
   - Set default wallet
   - Adjust wallet balance

2. **Transaction Wallet Selection**
   - Pilih wallet saat create transaction
   - AI Voice integration untuk detect payment method

3. **Transfer Between Wallets**
   - Transfer balance antar wallet
   - Transaction type: "transfer"

4. **Analytics Per Wallet**
   - Spending breakdown per wallet
   - Wallet usage statistics

---

## Files Changed

### Database
- `/supabase/migration-multi-wallet-phase-1.sql` (NEW)

### Backend
- `/types/index.ts` (MODIFIED - added Wallet interface)
- `/lib/db.ts` (MODIFIED - added wallet functions)
- `/app/api/wallet/route.ts` (NEW)
- `/app/api/transaction/route.ts` (MODIFIED - added wallet_id support)

### Frontend
- `/components/WalletCarousel.tsx` (NEW)
- `/app/page.tsx` (MODIFIED - use WalletCarousel)
- `/app/globals.css` (MODIFIED - added scrollbar-hide)

### Documentation
- `/docs/MULTI_WALLET_PHASE_1.md` (NEW - this file)

---

## Questions?

If you have any questions or issues, please:
1. Check Supabase logs for database errors
2. Check browser console for frontend errors
3. Check server logs for API errors
4. Review migration SQL file for any missed steps

Good luck with your Multi-Wallet implementation! 🎉

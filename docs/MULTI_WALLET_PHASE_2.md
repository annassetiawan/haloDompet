# Multi-Wallet Feature - Fase 2 Implementation Guide

## Overview
Fase 2 fokus pada **Wallet Management UI & Transaction Wallet Selection**. User sekarang bisa:
- ✅ Membuat, edit, dan hapus wallet
- ✅ Set wallet default
- ✅ Pilih wallet saat create transaction

## What's New in Phase 2

### ✅ Wallet Management UI

**1. Add Wallet Dialog** (`components/AddWalletDialog.tsx`)
- Form untuk create wallet baru
- Input: nama, saldo awal, icon, warna
- Preview real-time
- Validation & error handling
- Toast notification saat berhasil

**2. Edit Wallet Dialog** (`components/EditWalletDialog.tsx`)
- Edit nama, icon, warna wallet
- Set wallet sebagai default
- Delete wallet (dengan konfirmasi)
- Proteksi: tidak bisa delete default wallet
- Warning saat delete (transaksi akan kehilangan referensi)

**3. Updated WalletCarousel** (`components/WalletCarousel.tsx`)
- Action menu (⋮) di setiap wallet card
- Dropdown menu dengan opsi:
  - Edit Dompet
  - Jadikan Default (jika bukan default)
- Integration dengan AddWalletDialog & EditWalletDialog

### ✅ Transaction Wallet Selection

**1. Wallet Selector Component** (`components/WalletSelector.tsx`)
- Radio button grid untuk pilih wallet
- Menampilkan icon, nama, balance setiap wallet
- Auto-select default wallet jika tidak dipilih
- Responsive design (2 columns)

**2. Updated Transaction Flow**
- Review dialog sekarang include wallet selector
- User bisa pilih wallet sebelum confirm transaction
- Jika tidak pilih, otomatis gunakan default wallet
- Transaction API menerima `wallet_id` parameter

### ✅ API Endpoints

**New Endpoint:** `/api/wallet/[id]`
- **PUT** - Update wallet details (name, icon, color, is_default)
- **DELETE** - Delete wallet (dengan validasi)

**Updated Endpoint:** `/api/transaction`
- Accept `wallet_id` in request body
- Auto-assign ke default wallet jika tidak ada

### ✅ UI/UX Improvements

**Icon & Color Picker:**
- 8 icon options: 💵 🏦 💳 📱 💰 🪙 💎 🎯
- 8 color options: Green, Blue, Orange, Red, Purple, Pink, Cyan, Lime
- Live preview saat memilih

**Wallet Cards:**
- Gradient background based on wallet color
- Icon dengan background color matching
- "Default" badge untuk default wallet
- More options menu (⋮) untuk actions

**Review Dialog:**
- Wallet selector terintegrasi
- 2-column radio grid
- Visual feedback saat dipilih
- Auto-select default wallet

---

## Installation Steps

### No Database Migration Needed

Fase 2 hanya menambah UI dan logic, tidak ada perubahan database. Jika Anda sudah menjalankan migration Fase 1, langsung deploy frontend.

### Deploy Frontend Changes

**Local Development:**
```bash
npm run dev
```

**Production:**
```bash
git add .
git commit -m "feat: Add Multi-Wallet Phase 2 - Wallet Management & Transaction Selection"
git push origin claude/multi-wallet-phase-one-01NWvaQw6XZyZpFfiormRQ8J
```

---

## Testing Checklist

### ✅ Wallet Management Testing

**Add Wallet:**
- [ ] Buka dashboard
- [ ] Scroll wallet carousel ke kanan
- [ ] Click card "Tambah Dompet" atau button "+ Tambah"
- [ ] Isi form: nama, saldo (opsional), pilih icon, pilih warna
- [ ] Preview terlihat sesuai
- [ ] Click "Buat Dompet"
- [ ] Wallet baru muncul di carousel
- [ ] Toast notification muncul

**Edit Wallet:**
- [ ] Click menu (⋮) di wallet card
- [ ] Click "Edit Dompet"
- [ ] Ubah nama / icon / warna
- [ ] Click "Simpan"
- [ ] Perubahan terlihat di carousel
- [ ] Toast notification muncul

**Set Default Wallet:**
- [ ] Click menu (⋮) di non-default wallet
- [ ] Click "Jadikan Default"
- [ ] Wallet sekarang punya badge "Default"
- [ ] Wallet lama kehilangan badge "Default"
- [ ] Toast notification muncul

**Delete Wallet:**
- [ ] Pastikan wallet bukan default (jika default, set wallet lain jadi default dulu)
- [ ] Click menu (⋮) di wallet yang mau dihapus
- [ ] Click "Edit Dompet"
- [ ] Click button "Hapus"
- [ ] Konfirmasi dialog muncul
- [ ] Click "Hapus Dompet"
- [ ] Wallet hilang dari carousel
- [ ] Toast notification muncul

**Delete Protection:**
- [ ] Try delete default wallet
- [ ] Button "Hapus" tidak muncul (disabled/hidden)
- [ ] Atau muncul error "Cannot delete default wallet"

### ✅ Transaction Wallet Selection Testing

**Voice Recording dengan Wallet Selection:**
- [ ] Rekam suara transaksi
- [ ] Review dialog muncul
- [ ] Wallet selector tampil di bawah transcript
- [ ] Default wallet ter-select otomatis
- [ ] Pilih wallet lain
- [ ] Visual feedback (border primary, background gradient)
- [ ] Click "Proses"
- [ ] Transaction tersimpan
- [ ] Wallet balance update sesuai

**Default Wallet Behavior:**
- [ ] Jangan pilih wallet di review dialog
- [ ] Click "Proses"
- [ ] Transaction masuk ke default wallet
- [ ] Balance default wallet berkurang

**Multiple Wallets:**
- [ ] Create 3-4 wallet berbeda
- [ ] Rekam transaksi, pilih "Bank BCA"
- [ ] Cek balance "Bank BCA" berkurang
- [ ] Rekam transaksi lagi, pilih "GoPay"
- [ ] Cek balance "GoPay" berkurang
- [ ] Balance wallet lain tidak berubah

### ✅ UI/UX Testing

**Responsive Design:**
- [ ] Mobile: Wallet carousel scroll horizontal smooth
- [ ] Mobile: Wallet selector 2 columns
- [ ] Mobile: Dialog fit screen
- [ ] Desktop: Wallet carousel tampil bagus
- [ ] Desktop: Dialog centered

**Visual Consistency:**
- [ ] Icon & color terlihat di semua tempat (carousel, selector, dialog)
- [ ] Gradient background konsisten
- [ ] Typography & spacing rapi
- [ ] Dark mode support (test di light & dark)

**Error Handling:**
- [ ] Create wallet dengan nama kosong → error
- [ ] Create wallet dengan saldo negatif → error
- [ ] Delete wallet yang punya transactions → warning
- [ ] Network error → toast error

---

## File Changes Summary

### New Components
- `components/AddWalletDialog.tsx` (NEW) - Dialog create wallet
- `components/EditWalletDialog.tsx` (NEW) - Dialog edit/delete wallet
- `components/WalletSelector.tsx` (NEW) - Wallet selector untuk transaction

### Updated Components
- `components/WalletCarousel.tsx` (MODIFIED) - Added action menu & dialogs integration
- `app/page.tsx` (MODIFIED) - Added wallet management handlers & wallet selector

### New API
- `app/api/wallet/[id]/route.ts` (NEW) - PUT & DELETE endpoints

### Documentation
- `docs/MULTI_WALLET_PHASE_2.md` (NEW) - This file

---

## User Flow Examples

### Flow 1: Membuat Wallet Baru "Bank BCA"

1. User buka dashboard
2. Scroll wallet carousel ke kanan
3. Click card "Tambah Dompet"
4. Dialog muncul
5. Isi nama: "Bank BCA"
6. Isi saldo: 5000000
7. Pilih icon: 🏦
8. Pilih warna: Blue (#3b82f6)
9. Preview terlihat bagus
10. Click "Buat Dompet"
11. Toast: "Dompet 'Bank BCA' berhasil dibuat!"
12. Wallet carousel reload
13. Card "Bank BCA" muncul dengan icon 🏦 dan warna biru

### Flow 2: Transaction dengan Wallet Selection

1. User rekam suara: "Beli kopi 25000"
2. Review dialog muncul dengan transcript
3. Wallet selector tampil:
   - "Tunai" (default) ✓ ter-select
   - "Bank BCA"
   - "GoPay"
4. User click "Bank BCA"
5. Visual feedback: border primary, background gradient blue
6. User edit transcript jika perlu
7. Click "Proses"
8. AI extract data: item="kopi", amount=25000
9. Transaction saved dengan wallet_id="bank-bca-id"
10. Balance "Bank BCA" berkurang Rp 25,000
11. Toast: "kopi - Rp 25,000 tercatat!"
12. Wallet carousel & transaction list reload

### Flow 3: Set "GoPay" sebagai Default Wallet

1. User click menu (⋮) di card "GoPay"
2. Dropdown muncul
3. Click "Jadikan Default"
4. Toast: "'GoPay' sekarang menjadi dompet default"
5. Badge "Default" pindah dari "Tunai" ke "GoPay"
6. Wallet carousel reload
7. "GoPay" sekarang muncul pertama (setelah Total Aset)
8. Transaction selanjutnya default ke "GoPay"

---

## Known Limitations & Future Enhancements

### Current Limitations

**⚠️ Transaction History:**
- Jika wallet dihapus, transactions kehilangan referensi wallet_id
- Transaction history masih ada, tapi wallet_id = null
- Tidak ada cascade delete (by design untuk data safety)

**⚠️ Balance Adjustment:**
- Belum ada UI untuk adjust balance wallet
- Balance hanya update via transactions
- Manual adjustment perlu edit langsung di database

### Future Enhancements (Phase 3)

**1. Transfer Between Wallets**
- Transfer saldo antar wallet
- Transaction type: "transfer"
- Update balance 2 wallet sekaligus

**2. Wallet Balance Adjustment**
- Manual adjust balance (koreksi/penyesuaian)
- Transaction type: "adjustment"
- Notes/reason field

**3. Analytics Per Wallet**
- Spending breakdown per wallet
- Wallet usage statistics
- Most used wallet

**4. Payment Method Detection**
- AI detect payment method dari voice ("bayar pakai gopay")
- Auto-assign ke wallet matching payment method
- Smart wallet suggestion

**5. Wallet Categories**
- Group wallets by type (Cash, Bank, E-Wallet, Investment)
- Category-based filters & reports

---

## Troubleshooting

### Issue: "Cannot delete default wallet"
**Solution:** Set another wallet as default first, then delete.

### Issue: Wallet selector tidak tampil di review dialog
**Solution:**
1. Check wallets loaded (`isLoadingWallets = false`)
2. Check `wallets.length > 0`
3. Check console for errors

### Issue: Transaction tidak masuk ke wallet yang dipilih
**Solution:**
1. Check `selectedWalletId` state di review dialog
2. Check network tab, pastikan `wallet_id` dikirim ke API
3. Check API response, pastikan `wallet_id` ada di transaction

### Issue: Wallet balance tidak update setelah transaction
**Solution:**
1. Check database trigger `auto_update_wallet_balance` running
2. Check transaction has `wallet_id` not null
3. Reload page, check if balance updated

---

## Migration from Phase 1

Jika Anda sudah running **Phase 1**, tidak perlu migration lagi. Cukup:

1. Pull latest code
2. `npm install` (jika ada dependencies baru)
3. `npm run dev`
4. Test wallet management features

Semua existing wallets dari Phase 1 sudah kompatibel dengan Phase 2.

---

## Next Steps

### Immediate
1. ✅ Deploy ke production
2. ✅ Test dengan real users
3. ✅ Collect feedback

### Short-term (Phase 3)
1. Implementasi transfer antar wallet
2. Balance adjustment UI
3. Analytics per wallet

### Long-term
1. Payment method detection & smart wallet assignment
2. Wallet categories & grouping
3. Multi-currency support (?)

---

## Questions?

If you have any questions or issues:
1. Check Phase 1 documentation untuk database setup
2. Check browser console for frontend errors
3. Check network tab for API errors
4. Check server logs for backend errors

Happy wallet managing! 💰🎉

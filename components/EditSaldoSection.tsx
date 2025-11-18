'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Wallet, TrendingUp, TrendingDown, Plus, AlertCircle } from 'lucide-react';

interface EditSaldoSectionProps {
  userId: string;
  initialBalance: number;
  currentBalance: number;
  onBalanceUpdate: () => void; // Callback to refresh data
}

export function EditSaldoSection({
  userId,
  initialBalance,
  currentBalance,
  onBalanceUpdate
}: EditSaldoSectionProps) {
  const [showEditAwal, setShowEditAwal] = useState(false);
  const [showKoreksi, setShowKoreksi] = useState(false);
  const [showPemasukan, setShowPemasukan] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Manajemen Saldo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance Display */}
        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
          <p className="text-4xl font-bold">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(currentBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Saldo awal: {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(initialBalance)}
          </p>
        </div>

        {/* Option 1: Edit Saldo Awal */}
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                1️⃣ Edit Saldo Awal
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ubah saldo awal, saldo sekarang akan dihitung ulang otomatis
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowEditAwal(!showEditAwal);
                setShowKoreksi(false);
                setShowPemasukan(false);
              }}
            >
              {showEditAwal ? 'Tutup' : 'Edit'}
            </Button>
          </div>

          {showEditAwal && (
            <EditSaldoAwalForm
              currentSaldoAwal={initialBalance}
              currentSaldo={currentBalance}
              onSuccess={() => {
                setShowEditAwal(false);
                onBalanceUpdate();
              }}
            />
          )}
        </div>

        {/* Option 2: Koreksi Saldo Manual */}
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                2️⃣ Koreksi Saldo Manual
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sesuaikan saldo jika ada transaksi yang belum tercatat
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowKoreksi(!showKoreksi);
                setShowEditAwal(false);
                setShowPemasukan(false);
              }}
            >
              {showKoreksi ? 'Tutup' : 'Koreksi'}
            </Button>
          </div>

          {showKoreksi && (
            <KoreksiSaldoForm
              currentSaldo={currentBalance}
              onSuccess={() => {
                setShowKoreksi(false);
                onBalanceUpdate();
              }}
            />
          )}
        </div>

        {/* Option 3: Tambah Pemasukan */}
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold flex items-center gap-2">
                3️⃣ Tambah Pemasukan
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Catat gajian, transfer, atau uang masuk lainnya
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setShowPemasukan(!showPemasukan);
                setShowEditAwal(false);
                setShowKoreksi(false);
              }}
              className="gap-2"
            >
              {showPemasukan ? 'Tutup' : <><Plus className="h-4 w-4" /> Pemasukan</>}
            </Button>
          </div>

          {showPemasukan && (
            <TambahPemasukanForm
              onSuccess={() => {
                setShowPemasukan(false);
                onBalanceUpdate();
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// === Form Components ===

function EditSaldoAwalForm({
  currentSaldoAwal,
  currentSaldo,
  onSuccess
}: {
  currentSaldoAwal: number;
  currentSaldo: number;
  onSuccess: () => void
}) {
  const [newSaldoAwal, setNewSaldoAwal] = useState(currentSaldoAwal);
  const [loading, setLoading] = useState(false);

  const simulatedSaldo = useMemo(() => {
    // Simulate what the new saldo_sekarang will be
    const diff = newSaldoAwal - currentSaldoAwal;
    return currentSaldo + diff;
  }, [newSaldoAwal, currentSaldoAwal, currentSaldo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/update-saldo-awal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initial_balance: newSaldoAwal })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update');
      }

      toast.success(`Saldo awal diubah! Saldo sekarang: ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(data.current_balance)}`);
      onSuccess();

    } catch (error) {
      console.error('Error updating saldo awal:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal update saldo awal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label>Saldo Awal Baru</Label>
        <Input
          type="number"
          value={newSaldoAwal}
          onChange={(e) => setNewSaldoAwal(Number(e.target.value))}
          placeholder="Rp 0"
          min="0"
          required
        />
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          💡 Preview: Saldo sekarang akan berubah jadi{' '}
          <strong>{new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(simulatedSaldo)}</strong>
        </AlertDescription>
      </Alert>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>
    </form>
  );
}

function KoreksiSaldoForm({
  currentSaldo,
  onSuccess
}: {
  currentSaldo: number;
  onSuccess: () => void
}) {
  const [targetSaldo, setTargetSaldo] = useState(currentSaldo);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const difference = targetSaldo - currentSaldo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transaction/adjustment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_balance: targetSaldo,
          notes: reason || 'Koreksi saldo manual'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust');
      }

      toast.success('Saldo berhasil dikoreksi!');
      onSuccess();

    } catch (error) {
      console.error('Error adjusting saldo:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal koreksi saldo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label>Saldo Seharusnya</Label>
        <Input
          type="number"
          value={targetSaldo}
          onChange={(e) => setTargetSaldo(Number(e.target.value))}
          placeholder="Rp 0"
          required
        />
      </div>

      <div>
        <Label>Alasan Koreksi (opsional)</Label>
        <Input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Lupa catat transaksi kemarin"
        />
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {difference > 0 ? (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>💰 Akan menambah {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(difference)}</span>
            </div>
          ) : difference < 0 ? (
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span>💸 Akan mengurangi {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(Math.abs(difference))}</span>
            </div>
          ) : (
            <span>✅ Tidak ada perubahan</span>
          )}
          <div className="text-xs mt-2">
            Transaksi penyesuaian akan muncul di history
          </div>
        </AlertDescription>
      </Alert>

      <Button type="submit" disabled={loading || difference === 0}>
        {loading ? 'Menyimpan...' : 'Koreksi Saldo'}
      </Button>
    </form>
  );
}

function TambahPemasukanForm({
  onSuccess
}: {
  onSuccess: () => void
}) {
  const [item, setItem] = useState('');
  const [jumlah, setJumlah] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transaction/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          amount: jumlah
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add income');
      }

      toast.success(`Pemasukan ${new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(jumlah)} berhasil ditambahkan!`);
      onSuccess();

    } catch (error) {
      console.error('Error adding income:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal tambah pemasukan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <Label>Dari</Label>
        <Input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Contoh: Gajian, Transfer dari Budi"
          required
        />
      </div>

      <div>
        <Label>Jumlah</Label>
        <Input
          type="number"
          value={jumlah}
          onChange={(e) => setJumlah(Number(e.target.value))}
          placeholder="Rp 0"
          min="1"
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="gap-2">
        {loading ? 'Menyimpan...' : (
          <>
            <Plus className="h-4 w-4" />
            Tambah {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(jumlah)}
          </>
        )}
      </Button>
    </form>
  );
}

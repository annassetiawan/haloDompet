import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { WalletSelector } from "@/components/WalletSelector"
import { XCircle, CheckCircle2 } from "lucide-react"
import { Wallet } from "@/types"

export interface ScannedData {
  item: string
  amount: number
  category: string
  note: string | null
}

interface ScanReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: ScannedData | null
  onDataChange: (data: ScannedData | null) => void
  onConfirm: () => void
  onCancel: () => void
  wallets: Wallet[]
  selectedWalletId: string | null
  onSelectWallet: (id: string | null) => void
  isProcessing?: boolean
}

export function ScanReviewDialog({
  open,
  onOpenChange,
  data,
  onDataChange,
  onConfirm,
  onCancel,
  wallets,
  selectedWalletId,
  onSelectWallet,
  isProcessing = false,
}: ScanReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] sm:max-w-md overflow-x-hidden rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Hasil Scan</DialogTitle>
          <DialogDescription>
            Periksa dan edit hasil scan struk sebelum menyimpan transaksi.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="space-y-2">
            <label
              htmlFor="scan-item"
              className="text-sm font-medium text-foreground"
            >
              Nama Merchant:
            </label>
            <Input
              id="scan-item"
              value={data?.item || ""}
              onChange={(e) =>
                onDataChange(data ? { ...data, item: e.target.value } : null)
              }
              placeholder="Contoh: Alfamart"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="scan-amount"
              className="text-sm font-medium text-foreground"
            >
              Jumlah (Rp):
            </label>
            <Input
              id="scan-amount"
              type="number"
              value={data?.amount || 0}
              onChange={(e) =>
                onDataChange(
                  data ? { ...data, amount: Number(e.target.value) } : null
                )
              }
              placeholder="0"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="scan-category"
              className="text-sm font-medium text-foreground"
            >
              Kategori:
            </label>
            <Input
              id="scan-category"
              value={data?.category || ""}
              onChange={(e) =>
                onDataChange(
                  data ? { ...data, category: e.target.value } : null
                )
              }
              placeholder="Contoh: Makanan"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="scan-note"
              className="text-sm font-medium text-foreground"
            >
              Catatan (Opsional):
            </label>
            <Textarea
              id="scan-note"
              value={data?.note || ""}
              onChange={(e) =>
                onDataChange(data ? { ...data, note: e.target.value } : null)
              }
              placeholder="Detail item, lokasi, metode pembayaran, dll..."
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Info tambahan seperti detail belanja, lokasi toko, metode
              pembayaran, dll.
            </p>
          </div>

          {/* Wallet Selector */}
          <WalletSelector
            wallets={wallets}
            selectedWalletId={selectedWalletId}
            onSelectWallet={onSelectWallet}
            isLoading={false}
          />

          <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-2">
            💡 Hasil scan mungkin tidak 100% akurat. Silakan periksa dan edit
            jika diperlukan.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!data?.item || !data?.amount || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              "Menyimpan..."
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Simpan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

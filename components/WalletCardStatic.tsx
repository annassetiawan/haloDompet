// Server Component - Static wallet card untuk fast initial render
// Interactive features akan di-enhance di client-side

import { formatCurrency } from '@/lib/utils'
import type { Wallet } from '@/types'

interface WalletCardStaticProps {
  wallet: Wallet
  isVisible: boolean
}

const colorGradients: Record<string, string> = {
  '#10b981': '#059669',
  '#3b82f6': '#2563eb',
  '#f59e0b': '#f97316',
  '#ef4444': '#dc2626',
  '#8b5cf6': '#7c3aed',
  '#ec4899': '#db2777',
  '#06b6d4': '#0891b2',
  '#84cc16': '#65a30d',
}

function getSecondaryColor(primaryColor: string): string {
  return colorGradients[primaryColor] || primaryColor
}

function getBalanceFontSize(amount: number): string {
  const formatted = formatCurrency(amount)
  const length = formatted.length
  if (length <= 12) return 'text-3xl'
  if (length <= 16) return 'text-2xl'
  return 'text-xl'
}

function maskedAmount(amount: number): string {
  return 'Rp ' + '•'.repeat(amount.toString().replace(/[^0-9]/g, '').length)
}

export function WalletCardStatic({ wallet, isVisible }: WalletCardStaticProps) {
  return (
    <div className="w-80 flex-shrink-0 snap-start">
      <div
        className="relative overflow-hidden rounded-2xl p-4 text-white h-full flex flex-col justify-between transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${wallet.color || '#10b981'} 0%, ${getSecondaryColor(wallet.color || '#10b981')} 100%)`,
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl" />

        <div className="relative z-10 flex flex-col justify-between h-full gap-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-medium text-white/80 uppercase tracking-wider mb-1">
                {wallet.is_default ? 'Utama' : 'Dompet'}
              </p>
              <h3 className="text-base font-bold text-white">{wallet.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-lg">{wallet.icon || '💰'}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-white/70 mb-0.5">Saldo Aktif</p>
            <p className={`${getBalanceFontSize(wallet.balance)} font-bold text-white leading-none`}>
              {isVisible ? formatCurrency(wallet.balance) : maskedAmount(wallet.balance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

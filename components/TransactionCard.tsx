import { Transaction } from '@/types'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { Calendar, Tag, MessageSquare, Trash2, MapPin, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransactionCardProps {
  transaction: Transaction
  onClick?: () => void
  onDelete?: () => void
  showDelete?: boolean
}

export function TransactionCard({ transaction, onClick, onDelete, showDelete = false }: TransactionCardProps) {
  const formattedDate = format(new Date(transaction.date), 'dd MMM yyyy', { locale: idLocale })
  const formattedAmount = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseFloat(transaction.amount.toString()))

  // Category emoji mapping
  const categoryEmoji: Record<string, string> = {
    makanan: '🍔',
    minuman: '☕',
    transportasi: '🚗',
    transport: '🚗',
    belanja: '🛒',
    hiburan: '🎬',
    kesehatan: '💊',
    pendidikan: '📚',
    tagihan: '💳',
    olahraga: '⚽',
    lainnya: '📦',
  }

  const emoji = categoryEmoji[transaction.category.toLowerCase()] || '💰'

  return (
    <div className="relative group/card">
      <button
        onClick={onClick}
        className={`w-full text-left p-4 rounded-xl bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-md group ${showDelete ? 'pr-12' : ''}`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left side - Icon & Details */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/10 dark:bg-accent/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
              {emoji}
            </div>

            {/* Transaction Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-normal text-foreground truncate">
                {transaction.item}
              </h3>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="capitalize">{transaction.category}</span>
                </div>

                {/* Location (if available) */}
                {transaction.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{transaction.location}</span>
                  </div>
                )}

                {/* Payment Method (if available) */}
                {transaction.payment_method && (
                  <div className="flex items-center gap-1">
                    <Wallet className="h-3 w-3" />
                    <span>{transaction.payment_method}</span>
                  </div>
                )}
              </div>

              {/* Voice Text (if available) */}
              {transaction.voice_text && (
                <div className="flex items-start gap-1 mt-2 text-xs text-muted-foreground/70">
                  <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-1 italic">&quot;{transaction.voice_text}&quot;</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Amount */}
          <div className={`flex-shrink-0 text-right ${showDelete ? 'mr-2' : ''}`}>
            <div className="font-normal text-lg text-foreground">
              {formattedAmount}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {format(new Date(transaction.created_at), 'HH:mm')}
            </div>
          </div>
        </div>
      </button>

      {/* Delete Button */}
      {showDelete && onDelete && (
        <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 bg-background/80 dark:bg-background/60 backdrop-blur-sm shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

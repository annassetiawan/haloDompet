export function TransactionSkeleton() {
  return (
    <div className="bg-card/50 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Item name skeleton */}
          <div className="h-5 bg-muted/50 rounded w-3/4" />
          {/* Category and date skeleton */}
          <div className="flex gap-2">
            <div className="h-4 bg-muted/30 rounded w-20" />
            <div className="h-4 bg-muted/30 rounded w-24" />
          </div>
        </div>
        {/* Amount skeleton */}
        <div className="h-6 bg-muted/50 rounded w-28" />
      </div>
    </div>
  );
}

export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionSkeleton key={i} />
      ))}
    </div>
  );
}

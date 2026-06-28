import { PageHeaderSkeleton, StatCardSkeleton, TableSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for the Watchlist page. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      <PageHeaderSkeleton withActions />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <TableSkeleton columns={6} rows={8} />
    </div>
  )
}

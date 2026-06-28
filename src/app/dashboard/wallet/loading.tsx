import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for the Wallet page. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-5 pb-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
      <TableSkeleton columns={5} rows={6} />
    </div>
  )
}

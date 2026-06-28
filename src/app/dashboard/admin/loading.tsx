import { PageHeaderSkeleton, StatCardSkeleton, PillRowSkeleton, TableSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for the Admin Console. */
export default function Loading() {
  return (
    <div className="page-container-wide flex flex-col gap-5 pb-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <PillRowSkeleton count={6} />
      <TableSkeleton columns={7} rows={8} />
    </div>
  )
}

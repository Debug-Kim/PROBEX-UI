import { PageHeaderSkeleton, PillRowSkeleton, TableSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for the Markets discovery page. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      <PageHeaderSkeleton withActions />
      <PillRowSkeleton count={6} />
      <TableSkeleton columns={6} rows={10} />
    </div>
  )
}

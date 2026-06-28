import { Skeleton, CardSkeleton, ChartSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for an individual market detail page. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      {/* Market header */}
      <div className="flex flex-col gap-2">
        <Skeleton height={14} width={120} />
        <Skeleton height={26} width="70%" />
        <div className="flex gap-3 mt-1">
          <Skeleton height={40} width={120} />
          <Skeleton height={40} width={120} />
          <Skeleton height={40} width={120} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="flex flex-col gap-4">
          <ChartSkeleton height={280} />
          <CardSkeleton lines={4} />
        </div>
        <div className="flex flex-col gap-4">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </div>
  )
}

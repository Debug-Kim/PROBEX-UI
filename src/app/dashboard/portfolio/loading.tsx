import { Skeleton, StatCardSkeleton, ChartSkeleton, CardSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton shown while the Portfolio page loads. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      <Skeleton height={22} width={160} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartSkeleton height={200} />
        <ChartSkeleton height={200} />
      </div>
      <CardSkeleton lines={4} />
    </div>
  )
}

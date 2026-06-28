import { Skeleton, StatCardSkeleton, ChartSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton shown while the Analytics page loads. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      <div className="flex flex-col gap-2">
        <Skeleton height={22} width={140} />
        <Skeleton height={12} width={260} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ChartSkeleton className="lg:col-span-2" height={220} />
        <ChartSkeleton height={220} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartSkeleton height={180} />
        <ChartSkeleton height={180} />
      </div>
    </div>
  )
}

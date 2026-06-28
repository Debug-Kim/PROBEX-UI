import { PageHeaderSkeleton, CardSkeleton, ChartSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for the Consensus Intelligence Engine. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      <PageHeaderSkeleton withActions />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <CardSkeleton className="lg:col-span-2" lines={5} />
        <CardSkeleton lines={5} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartSkeleton height={200} />
        <ChartSkeleton height={200} />
      </div>
      <CardSkeleton lines={4} />
    </div>
  )
}

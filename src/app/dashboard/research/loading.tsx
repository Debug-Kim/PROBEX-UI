import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/LoadingState'

/** Route-level loading skeleton for the Research terminal. */
export default function Loading() {
  return (
    <div className="page-container flex flex-col gap-4 pb-8">
      <PageHeaderSkeleton withActions />
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="hidden lg:flex flex-col gap-2 w-[220px] flex-shrink-0">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} lines={1} />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 w-full">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} lines={4} />)}
        </div>
      </div>
    </div>
  )
}

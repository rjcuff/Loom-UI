import {
  ShimmerSkeleton,
  ShimmerSkeletonText,
} from "@/registry/loomui/shimmer-skeleton"

export default function ShimmerSkeletonDemo() {
  return (
    <div className="w-full max-w-sm">
      <div className="border-border bg-card rounded-xl border p-5">
        <div className="flex items-center gap-3">
          <ShimmerSkeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerSkeleton className="h-3.5 w-32" delay={80} />
            <ShimmerSkeleton className="h-3 w-20" delay={160} />
          </div>
        </div>

        <ShimmerSkeleton className="mt-5 h-28 w-full rounded-lg" delay={240} />

        <ShimmerSkeletonText className="mt-5" lines={3} delay={320} />
      </div>
    </div>
  )
}

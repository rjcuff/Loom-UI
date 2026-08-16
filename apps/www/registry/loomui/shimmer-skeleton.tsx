"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ShimmerSkeletonProps extends React.ComponentProps<"div"> {
  /** Milliseconds for one pass of the shimmer across the block. */
  duration?: number
  /** Milliseconds to hold before this block's first pass. */
  delay?: number
  /** Render a plain block with no pass over it. */
  shimmer?: boolean
}

/**
 * The sweep is a gradient translated across a clipped box, not a background
 * position on the block itself, so a placeholder costs one composited layer
 * however many of them are on the page at once.
 */
export function ShimmerSkeleton({
  className,
  duration = 1600,
  delay = 0,
  shimmer = true,
  style,
  children,
  ...props
}: ShimmerSkeletonProps) {
  return (
    <div
      data-slot="shimmer-skeleton"
      aria-hidden="true"
      className={cn(
        "bg-muted relative isolate h-4 w-full overflow-hidden rounded-md",
        className
      )}
      style={
        {
          "--shimmer-duration": `${duration}ms`,
          "--shimmer-delay": `${delay}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {shimmer ? (
        <span className="animate-skeleton-shimmer absolute inset-0 bg-[linear-gradient(90deg,transparent,color-mix(in_oklch,var(--foreground)_9%,transparent),transparent)] motion-reduce:hidden" />
      ) : null}
      {children}
    </div>
  )
}

export interface ShimmerSkeletonTextProps extends ShimmerSkeletonProps {
  /** How many lines of placeholder text to draw. */
  lines?: number
  /** Width of the last line, which is short the way a real one is. */
  lastLineWidth?: string
}

/**
 * Lines are offset from each other so the sweep runs down the paragraph rather
 * than firing across every line at once.
 */
export function ShimmerSkeletonText({
  lines = 3,
  lastLineWidth = "62%",
  className,
  duration = 1600,
  delay = 0,
  shimmer = true,
  ...props
}: ShimmerSkeletonTextProps) {
  return (
    <div
      data-slot="shimmer-skeleton-text"
      className={cn("flex w-full flex-col gap-2.5", className)}
    >
      {Array.from({ length: lines }, (_, index) => (
        <ShimmerSkeleton
          key={index}
          duration={duration}
          delay={delay + index * 120}
          shimmer={shimmer}
          style={
            index === lines - 1 && lines > 1
              ? { width: lastLineWidth }
              : undefined
          }
          {...props}
        />
      ))}
    </div>
  )
}

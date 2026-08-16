"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LoomLoaderProps extends React.ComponentProps<"div"> {
  /** How many warp threads are on the frame. Three to seven reads best. */
  strands?: number
  /** Milliseconds for one thread to be drawn through and pulled off. */
  duration?: number
  /** Announced to screen readers while the loader is on screen. */
  label?: string
}

/** The frame the threads are strung across, in user units. */
const BOX = 40
const INSET = 5

/**
 * Warp threads are drawn with `pathLength="1"`, so the dash animation is
 * written in fractions of a line rather than in pixels and the same keyframes
 * hold at any size.
 */
export function LoomLoader({
  strands = 5,
  duration = 1400,
  label = "Loading",
  className,
  style,
  ...props
}: LoomLoaderProps) {
  const positions = React.useMemo(() => {
    const span = BOX - INSET * 2
    const gap = strands > 1 ? span / (strands - 1) : 0
    return Array.from({ length: strands }, (_, index) => INSET + index * gap)
  }, [strands])

  return (
    <div
      data-slot="loom-loader"
      role="status"
      aria-label={label}
      className={cn("text-primary inline-block size-10", className)}
      style={
        { "--loom-duration": `${duration}ms`, ...style } as React.CSSProperties
      }
      {...props}
    >
      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        fill="none"
        aria-hidden="true"
        className="size-full overflow-visible"
      >
        {positions.map((x, index) => (
          <line
            key={x}
            x1={x}
            y1={INSET}
            x2={x}
            y2={BOX - INSET}
            pathLength={1}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeOpacity={0.3}
            // Drawn whole at rest, so a reduced-motion frame is a woven glyph
            // rather than an empty box.
            strokeDasharray={1}
            className="animate-loom-thread motion-reduce:animate-none"
            style={{
              // Threads start one after another, which is what turns five
              // lines into a weave instead of five lines blinking together.
              animationDelay: `${(index / strands) * duration * 0.6}ms`,
            }}
          />
        ))}

        {/* The shuttle. It carries the weft across the warp and back. */}
        <line
          x1={INSET}
          y1={INSET - 1}
          x2={INSET}
          y2={BOX - INSET + 1}
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="animate-loom-shuttle motion-reduce:animate-none"
          style={
            { "--loom-sweep": `${BOX - INSET * 2}px` } as React.CSSProperties
          }
        />
      </svg>

      <span className="sr-only">{label}</span>
    </div>
  )
}

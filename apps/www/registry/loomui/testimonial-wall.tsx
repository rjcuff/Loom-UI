"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

export interface TestimonialWallProps extends React.ComponentProps<"div"> {
  /** Columns at the widest breakpoint. Narrow screens drop the extras. */
  columns?: number
  /** Seconds for one pass of the first column. */
  duration?: number
  /** Per-column multipliers on `duration`. Falls back to a fixed drift. */
  speeds?: number[]
  /** Gap between cards and between columns, as a CSS length. */
  gap?: string
  /** Stop every column while the pointer is over the wall. */
  pauseOnHover?: boolean
  /** Render the wall static. */
  paused?: boolean
  /** Fade the top and bottom out. Pass a CSS length to size the fade. */
  fade?: boolean | string
}

/**
 * Alpha sampled off a smoothstep curve. A two-stop gradient ramps its alpha
 * linearly, and the eye reads the point where that ramp meets full opacity as a
 * hard line. Sampling the curve rounds both ends off, so the fade runs out
 * instead of stopping.
 */
const FADE_STOPS = [0, 0.0608, 0.216, 0.5, 0.784, 0.939, 1]

function fadeMask(size: string) {
  const last = FADE_STOPS.length - 1
  const ratio = (index: number) => (index / last).toFixed(4)

  const leading = FADE_STOPS.map(
    (alpha, index) => `rgb(0 0 0 / ${alpha}) calc(${size} * ${ratio(index)})`
  )
  const trailing = FADE_STOPS.map(
    (_, index) =>
      `rgb(0 0 0 / ${FADE_STOPS[last - index]}) calc(100% - ${size} * ${ratio(
        last - index
      )})`
  )

  return `linear-gradient(to bottom, ${[...leading, ...trailing].join(", ")})`
}

/** Columns past the first are dropped rather than squeezed on small screens. */
const VISIBILITY = ["flex", "hidden sm:flex", "hidden lg:flex"]

export function TestimonialWall({
  children,
  className,
  columns = 3,
  duration = 44,
  speeds,
  gap = "1rem",
  pauseOnHover = true,
  paused = false,
  fade = true,
  style,
  ...props
}: TestimonialWallProps) {
  const items = React.Children.toArray(children)
  // Dealt round robin, so a wall of uneven cards still balances out.
  const lanes = Array.from({ length: Math.max(columns, 1) }, (_, lane) =>
    items.filter((_, index) => index % Math.max(columns, 1) === lane)
  )

  const mask = fade ? fadeMask(fade === true ? "14%" : fade) : undefined

  const root = React.useRef<HTMLDivElement>(null)
  const onScreen = useInViewport(root)

  return (
    <div
      ref={root}
      data-slot="testimonial-wall"
      className={cn("group flex h-[32rem] overflow-hidden", className)}
      style={{
        gap,
        WebkitMaskImage: mask,
        maskImage: mask,
        ...style,
      }}
      {...props}
    >
      {lanes.map((lane, index) => (
        <div
          key={index}
          className={cn(
            "min-w-0 flex-1 flex-col",
            VISIBILITY[index] ?? "hidden lg:flex"
          )}
          style={
            {
              gap,
              // The keyframes travel exactly one copy plus one gap, which is
              // what makes the seam invisible.
              "--marquee-gap": gap,
              "--marquee-duration": `${
                duration * (speeds?.[index] ?? 1 + (index % 3) * 0.24)
              }s`,
            } as React.CSSProperties
          }
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy > 0 ? "true" : undefined}
              className={cn(
                "animate-marquee-vertical flex shrink-0 flex-col",
                !onScreen && "[animation-play-state:paused]",
                // Every other column runs the other way, so neighbouring cards
                // never travel together and the wall reads as depth.
                index % 2 === 1 && "[animation-direction:reverse]",
                paused && "[animation-play-state:paused]",
                pauseOnHover && "group-hover:[animation-play-state:paused]",
                // A column that stops dead leaves half a card cut off, so the
                // whole wall is frozen at its start instead.
                "motion-reduce:animate-none"
              )}
              style={{ gap }}
            >
              {lane}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.ComponentProps<"div"> {
  /** Travel bottom to top instead of right to left. */
  vertical?: boolean
  /** Flip the direction of travel. */
  reverse?: boolean
  /** Stop while the pointer is over the track. */
  pauseOnHover?: boolean
  /** Copies of the children. Two is the minimum for a seamless loop. */
  repeat?: number
  /** Seconds for one full pass of a single copy. */
  duration?: number
  /** Gap between items, as a CSS length. */
  gap?: string
  /** Render the row static. */
  paused?: boolean
}

export function Marquee({
  children,
  className,
  vertical = false,
  reverse = false,
  pauseOnHover = false,
  repeat = 2,
  duration = 40,
  gap = "1rem",
  paused = false,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      data-slot="marquee"
      className={cn(
        "group flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        className
      )}
      style={
        {
          gap,
          // The keyframes travel exactly one copy plus one gap, which is what
          // makes the seam invisible.
          "--marquee-gap": gap,
          "--marquee-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {Array.from({ length: Math.max(repeat, 2) }, (_, index) => (
        <div
          key={index}
          aria-hidden={index > 0 ? "true" : undefined}
          className={cn(
            "flex shrink-0 justify-around",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            reverse && "[animation-direction:reverse]",
            paused && "[animation-play-state:paused]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            // A marquee that stops dead for reduced motion leaves half a row
            // cut off, so the whole track is frozen at its start instead.
            "motion-reduce:animate-none"
          )}
          style={{ gap }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

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
  /** Fade both edges out. Pass a CSS length to size the fade. */
  fade?: boolean | string
}

/**
 * Alpha sampled off a smoothstep curve. A two-stop gradient ramps linearly, and
 * the eye reads where that ramp meets full opacity as a hard line. Sampling the
 * curve rounds both ends off, so the fade runs out instead of stopping.
 */
const FADE_STOPS = [0, 0.0608, 0.216, 0.5, 0.784, 0.939, 1]

function fadeMask(axis: "to right" | "to bottom", size: string) {
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

  return `linear-gradient(${axis}, ${[...leading, ...trailing].join(", ")})`
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
  fade = false,
  style,
  ...props
}: MarqueeProps) {
  const root = React.useRef<HTMLDivElement>(null)
  // A marquee nobody can see is 40 seconds of work per loop for nothing.
  const onScreen = useInViewport(root)
  const mask = fade
    ? fadeMask(
        vertical ? "to bottom" : "to right",
        fade === true ? "12%" : fade
      )
    : undefined

  return (
    <div
      ref={root}
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
          WebkitMaskImage: mask,
          maskImage: mask,
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
            (paused || !onScreen) && "[animation-play-state:paused]",
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

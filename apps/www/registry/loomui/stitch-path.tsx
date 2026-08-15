"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface StitchPathProps extends Omit<
  React.ComponentProps<"svg">,
  "target"
> {
  /** Path data, in the `0 0 100 100` box the component draws in. */
  d?: string
  /** Length of one stitch. */
  stitch?: number
  /** Bare thread between two stitches. */
  gap?: number
  /** Thread thickness in pixels. It does not stretch with the box. */
  thickness?: number
  /** Sew it yourself, 0 to 1. Leave it out to sew on scroll. */
  progress?: number
  /** Follow this element through the viewport instead of the path's own box. */
  target?: React.RefObject<HTMLElement | null>
  /** Draw the holes the thread is sewn through. */
  guide?: boolean
}

const DEFAULT_PATH = "M 0 62 C 18 6 42 6 52 48 S 78 96 100 34"

const clamp = (value: number) => Math.min(Math.max(value, 0), 1)

export function StitchPath({
  d = DEFAULT_PATH,
  stitch = 5,
  gap = 4,
  thickness = 2,
  progress,
  target,
  guide = true,
  className,
  ...props
}: StitchPathProps) {
  const maskId = React.useId()
  const hostRef = React.useRef<SVGSVGElement>(null)
  const revealRef = React.useRef<SVGPathElement>(null)
  const controlled = progress !== undefined

  React.useEffect(() => {
    const node = revealRef.current
    if (!node) {
      return
    }

    // `pathLength="1"` normalises the path, so the offset is the fraction of it
    // still to be sewn and the geometry never has to be measured.
    const draw = (value: number) => {
      node.style.strokeDashoffset = `${1 - clamp(value)}`
    }

    if (controlled) {
      draw(progress)
      return
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(1)
      return
    }

    let frame = 0

    const measure = () => {
      const box = target?.current ?? hostRef.current
      if (!box) {
        return
      }

      // Zero when the top edge sits on the bottom of the viewport, one when the
      // bottom edge has cleared the top of it.
      const rect = box.getBoundingClientRect()
      const travel = window.innerHeight + rect.height
      draw(travel > 0 ? (window.innerHeight - rect.top) / travel : 1)
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [controlled, progress, target])

  return (
    <svg
      ref={hostRef}
      data-slot="stitch-path"
      // Decoration. There is nothing here a reader would want announced.
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      fill="none"
      className={cn(
        "text-primary pointer-events-none h-full w-full",
        className
      )}
      {...props}
    >
      <defs>
        {/* The reveal is the same path stroked solid and wiped by its own dash
            offset. Wiping the visible path directly would cost it the dash
            pattern that makes it read as stitches rather than a line. */}
        <mask id={maskId}>
          <path
            ref={revealRef}
            d={d}
            pathLength="1"
            strokeDasharray="1 1"
            strokeDashoffset="1"
            stroke="white"
            strokeWidth="12"
            fill="none"
          />
        </mask>
      </defs>

      {guide ? (
        <path
          d={d}
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          // Zero-length dashes with a round cap are dots: one hole per stitch.
          strokeDasharray={`0 ${stitch + gap}`}
          vectorEffect="non-scaling-stroke"
          className="opacity-25"
        />
      ) : null}

      <path
        d={d}
        stroke="currentColor"
        strokeWidth={thickness}
        strokeLinecap="round"
        strokeDasharray={`${stitch} ${gap}`}
        vectorEffect="non-scaling-stroke"
        mask={`url(#${maskId})`}
      />
    </svg>
  )
}

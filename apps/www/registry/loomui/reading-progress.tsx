"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ReadingProgressProps extends React.ComponentProps<"div"> {
  /** Which edge the bar pins to. */
  position?: "top" | "bottom"
  /** Bar thickness in pixels. */
  thickness?: number
  /** Measure this element instead of the whole document. */
  target?: React.RefObject<HTMLElement | null>
  /** Render nothing. Useful for pages that should not have a bar. */
  disabled?: boolean
}

export function ReadingProgress({
  className,
  position = "top",
  thickness = 2,
  target,
  disabled = false,
  style,
  ...props
}: ReadingProgressProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (disabled) {
      return
    }

    let frame = 0

    const measure = () => {
      const node = ref.current
      if (!node) {
        return
      }

      let progress: number

      if (target?.current) {
        const rect = target.current.getBoundingClientRect()
        const scrollable = rect.height - window.innerHeight
        progress = scrollable > 0 ? -rect.top / scrollable : 1
      } else {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight
        progress = scrollable > 0 ? window.scrollY / scrollable : 1
      }

      // Scrolling is the highest-frequency input there is, so the bar tracks
      // it exactly. No transition, no easing, no perceived lag.
      node.style.scale = `${Math.min(Math.max(progress, 0), 1)} 1`
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
  }, [disabled, target])

  if (disabled) {
    return null
  }

  return (
    <div
      data-slot="reading-progress"
      // Decorative. The scrollbar already carries this information, and a
      // `progressbar` role without a live `aria-valuenow` announces worse than
      // nothing at all.
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-x-0 z-50",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
      style={{ height: thickness, ...style }}
      {...props}
    >
      <div
        ref={ref}
        className="bg-primary h-full w-full origin-left will-change-transform"
        style={{ scale: "0 1" }}
      />
    </div>
  )
}

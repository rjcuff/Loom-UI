"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CountUpProps extends Omit<
  React.ComponentProps<"span">,
  "children"
> {
  /** The number to land on. */
  value: number
  /** The number to start from. */
  from?: number
  /** Milliseconds for the whole count. */
  duration?: number
  /** Decimal places to hold throughout the count. */
  decimals?: number
  /** Locale passed to Intl.NumberFormat, so grouping matches the reader. */
  locale?: string
  /** Rendered before the number, inside the same element. */
  prefix?: string
  /** Rendered after the number. */
  suffix?: string
  /** Hold until the number scrolls into view instead of counting on mount. */
  startOnView?: boolean
  /** Render the final value with no count. */
  disabled?: boolean
}

/** --ease-out-quart, expressed as a function so JS and CSS agree. */
function easeOutQuart(t: number) {
  return 1 - Math.pow(1 - t, 4)
}

export function CountUp({
  value,
  from = 0,
  duration = 1400,
  decimals = 0,
  locale,
  prefix,
  suffix,
  startOnView = true,
  disabled = false,
  className,
  ...props
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [active, setActive] = React.useState(!startOnView)

  const format = React.useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals]
  )

  React.useEffect(() => {
    if (!startOnView || disabled) {
      return
    }

    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setActive(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [startOnView, disabled])

  React.useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (disabled || !active || reduced || duration <= 0) {
      node.textContent = format.format(value)
      return
    }

    let frame = 0
    let start: number | null = null

    // The value is written straight to the DOM rather than through state, so a
    // 1400ms count is one render instead of eighty-four.
    const tick = (now: number) => {
      start ??= now
      const progress = Math.min((now - start) / duration, 1)
      node.textContent = format.format(
        from + (value - from) * easeOutQuart(progress)
      )

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    node.textContent = format.format(from)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, disabled, duration, format, from, value])

  return (
    <span data-slot="count-up" className={cn("tabular-nums", className)}>
      {prefix}
      <span ref={ref} {...props}>
        {format.format(disabled ? value : from)}
      </span>
      {suffix}
    </span>
  )
}

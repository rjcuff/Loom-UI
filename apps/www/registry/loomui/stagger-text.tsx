"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface StaggerTextProps extends Omit<
  React.ComponentProps<"span">,
  "children"
> {
  /** The text to reveal. Only plain text, so the split stays predictable. */
  children: string
  /** Split the text into words or into single characters. */
  by?: "word" | "character"
  /** Seconds between one unit starting and the next. */
  stagger?: number
  /** Seconds for a single unit to finish arriving. */
  duration?: number
  /** Seconds to wait before the first unit starts. */
  delay?: number
  /** Hold until the text scrolls into view instead of running on mount. */
  startOnView?: boolean
  /** Replay every time the text re-enters the viewport. */
  repeat?: boolean
  /** Render the finished state with no animation. */
  disabled?: boolean
}

/** Splits on whitespace but keeps the separators so spacing survives. */
function split(text: string, by: "word" | "character") {
  if (by === "character") {
    return Array.from(text)
  }
  return text.split(/(\s+)/)
}

export function StaggerText({
  children,
  className,
  by = "word",
  stagger = 0.04,
  duration = 0.5,
  delay = 0,
  startOnView = false,
  repeat = false,
  disabled = false,
  ...props
}: StaggerTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [active, setActive] = React.useState(!startOnView)

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
          if (!repeat) {
            observer.disconnect()
          }
        } else if (repeat) {
          setActive(false)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [startOnView, repeat, disabled])

  const units = React.useMemo(() => split(children, by), [children, by])

  return (
    <span
      ref={ref}
      data-slot="stagger-text"
      className={cn("inline-block", className)}
      {...props}
    >
      {/* The whole string is announced once; the pieces are decoration. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {units.map((unit, index) => {
          if (/^\s+$/.test(unit)) {
            return <span key={index}>{unit}</span>
          }

          return (
            <span
              key={index}
              className={cn(
                "inline-block will-change-[opacity,transform]",
                !disabled && active && "animate-stagger-reveal",
                !disabled && !active && "opacity-0",
                "motion-reduce:animate-none motion-reduce:opacity-100"
              )}
              style={
                disabled || !active
                  ? undefined
                  : {
                      animationDuration: `${duration}s`,
                      animationDelay: `${delay + index * stagger}s`,
                    }
              }
            >
              {unit}
            </span>
          )
        })}
      </span>
    </span>
  )
}

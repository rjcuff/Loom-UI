"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useSpring, type SpringOptions } from "@/registry/lib/use-spring"

export interface ProgressRingProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** Where the ring is now. */
  value: number
  /** What a full ring means. */
  max?: number
  /** Outside diameter in pixels. */
  size?: number
  /** Stroke width in pixels. */
  thickness?: number
  /** How the value travels when it changes. */
  spring?: SpringOptions
  /** Print the number in the middle. */
  showValue?: boolean
  /** Turns the value into the text in the middle. */
  format?: (value: number) => string
  /** Accessible name. Give it one if the ring is the only label. */
  label?: string
  /** Render the ring at its value without animating to it. */
  disabled?: boolean
  /** Children sit in the middle instead of the number. */
  center?: React.ReactNode
}

/** The box the ring is drawn in. Every measurement is a share of this. */
const BOX = 100

const clamp = (value: number, max: number) =>
  Math.min(Math.max(value, 0), max) / (max || 1)

/**
 * A ring that fills to a value, on a spring.
 *
 * The arc is drawn by walking the stroke's own dash offset around the circle.
 * That is a paint rather than a composite, which is the one place this steps
 * outside transform and opacity, and there is no way to draw an arc without it.
 * It stays cheap because only the stroke is repainted, never the layout.
 *
 * The value springs rather than tweens, so a target that changes while the ring
 * is still moving keeps the speed it already had. A progress ring that restarts
 * from a standstill every time the number updates is the tell.
 */
export function ProgressRing({
  value,
  max = 100,
  size = 120,
  thickness = 10,
  spring,
  showValue = true,
  format,
  label,
  disabled = false,
  center,
  className,
  style,
  ...props
}: ProgressRingProps) {
  const arcRef = React.useRef<SVGCircleElement>(null)
  const textRef = React.useRef<HTMLSpanElement>(null)

  const radius = (BOX - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const target = clamp(value, max)

  const paint = React.useCallback(
    ({ fill = 0 }: Record<string, number>) => {
      const arc = arcRef.current
      if (arc) {
        arc.style.strokeDashoffset = `${circumference * (1 - fill)}`
      }

      const text = textRef.current
      if (text) {
        const shown = fill * max
        text.textContent = format ? format(shown) : `${Math.round(shown)}`
      }
    },
    [circumference, format, max]
  )

  const { to, set } = useSpring(paint, {
    duration: 0.6,
    bounce: 0,
    ...spring,
  })

  // Written on mount as well, so the first paint is the value rather than an
  // empty ring that fills itself in front of someone who did not ask.
  const started = React.useRef(false)

  React.useLayoutEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!started.current || disabled || reduced) {
      started.current = true
      set({ fill: target })
      return
    }

    to({ fill: target })
  }, [target, disabled, set, to])

  return (
    <div
      data-slot="progress-ring"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        className="size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          data-slot="progress-ring-track"
          cx={BOX / 2}
          cy={BOX / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          className="stroke-muted-foreground/15"
        />
        <circle
          ref={arcRef}
          data-slot="progress-ring-arc"
          cx={BOX / 2}
          cy={BOX / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="stroke-accent"
        />
      </svg>

      {center ?? null}

      {showValue && !center ? (
        <span
          ref={textRef}
          data-slot="progress-ring-value"
          className="absolute font-medium tabular-nums"
          style={{ fontSize: size * 0.22 }}
        />
      ) : null}
    </div>
  )
}

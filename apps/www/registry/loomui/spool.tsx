"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useSpring, type SpringOptions } from "@/registry/lib/use-spring"

export interface SpoolProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** Which state is showing. */
  value: string
  /** One entry per state. Whatever is not `value` is not in the DOM. */
  children: React.ReactNode
  /** How the shape travels between states. */
  spring?: SpringOptions
  /** Corner radius in pixels. Kept circular through the morph. */
  radius?: number
  /** Milliseconds the outgoing content takes to leave. */
  fade?: number
}

export interface SpoolItemProps extends React.ComponentProps<"div"> {
  /** Matches the `value` on the parent. */
  value: string
}

/**
 * One state's contents. Sized by whatever is inside it: the shape follows the
 * content rather than the content being poured into a shape.
 */
export function SpoolItem({ className, ...props }: SpoolItemProps) {
  return (
    <div
      data-slot="spool-item"
      className={cn("flex items-center gap-2.5 px-4 py-2.5", className)}
      {...props}
    />
  )
}

function findItem(children: React.ReactNode, value: string) {
  let found: React.ReactElement<SpoolItemProps> | null = null

  React.Children.forEach(children, (child) => {
    if (
      !found &&
      React.isValidElement<SpoolItemProps>(child) &&
      child.props.value === value
    ) {
      found = child
    }
  })

  return found as React.ReactElement<SpoolItemProps> | null
}

/**
 * A shape that changes to fit what it holds.
 *
 * The size is never animated. The box is set once, in the commit that swaps the
 * contents, and the difference replays as a transform: start at the ratio
 * between old and new, spring to 1. Layout runs once per change.
 */
export function Spool({
  value,
  children,
  spring,
  radius = 999,
  fade = 140,
  className,
  style,
  ...props
}: SpoolProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const wrapRef = React.useRef<HTMLDivElement>(null)
  // The root is never laid out at its animated size, so its own offset box is
  // always the natural size of the contents. That is what makes a remeasure
  // mid-morph exact rather than a guess.
  const natural = React.useRef({ width: 0, height: 0 })
  const previous = React.useRef(value)
  const leaveTimer = React.useRef(0)
  const activeRef = React.useRef<HTMLDivElement>(null)
  const leavingRef = React.useRef<HTMLDivElement>(null)
  // The pieces inside the active state, collected once per change. Each one
  // arrives a beat after the last, which is the difference between contents
  // landing and contents appearing.
  const parts = React.useRef<HTMLElement[]>([])
  // How far from 1 the scale was when this morph began. The contents are faded
  // against the shape's progress, not against a duration, so an interruption
  // cannot leave text showing at a size the box has not reached yet.
  const span = React.useRef(0)
  // The scale the morph began at. The state on its way out is sized against
  // this, so it fills the shape at the start and shrinks with it from there.
  const start = React.useRef({ sx: 1, sy: 1 })

  const [leaving, setLeaving] = React.useState<string | null>(null)

  const paint = React.useCallback(
    ({ sx = 1, sy = 1 }: Record<string, number>) => {
      const root = rootRef.current
      const wrap = wrapRef.current
      if (!root || !wrap) return

      root.style.transform = `scale(${sx}, ${sy})`
      // Divided per axis, so the corner stays a circle while the box is not a
      // rectangle it started as.
      root.style.borderRadius = `${radius / sx}px / ${radius / sy}px`
      wrap.style.transform = `scale(${1 / sx}, ${1 / sy})`

      // The state on its way out fills the shape at the start and shrinks with
      // it, rather than being held at true size like the incoming one. When the
      // shape narrows it is also pulled in a little past that, or it reaches
      // the edge before the fade has finished with it.
      const leaving = leavingRef.current
      if (leaving) {
        const pull = sx > 1 ? 0.94 : 1
        leaving.style.transform = `scale(${(sx / start.current.sx) * pull}, ${
          sy / start.current.sy
        })`
      }

      const active = activeRef.current
      if (!active) return

      // The contents are held at true size while the box is not yet its size,
      // so until the shape has most of the way caught up they are wider than
      // what is holding them. Fading them against the shape's own progress is
      // what stops a word being shown half clipped.
      const gap = Math.max(Math.abs(1 - sx), Math.abs(1 - sy))
      const progress =
        span.current > 0 ? 1 - Math.min(gap / span.current, 1) : 1

      // Scale, blur and opacity together. Any one of the three on its own reads
      // as a fade; all three read as something arriving.
      const dress = (node: HTMLElement, t: number) => {
        node.style.opacity = `${t}`
        node.style.transform = `scale(${0.92 + 0.08 * t})`
        node.style.filter = t < 1 ? `blur(${(1 - t) * 3}px)` : ""
      }

      const at = (offset: number) =>
        Math.max(0, Math.min((progress - 0.4 - offset) / 0.38, 1))

      // Each piece lands a little after the one before it. Held against the
      // shape's progress rather than a clock, so an interruption never leaves
      // half of them arriving and half already there.
      if (parts.current.length > 0) {
        active.style.opacity = ""
        active.style.transform = ""
        active.style.filter = ""
        parts.current.forEach((node, index) => dress(node, at(index * 0.07)))
        return
      }

      dress(active, at(0))
    },
    [radius]
  )

  const { to, set, peek, speed } = useSpring(paint, {
    duration: 0.42,
    bounce: 0.18,
    ...spring,
  })

  const measure = React.useCallback(() => {
    const root = rootRef.current
    if (!root) return { width: 0, height: 0 }
    return { width: root.offsetWidth, height: root.offsetHeight }
  }, [])

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const first = natural.current
    const isFirstPaint = first.width === 0

    if (isFirstPaint || previous.current === value) {
      natural.current = measure()
      return
    }

    // Where the box actually is on screen this instant, and how fast it is
    // going, both in pixels, which survive the change of scale below.
    const at = peek()
    const rate = speed()
    const seen = {
      width: first.width * (at.sx ?? 1),
      height: first.height * (at.sy ?? 1),
    }
    const seenRate = {
      width: first.width * (rate.sx ?? 0),
      height: first.height * (rate.sy ?? 0),
    }

    // React has already swapped the contents, so this is the new natural size.
    const item = activeRef.current?.firstElementChild
    parts.current = item
      ? (Array.from(item.children).filter(
          (node) => node instanceof HTMLElement
        ) as HTMLElement[])
      : []

    const last = measure()
    natural.current = last
    if (!last.width || !last.height) return

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) {
      span.current = 0
      start.current = { sx: 1, sy: 1 }
      set({ sx: 1, sy: 1 })
      return
    }

    const from = {
      sx: seen.width / last.width,
      sy: seen.height / last.height,
    }
    span.current = Math.max(Math.abs(1 - from.sx), Math.abs(1 - from.sy))
    start.current = from

    set(from, {
      sx: seenRate.width / last.width,
      sy: seenRate.height / last.height,
    })
    to({ sx: 1, sy: 1 })
  }, [value, measure, peek, speed, set, to])

  React.useLayoutEffect(() => {
    if (previous.current === value) return

    setLeaving(previous.current)
    previous.current = value

    window.clearTimeout(leaveTimer.current)
    leaveTimer.current = window.setTimeout(() => setLeaving(null), fade)
  }, [value, fade])

  React.useEffect(() => () => window.clearTimeout(leaveTimer.current), [])

  // Content that changes size on its own, a font landing or a longer label,
  // moves the natural box without any change of state, so keep it current or
  // the next morph starts from a stale number.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => {
      if (!leaving) natural.current = measure()
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [measure, leaving])

  const active = findItem(children, value)
  const outgoing = leaving ? findItem(children, leaving) : null

  return (
    <div
      ref={rootRef}
      data-slot="spool"
      data-value={value}
      className={cn(
        "bg-background text-foreground relative inline-flex overflow-hidden border shadow-lg",
        "origin-center [will-change:transform]",
        className
      )}
      style={{ borderRadius: radius, ...style }}
      {...props}
    >
      <div
        ref={wrapRef}
        data-slot="spool-wrap"
        className="relative origin-center [will-change:transform]"
      >
        {active ? (
          <div key={value} ref={activeRef} data-slot="spool-active">
            {active}
          </div>
        ) : null}

        {/* The state on its way out, held only long enough to fade. Inside the
            wrapper so it is undistorted like everything else, and out of the
            flow so it never has a say in the size being measured. */}
        {outgoing ? (
          <div
            ref={leavingRef}
            aria-hidden="true"
            data-slot="spool-leaving"
            className="animate-spool-leave pointer-events-none absolute inset-0 grid origin-center place-items-center overflow-hidden motion-reduce:hidden"
            style={{ animationDuration: `${fade}ms` }}
          >
            {outgoing}
          </div>
        ) : null}
      </div>
    </div>
  )
}

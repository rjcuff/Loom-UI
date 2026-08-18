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
 * A container that changes shape to fit whatever it is showing, on a spring.
 *
 * The size is never animated. Animating width and height would lay the page out
 * on every frame, so the box is set to its new size once, in the same commit
 * that swaps the contents, and the difference is played back as a transform:
 * measure the old box, measure the new one, start at the ratio between them and
 * spring to 1. Layout happens once per change, and every frame in between is
 * the compositor's.
 *
 * A scaled box distorts, so two things undo it. The contents sit in a wrapper
 * scaled by the inverse, which keeps them at their true size throughout. The
 * corner radius is divided by each axis separately — `border-radius: x / y` —
 * which is what keeps a squashed corner circular instead of oval.
 *
 * Because it is a spring rather than a curve, a change that lands mid-flight
 * carries the velocity it already had. The shape never stops to start again.
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
    // going — both in pixels, which survive the change of scale below.
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
    const last = measure()
    natural.current = last
    if (!last.width || !last.height) return

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) {
      set({ sx: 1, sy: 1 })
      return
    }

    set(
      { sx: seen.width / last.width, sy: seen.height / last.height },
      { sx: seenRate.width / last.width, sy: seenRate.height / last.height }
    )
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

  // Content that changes size on its own — a font landing, a longer label —
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
        "bg-background text-foreground relative inline-flex border shadow-lg",
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
          <div
            key={value}
            data-slot="spool-active"
            className="animate-spool-enter motion-reduce:animate-none"
          >
            {active}
          </div>
        ) : null}

        {/* The state on its way out, held only long enough to fade. Inside the
            wrapper so it is undistorted like everything else, and out of the
            flow so it never has a say in the size being measured. */}
        {outgoing ? (
          <div
            aria-hidden="true"
            data-slot="spool-leaving"
            className="animate-spool-leave pointer-events-none absolute inset-0 grid place-items-center motion-reduce:hidden"
            style={{ animationDuration: `${fade}ms` }}
          >
            {outgoing}
          </div>
        ) : null}
      </div>
    </div>
  )
}

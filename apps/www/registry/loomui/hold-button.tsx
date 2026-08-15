"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface HoldButtonProps extends React.ComponentProps<"button"> {
  /** Milliseconds the button has to be held down before it fires. */
  duration?: number
  /** Called once, when a hold runs the whole way through. */
  onHold?: () => void
  /** Fill that sweeps across the button. Keep it translucent so the label survives. */
  color?: string
}

/** How long the fill takes to run back out, whether it completed or not. */
const RETURN_MS = 260
/** How long a completed fill sits at full before it runs back. */
const SETTLE_MS = 140

/** Fast at first, then easing to a stop. The fill draining should feel let go of. */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function HoldButton({
  children,
  className,
  duration = 1200,
  onHold,
  color = "color-mix(in oklch, var(--primary, currentColor) 22%, transparent)",
  disabled,
  style,
  ...props
}: HoldButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const frame = React.useRef(0)
  const settle = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const [holding, setHolding] = React.useState(false)

  // Progress is a ref written straight to a custom property. A fill that
  // re-rendered React sixty times a second to cross the button would be absurd.
  const state = React.useRef({
    progress: 0,
    filling: false,
    last: 0,
    from: 0,
    since: 0,
  })

  const write = React.useCallback(() => {
    ref.current?.style.setProperty(
      "--hold-progress",
      `${state.current.progress}`
    )
  }, [])

  const tick = React.useCallback(
    (now: number) => {
      const current = state.current

      if (current.filling) {
        // Filling is linear, because it is a promise about how much longer.
        const elapsed = current.last ? Math.min(now - current.last, 64) : 16
        current.last = now
        current.progress = Math.min(1, current.progress + elapsed / duration)
        write()

        if (current.progress >= 1) {
          current.filling = false
          setHolding(false)
          onHold?.()

          // Sit at full long enough to be seen, then run back out.
          settle.current = setTimeout(() => {
            current.from = current.progress
            current.since = performance.now()
            frame.current = requestAnimationFrame(tick)
          }, SETTLE_MS)
          return
        }

        frame.current = requestAnimationFrame(tick)
        return
      }

      // Draining is eased and on its own clock, so it takes the same quick
      // moment whether it fell from full or from a tenth of the way across.
      const t = Math.min(1, (now - current.since) / RETURN_MS)
      current.progress = current.from * (1 - easeOutCubic(t))
      write()

      if (t < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    },
    [duration, onHold, write]
  )

  const drain = React.useCallback(() => {
    const current = state.current
    current.filling = false
    current.from = current.progress
    current.since = performance.now()
    current.last = 0

    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(tick)
  }, [tick])

  const press = React.useCallback(() => {
    if (disabled) {
      return
    }

    clearTimeout(settle.current)
    cancelAnimationFrame(frame.current)
    state.current.filling = true
    state.current.last = 0
    setHolding(true)
    frame.current = requestAnimationFrame(tick)
  }, [disabled, tick])

  const release = React.useCallback(() => {
    if (!state.current.filling) {
      return
    }

    setHolding(false)
    drain()
  }, [drain])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      clearTimeout(settle.current)
    },
    []
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") {
      return
    }

    // Space scrolls and Enter fires a click; neither should stand in for the
    // hold this button exists to require.
    event.preventDefault()
    if (!event.repeat) {
      press()
    }
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault()
      release()
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      data-slot="hold-button"
      data-holding={holding ? "" : undefined}
      disabled={disabled}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={release}
      className={cn(
        "relative isolate inline-flex items-center justify-center rounded-lg border select-none",
        "transition-transform duration-150 ease-[var(--ease-out-quart)] data-holding:scale-[0.98]",
        "motion-reduce:transition-none",
        !disabled && "cursor-pointer",
        className
      )}
      style={style}
      {...props}
    >
      {/* The fill is the whole affordance: it is the only thing telling you how
          much longer to keep holding. It is a scale, not a width, so filling
          the button costs no layout — and it is clipped by a wrapper rather
          than rounded itself, or the scale would squash its own corners. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span
          className="absolute inset-0 origin-left"
          style={{
            background: color,
            transform: "scaleX(var(--hold-progress, 0))",
          }}
        />
      </span>

      <span className="relative">{children}</span>
    </button>
  )
}

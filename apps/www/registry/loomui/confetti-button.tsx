"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ConfettiButtonProps extends React.ComponentProps<"button"> {
  /** Pieces thrown by one press. */
  count?: number
  /** Milliseconds a piece stays in the air. */
  duration?: number
  /** Furthest a piece travels sideways, in pixels. */
  spread?: number
  /** Colours a piece is picked from. */
  colors?: string[]
}

interface Piece {
  id: number
  drift: number
  rise: number
  fall: number
  spin: number
  size: number
  color: string
  radius: string
}

const DEFAULT_COLORS = ["#2dd4bf", "#38bdf8", "#3b82f6", "#67e8f9", "#fbbf24"]

/**
 * Two nested spans per piece, because a lob is two motions on two clocks: the
 * outer drifts sideways at a constant rate while the inner rises and falls.
 * One element could only ever travel in a straight line.
 */
export function ConfettiButton({
  children,
  className,
  count = 18,
  duration = 900,
  spread = 90,
  colors = DEFAULT_COLORS,
  onClick,
  disabled,
  style,
  ...props
}: ConfettiButtonProps) {
  const [pieces, setPieces] = React.useState<Piece[]>([])
  const nextId = React.useRef(0)
  const timers = React.useRef<number[]>([])

  React.useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending) {
        window.clearTimeout(timer)
      }
    }
  }, [])

  const burst = React.useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    const palette = colors.length > 0 ? colors : DEFAULT_COLORS
    const thrown: Piece[] = Array.from({ length: count }, () => {
      // A fan across the top rather than a full circle. Pieces that start
      // downward read as a leak, not a throw.
      const angle = (-160 + Math.random() * 140) * (Math.PI / 180)
      const reach = spread * (0.45 + Math.random() * 0.55)

      return {
        id: nextId.current++,
        drift: Math.cos(angle) * reach,
        rise: Math.sin(angle) * reach,
        fall: Math.abs(Math.sin(angle) * reach) + spread * 0.85,
        spin: Math.round(Math.random() * 720 - 360),
        size: 5 + Math.round(Math.random() * 4),
        color: palette[Math.floor(Math.random() * palette.length)],
        // A mix of chips and dots, so a burst does not read as one shape
        // repeated at different angles.
        radius: Math.random() < 0.4 ? "9999px" : "1px",
      }
    })

    setPieces((current) => [...current, ...thrown])

    // One timer for the whole burst rather than one per piece, and the ids are
    // monotonic, so a later burst is never cleared by an earlier timer.
    const ids = new Set(thrown.map((piece) => piece.id))
    const timer = window.setTimeout(() => {
      setPieces((current) => current.filter((piece) => !ids.has(piece.id)))
      timers.current = timers.current.filter((entry) => entry !== timer)
    }, duration + 60)
    timers.current.push(timer)
  }, [colors, count, duration, spread])

  return (
    <button
      // Native default is `submit`. A burst inside a form would be cut off by
      // the navigation it triggered. `...props` below still lets a caller ask
      // for a submit button explicitly.
      type="button"
      data-slot="confetti-button"
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) {
          burst()
        }
      }}
      className={cn(
        "relative inline-flex items-center justify-center select-none",
        "transition-transform duration-150 ease-[var(--ease-out-quart)] active:scale-[0.97] motion-reduce:transition-none",
        className
      )}
      style={style}
      {...props}
    >
      {/* Pinned to the middle of the button and not clipped by it, so the
          throw carries past the edge the way it should. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-10 size-0"
      >
        {pieces.map((piece) => (
          <span
            key={piece.id}
            className="animate-confetti-drift absolute block motion-reduce:hidden"
            style={
              {
                "--confetti-duration": `${duration}ms`,
                "--drift": `${piece.drift}px`,
              } as React.CSSProperties
            }
          >
            <span
              className="animate-confetti-fall block"
              style={
                {
                  width: piece.size,
                  height: piece.size,
                  background: piece.color,
                  borderRadius: piece.radius,
                  "--confetti-duration": `${duration}ms`,
                  "--rise": `${piece.rise}px`,
                  "--fall": `${piece.fall}px`,
                  "--spin": `${piece.spin}deg`,
                } as React.CSSProperties
              }
            />
          </span>
        ))}
      </span>
      {children}
    </button>
  )
}

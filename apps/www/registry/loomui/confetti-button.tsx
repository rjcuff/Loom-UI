"use client"

import * as React from "react"
import { createPortal } from "react-dom"

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
  // Where on the screen the burst is thrown from, measured at the moment of
  // the press.
  const [origin, setOrigin] = React.useState<{ x: number; y: number } | null>(
    null
  )
  const button = React.useRef<HTMLButtonElement>(null)
  const nextId = React.useRef(0)
  const timers = React.useRef<number[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

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

    const box = button.current?.getBoundingClientRect()
    if (box) {
      setOrigin({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
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

  const node = (
    <button
      ref={button}
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
      {children}
    </button>
  )

  return (
    <>
      {node}
      {/* Thrown from a fixed layer at the top of the document rather than from
          inside the button.

          An absolutely positioned piece still counts toward the page's
          scrollable area, so a burst near the bottom of a short page pushed the
          document taller for the length of the animation: a scrollbar appeared,
          the layout reflowed around it, and it vanished again when the pieces
          were cleared. Measured overhang was 142px below the document. A fixed
          layer contributes nothing to scroll overflow, in any browser.

          It also escapes any `overflow: hidden` between here and the body,
          which is the other thing that used to cut a burst in half. */}
      {mounted && origin && pieces.length > 0
        ? createPortal(
            <span
              aria-hidden="true"
              className="pointer-events-none fixed z-50 size-0"
              style={{ left: origin.x, top: origin.y }}
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
            </span>,
            document.body
          )
        : null}
    </>
  )
}

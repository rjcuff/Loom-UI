"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TiltCardProps extends React.ComponentProps<"div"> {
  /** Largest tilt in degrees, reached at the corners. */
  max?: number
  /** Depth of the perspective, as a CSS length. Lower is more extreme. */
  perspective?: string
  /** Scale held while the pointer is over the card. */
  scale?: number
  /** Lay a sheen over the card that follows the pointer. */
  glare?: boolean
  /** Render the card flat. */
  disabled?: boolean
}

export function TiltCard({
  children,
  className,
  max = 10,
  perspective = "800px",
  scale = 1.02,
  glare = true,
  disabled = false,
  style,
  ...props
}: TiltCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef(0)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  // A tilt is the whole component, so there is nothing to soften for someone
  // who asked for less motion. The card is rendered flat instead.
  const flat = disabled || reduced

  const write = React.useCallback((x: number, y: number, active: number) => {
    const node = ref.current
    if (!node) {
      return
    }
    node.style.setProperty("--tilt-x", `${x}`)
    node.style.setProperty("--tilt-y", `${y}`)
    node.style.setProperty("--tilt-active", `${active}`)
  }, [])

  const reset = React.useCallback(() => {
    cancelAnimationFrame(frame.current)
    write(50, 50, 0)
  }, [write])

  // Pointer position lands on custom properties inside a frame, so a move
  // costs a compositor update rather than a React render.
  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (flat) {
        return
      }
      const { clientX, clientY } = event
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const node = ref.current
        if (!node) {
          return
        }
        const rect = node.getBoundingClientRect()
        write(
          ((clientX - rect.left) / rect.width) * 100,
          ((clientY - rect.top) / rect.height) * 100,
          1
        )
      })
    },
    [flat, write]
  )

  React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div
      data-slot="tilt-card"
      className={cn("group", className)}
      style={{ perspective, ...style }}
      {...props}
    >
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={reset}
        onBlur={reset}
        className={cn(
          "relative isolate size-full rounded-[inherit]",
          !flat &&
            "transition-transform duration-[240ms] ease-[var(--ease-out-quart)]"
        )}
        style={
          {
            "--tilt-max": `${max}deg`,
            // A pointer at the top of the card tilts its top away, so the sign
            // on the X axis is inverted against the Y axis.
            transform: flat
              ? undefined
              : [
                  "rotateX(calc((var(--tilt-y, 50) - 50) / -50 * var(--tilt-max) * var(--tilt-active, 0)))",
                  "rotateY(calc((var(--tilt-x, 50) - 50) / 50 * var(--tilt-max) * var(--tilt-active, 0)))",
                  `scale(calc(1 + ${scale - 1} * var(--tilt-active, 0)))`,
                ].join(" "),
          } as React.CSSProperties
        }
      >
        {glare && !flat ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-[var(--tilt-active,0)] transition-opacity duration-[240ms]"
            style={{
              background:
                "radial-gradient(60% 60% at calc(var(--tilt-x, 50) * 1%) calc(var(--tilt-y, 50) * 1%), color-mix(in oklch, #fff 26%, transparent), transparent)",
            }}
          />
        ) : null}
        {children}
      </div>
    </div>
  )
}

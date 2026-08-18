"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface RippleButtonProps extends React.ComponentProps<"button"> {
  /** Milliseconds one ripple takes to cross the button and fade out. */
  duration?: number
  /** Colour of the ripple. Keep it translucent so the label stays readable. */
  color?: string
}

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

/**
 * The ripple is a circle scaled up from nothing, not a growing width, so a
 * press costs one composited layer and no layout.
 */
export function RippleButton({
  children,
  className,
  duration = 620,
  color = "color-mix(in oklch, currentColor 22%, transparent)",
  onPointerDown,
  onKeyDown,
  disabled,
  style,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = React.useState<Ripple[]>([])
  const nextId = React.useRef(0)

  // Measured from the press point to the furthest corner, so the circle always
  // finishes covering the button no matter where it started.
  const spawn = React.useCallback(
    (node: HTMLButtonElement, clientX?: number, clientY?: number) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return
      }

      const rect = node.getBoundingClientRect()
      const x = clientX === undefined ? rect.width / 2 : clientX - rect.left
      const y = clientY === undefined ? rect.height / 2 : clientY - rect.top
      const size =
        2 *
        Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))

      setRipples((current) => [
        ...current,
        { id: nextId.current++, x, y, size },
      ])
    },
    []
  )

  const drop = React.useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id))
  }, [])

  return (
    <button
      data-slot="ripple-button"
      disabled={disabled}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        if (!disabled) {
          spawn(event.currentTarget, event.clientX, event.clientY)
        }
      }}
      // Enter and Space press a button without a pointer ever touching it, so
      // the keyboard gets its own ripple from the middle rather than none.
      onKeyDown={(event) => {
        onKeyDown?.(event)
        const isPress = event.key === "Enter" || event.key === " "
        if (isPress && !event.repeat && !disabled) {
          spawn(event.currentTarget)
        }
      }}
      className={cn(
        "relative isolate inline-flex items-center justify-center overflow-hidden select-none",
        // The ripple says the press landed; the give says it landed on this.
        "transition-transform duration-150 ease-[var(--ease-out-quart)] active:scale-[0.97] motion-reduce:transition-none",
        className
      )}
      style={style}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          onAnimationEnd={() => drop(ripple.id)}
          className="animate-ripple-expand pointer-events-none absolute -z-10 rounded-full motion-reduce:hidden"
          style={
            {
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              background: color,
              "--ripple-duration": `${duration}ms`,
            } as React.CSSProperties
          }
        />
      ))}
      {children}
    </button>
  )
}

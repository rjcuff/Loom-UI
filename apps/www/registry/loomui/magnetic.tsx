"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

export interface MagneticProps extends React.ComponentProps<"div"> {
  /** How far the child follows the pointer, as a fraction of the offset. */
  strength?: number
  /** Pixels of slack around the element that still count as near. */
  radius?: number
  /** Largest pull in pixels, whatever the radius says. */
  max?: number
  /** Merge onto the single child instead of rendering a wrapper div. */
  asChild?: boolean
  /** Render the child with no pull. */
  disabled?: boolean
}

export function Magnetic({
  children,
  className,
  strength = 0.35,
  radius = 80,
  max = 16,
  asChild = false,
  disabled = false,
  style,
  ...props
}: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef(0)
  const Comp = asChild ? Slot : "div"

  const reset = React.useCallback(() => {
    cancelAnimationFrame(frame.current)
    const node = ref.current
    if (node) {
      node.style.translate = "0px 0px"
    }
  }, [])

  React.useEffect(() => {
    if (disabled) {
      reset()
      return
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduced.matches) {
      return
    }

    // Listening on the window rather than the element itself means the pull
    // starts before the pointer arrives, which is the whole effect.
    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const node = ref.current
        if (!node) {
          return
        }

        const rect = node.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        const near =
          Math.abs(dx) < rect.width / 2 + radius &&
          Math.abs(dy) < rect.height / 2 + radius

        if (!near) {
          node.style.translate = "0px 0px"
          return
        }

        const clamp = (value: number) =>
          Math.max(-max, Math.min(max, value * strength))
        node.style.translate = `${clamp(dx)}px ${clamp(dy)}px`
      })
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      cancelAnimationFrame(frame.current)
    }
  }, [disabled, radius, max, strength, reset])

  return (
    <Comp
      ref={ref}
      data-slot="magnetic"
      onBlur={reset}
      className={cn(
        "inline-block will-change-transform",
        // v4 compiles translate utilities to the `translate` property, so the
        // transition has to name `translate`, not `transform`.
        !disabled &&
          "transition-[translate] duration-[240ms] ease-[var(--ease-out-quart)] motion-reduce:transition-none",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </Comp>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SpotlightCardProps extends React.ComponentProps<"div"> {
  /** Diameter of the surface highlight in pixels. */
  size?: number
  /** Fill of the surface wash. Any CSS colour. Keep the alpha low. */
  color?: string
  /** Fill of the border highlight. Brighter than `color` on purpose. */
  borderColor?: string
  /** Mark the whole card as a target: pointer cursor and a focus ring. */
  interactive?: boolean
  /** Render a plain card with no highlight. */
  disabled?: boolean
}

/** Shows only the 1px ring of a layer, hiding the fill inside it. */
const RING_MASK: React.CSSProperties = {
  padding: 1,
  WebkitMask:
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
}

export function SpotlightCard({
  children,
  className,
  size = 320,
  color = "color-mix(in oklch, currentColor 10%, transparent)",
  borderColor = "color-mix(in oklch, var(--primary, currentColor) 60%, transparent)",
  interactive = false,
  disabled = false,
  style,
  ...props
}: SpotlightCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const frame = React.useRef(0)

  // Pointer position is written to CSS custom properties on the next frame.
  // Nothing here goes through state, so moving the mouse costs no renders.
  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return
      }
      const node = ref.current
      if (!node) {
        return
      }

      const { clientX, clientY } = event
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect()
        node.style.setProperty("--spotlight-x", `${clientX - rect.left}px`)
        node.style.setProperty("--spotlight-y", `${clientY - rect.top}px`)
      })
    },
    [disabled]
  )

  React.useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const highlight = (fill: string) =>
    `radial-gradient(var(--spotlight-size) circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), ${fill}, transparent 70%)`

  const layer =
    "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-[180ms] ease-[var(--ease-out-quart)] group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"

  return (
    <div
      ref={ref}
      data-slot="spotlight-card"
      onPointerMove={handlePointerMove}
      className={cn(
        "group relative isolate overflow-hidden rounded-xl border",
        interactive &&
          "focus-within:ring-ring/50 cursor-pointer focus-within:ring-2",
        className
      )}
      style={
        {
          "--spotlight-size": `${size}px`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {!disabled ? (
        <>
          {/* The lit edge is what makes the card read as live. The surface
              wash on its own is too soft to register. */}
          <span
            aria-hidden="true"
            className={layer}
            style={{ ...RING_MASK, background: highlight(borderColor) }}
          />
          <span
            aria-hidden="true"
            className={layer}
            style={{ background: highlight(color) }}
          />
        </>
      ) : null}

      <div className="relative">{children}</div>
    </div>
  )
}

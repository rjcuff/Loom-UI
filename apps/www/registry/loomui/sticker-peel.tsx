"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface StickerPeelProps extends React.ComponentProps<"div"> {
  /** How far the corner lifts, as a CSS length. */
  size?: string
  /** Which corner peels. */
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  /** Length of the peel in milliseconds. */
  duration?: number
  /** Hold the corner up. Leave it out to peel on hover and focus. */
  peeled?: boolean
}

/**
 * Each corner is one cut and one flap. The flap is the cut triangle mirrored
 * back over the crease, which is why its tip lands inside the sticker rather
 * than on top of the corner it came from.
 */
const CORNERS = {
  "top-left": {
    face: (size: string) =>
      `polygon(${size} 0, 100% 0, 100% 100%, 0 100%, 0 ${size})`,
    flap: "polygon(0 100%, 100% 0, 100% 100%)",
    anchor: "top-0 left-0 origin-top-left",
    sheen: "bg-linear-to-br",
  },
  "top-right": {
    face: (size: string) =>
      `polygon(0 0, calc(100% - ${size}) 0, 100% ${size}, 100% 100%, 0 100%)`,
    flap: "polygon(0 0, 100% 100%, 0 100%)",
    anchor: "top-0 right-0 origin-top-right",
    sheen: "bg-linear-to-bl",
  },
  "bottom-left": {
    face: (size: string) =>
      `polygon(0 0, 100% 0, 100% 100%, ${size} 100%, 0 calc(100% - ${size}))`,
    flap: "polygon(0 0, 100% 100%, 100% 0)",
    anchor: "bottom-0 left-0 origin-bottom-left",
    sheen: "bg-linear-to-tr",
  },
  "bottom-right": {
    face: (size: string) =>
      `polygon(0 0, 100% 0, 100% calc(100% - ${size}), calc(100% - ${size}) 100%, 0 100%)`,
    flap: "polygon(100% 0, 0 100%, 0 0)",
    anchor: "bottom-0 right-0 origin-bottom-right",
    sheen: "bg-linear-to-tl",
  },
} as const

export function StickerPeel({
  children,
  size = "2.75rem",
  corner = "bottom-right",
  duration = 380,
  peeled,
  className,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: StickerPeelProps) {
  const [hovered, setHovered] = React.useState(false)
  const isControlled = peeled !== undefined
  const lifted = isControlled ? peeled : hovered
  const spec = CORNERS[corner]

  return (
    <div
      data-slot="sticker-peel"
      data-peeled={lifted ? "" : undefined}
      className={cn("relative isolate", className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        setHovered(true)
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event)
        setHovered(false)
      }}
      // Focus bubbles, so anything focusable inside the sticker peels it too
      // and the corner is not a hover-only affordance.
      onFocus={(event) => {
        onFocus?.(event)
        setHovered(true)
      }}
      onBlur={(event) => {
        onBlur?.(event)
        setHovered(false)
      }}
      {...props}
    >
      {/* Both polygons have the same five points, so the browser interpolates
          the cut instead of snapping between two shapes. */}
      <div
        className="h-full w-full transition-[clip-path] ease-[var(--ease-out-quart)] motion-reduce:transition-none"
        style={{
          clipPath: spec.face(lifted ? size : "0px"),
          transitionDuration: `${duration}ms`,
        }}
      >
        {children}
      </div>

      <span
        data-slot="sticker-peel-flap"
        aria-hidden="true"
        className={cn(
          "from-border via-muted to-card pointer-events-none absolute transition-transform ease-[var(--ease-out-quart)] motion-reduce:transition-none",
          spec.anchor,
          spec.sheen
        )}
        style={{
          width: size,
          height: size,
          clipPath: spec.flap,
          // Grown from the corner rather than sized, so the flap and the cut
          // move on the same curve and the crease never splits.
          transform: lifted ? "scale(1)" : "scale(0)",
          transitionDuration: `${duration}ms`,
          filter: "drop-shadow(0 2px 6px rgb(0 0 0 / 0.28))",
        }}
      />
    </div>
  )
}

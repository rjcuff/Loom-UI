"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface GridBackdropProps extends React.ComponentProps<"svg"> {
  /** Cell width in pixels. */
  width?: number
  /** Cell height in pixels. */
  height?: number
  /** Dash pattern for the grid lines. `0` draws them solid. */
  strokeDasharray?: string | number
  /** How many cells light up. Set to `0` for a plain static grid. */
  squares?: number
  /** Seconds for one full fade in and out of a single cell. */
  duration?: number
  /** Changes which cells are chosen. Same seed, same layout, every render. */
  seed?: number
  /** Render the grid with no pulsing cells. */
  disabled?: boolean
}

/** Mulberry32. Deterministic so the server and the client agree. */
function createRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function GridBackdrop({
  width = 40,
  height = 40,
  strokeDasharray = 0,
  squares = 14,
  duration = 5,
  seed = 1,
  disabled = false,
  className,
  ...props
}: GridBackdropProps) {
  const id = React.useId()

  const cells = React.useMemo(() => {
    if (disabled || squares <= 0) {
      return []
    }
    const random = createRandom(seed)
    return Array.from({ length: squares }, (_, index) => ({
      key: index,
      x: Math.floor(random() * 30) * width,
      y: Math.floor(random() * 20) * height,
      delay: random() * duration * 2,
    }))
  }, [disabled, squares, seed, width, height, duration])

  return (
    <svg
      data-slot="grid-backdrop"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 size-full fill-current/[0.04] stroke-current/[0.08]",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${id})`} stroke="none" />

      {/* Opacity is the only thing that moves. The cells never change size or
          position, so this stays on the compositor. */}
      <g stroke="none">
        {cells.map((cell) => (
          <rect
            key={cell.key}
            width={width - 1}
            height={height - 1}
            x={cell.x + 1}
            y={cell.y + 1}
            className="animate-grid-pulse opacity-0 motion-reduce:animate-none"
            style={{
              animationDuration: `${duration}s`,
              animationDelay: `${cell.delay}s`,
            }}
          />
        ))}
      </g>
    </svg>
  )
}

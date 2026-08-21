"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

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

/**
 * Warns, in development only, when the parent is not a containing block.
 *
 * The layer is `absolute inset-0`, so it fills the nearest positioned
 * ancestor. Give it a `static` parent and it does not fail — it quietly finds
 * whatever is positioned further up and covers that instead, usually the whole
 * page. Nothing on screen says which parent is at fault.
 */
function useContainingBlock(
  ref: React.RefObject<SVGSVGElement | null>,
  name: string
) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return
    }

    const parent = ref.current?.parentElement
    if (!parent) {
      return
    }

    const { position } = getComputedStyle(parent)
    if (position === "static") {
      console.warn(
        `<${name}> is absolutely positioned and its parent is \`position: static\`, ` +
          `so it is filling some ancestor further up instead of that parent. ` +
          `Add \`relative\` (and usually \`overflow-hidden\`) to the parent.`,
        parent
      )
    }
  }, [ref, name])
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

  const root = React.useRef<SVGSVGElement>(null)
  useContainingBlock(root, "GridBackdrop")
  const [box, setBox] = React.useState({ width: 0, height: 0 })

  // The cells were spread over a fixed 30 by 20 patch of the pattern, which is
  // only the whole grid on a container of exactly that size. Anything wider
  // than about 1200px got every pulse crowded into its left-hand side and a
  // dead margin down the rest — and a backdrop is usually the widest thing on
  // the page. Measured instead, so they cover whatever box they are actually in.
  React.useEffect(() => {
    const node = root.current
    if (!node) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height }
      )
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const cells = React.useMemo(() => {
    const columns = Math.floor(box.width / width)
    const rows = Math.floor(box.height / height)

    if (disabled || squares <= 0 || columns < 1 || rows < 1) {
      return []
    }

    const random = createRandom(seed)
    return Array.from({ length: squares }, (_, index) => ({
      key: index,
      x: Math.floor(random() * columns) * width,
      y: Math.floor(random() * rows) * height,
      delay: random() * duration * 2,
    }))
  }, [disabled, squares, seed, width, height, duration, box.width, box.height])

  const onScreen = useInViewport(root)

  return (
    <svg
      ref={root}
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
            className={cn(
              "animate-grid-pulse opacity-0 motion-reduce:animate-none",
              !onScreen && "[animation-play-state:paused]"
            )}
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

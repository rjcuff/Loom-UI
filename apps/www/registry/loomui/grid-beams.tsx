"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

export interface GridBeamsProps extends React.ComponentProps<"div"> {
  /** Grid cell size in pixels. */
  cellSize?: number
  /** How many beams travel at once. */
  beams?: number
  /** Colours the beams are drawn from, one picked per beam. */
  colors?: string[]
  /** Seconds for one beam to cross the container. */
  duration?: number
  /** Length of a beam, as a percentage of the container it crosses. */
  length?: string
  /** Thickness of a beam in pixels. */
  thickness?: number
  /** Opacity of the static grid lines. */
  lineOpacity?: number
  /** Which way beams travel. `both` mixes the two. */
  axis?: "vertical" | "horizontal" | "both"
  /** Fade the layer out. `true` fades from the top, or pass a CSS mask. */
  fade?: boolean | string
  /** Changes which lines are chosen. Same seed, same layout, every render. */
  seed?: number
  /** Render the grid with no beams. */
  disabled?: boolean
}

const DEFAULT_COLORS = ["#22d3ee", "#38bdf8", "#a855f7", "#f472b6"]

/** Matches the hero: bright at the top, gone by the middle. */
const TOP_FADE =
  "radial-gradient(ellipse 70% 50% at 50% 0%, black, transparent)"

/** Mulberry32. Deterministic so a seed always gives the same layout. */
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

export function GridBeams({
  cellSize = 64,
  beams = 7,
  colors = DEFAULT_COLORS,
  duration = 4,
  length = "24%",
  thickness = 2,
  lineOpacity = 0.05,
  axis = "both",
  fade = true,
  seed = 1,
  disabled = false,
  className,
  style,
  ...props
}: GridBeamsProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ width: 0, height: 0 })

  // Grid lines land on fixed pixel multiples, so which of them are actually
  // on screen depends on how big the container is. Measuring is what keeps
  // every beam inside the frame instead of scattering some past the edge.
  React.useEffect(() => {
    const node = ref.current
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

  const streaks = React.useMemo(() => {
    const columns = Math.floor(box.width / cellSize)
    const rows = Math.floor(box.height / cellSize)

    if (disabled || beams <= 0) {
      return []
    }

    const palette = colors.length > 0 ? colors : DEFAULT_COLORS
    const random = createRandom(seed)

    // The layer clips, so a beam on the first or last line would be sliced in
    // half against the edge. The choice runs over the lines in between, and a
    // container too small to have any is left with no beams at all.
    const pickLine = (count: number) =>
      count < 3 ? null : 1 + Math.floor(random() * (count - 2))

    return Array.from({ length: beams }, (_, index) => {
      // A third horizontal is enough to read as a circuit rather than as
      // rain. An even split fights itself for attention.
      const horizontal =
        axis === "horizontal" || (axis === "both" && random() < 0.35)

      return {
        key: index,
        horizontal,
        line: pickLine(horizontal ? rows : columns),
        color: palette[Math.floor(random() * palette.length)],
        duration: duration * (0.7 + random() * 0.8),
        // Negative, so a beam is already partway along on the first frame
        // instead of every beam launching from the edge together.
        delay: -random() * duration * 2,
      }
    }).filter((streak) => streak.line !== null)
  }, [
    disabled,
    beams,
    colors,
    duration,
    axis,
    seed,
    cellSize,
    box.width,
    box.height,
  ])

  const onScreen = useInViewport(ref)
  const mask = fade === true ? TOP_FADE : fade === false ? undefined : fade

  return (
    <div
      ref={ref}
      data-slot="grid-beams"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{ WebkitMaskImage: mask, maskImage: mask, ...style }}
      {...props}
    >
      {/* Two gradients crossed: one draws the verticals, one the horizontals.
          `currentColor` so the lines inherit the surface's own ink instead of
          carrying a colour that only works on one theme. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: `${cellSize}px ${cellSize}px`,
          opacity: lineOpacity,
        }}
      />

      {streaks.map((streak) => {
        // The element spans the whole axis it travels, with the streak painted
        // into the leading slice of it. Translating by a percentage is then a
        // percentage of the container, so the travel itself needs no
        // measurement and stays on the compositor.
        const along: React.CSSProperties = streak.horizontal
          ? {
              top: `${streak.line! * cellSize}px`,
              width: "100%",
              height: thickness,
              background: `linear-gradient(to right, transparent 0%, ${streak.color} calc(${length} * 0.85), transparent ${length})`,
            }
          : {
              left: `${streak.line! * cellSize}px`,
              width: thickness,
              height: "100%",
              background: `linear-gradient(to bottom, transparent 0%, ${streak.color} calc(${length} * 0.85), transparent ${length})`,
            }

        return (
          <span
            key={streak.key}
            className={cn(
              "absolute motion-reduce:hidden",
              streak.horizontal
                ? "animate-grid-beam-x left-0"
                : "animate-grid-beam top-0",
              !onScreen && "[animation-play-state:paused]"
            )}
            style={
              {
                ...along,
                "--beam-length": length,
                // Drop-shadow reads the gradient's alpha, so the glow follows
                // the streak rather than boxing the whole element.
                filter: `drop-shadow(0 0 6px ${streak.color})`,
                animationDuration: `${streak.duration}s`,
                animationDelay: `${streak.delay}s`,
              } as React.CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

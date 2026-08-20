"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

export interface LightCurtainProps extends React.ComponentProps<"div"> {
  /** How many columns hang from the top edge. */
  beams?: number
  /** Colours the columns are drawn from, one picked per column. */
  colors?: string[]
  /** Seconds for one column to fall the length of its travel. */
  duration?: number
  /** How far a column drifts sideways on the way down, as a CSS length. */
  drift?: string
  /** How far a column falls, as a CSS length. */
  fall?: string
  /** How far down the columns reach, as a percentage of the container. */
  reach?: string
  /** Brightest a column gets. */
  intensity?: number
  /** Softening pass over the whole layer, in pixels. */
  blur?: number
  /** Fade the layer out downwards. `true` for the default, or pass a CSS mask. */
  fade?: boolean | string
  /** Changes which columns are drawn. Same seed, same layout, every render. */
  seed?: number
  /** Render the columns still. */
  disabled?: boolean
}

/** The same four as grid-beams, so the two can sit on one page. */
const DEFAULT_COLORS = ["#22d3ee", "#38bdf8", "#a855f7", "#f472b6"]

/**
 * Rounded off rather than ramped. A two-stop ramp meets full opacity at a
 * point the eye reads as a hard line across the page.
 */
const BOTTOM_FADE =
  "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.35) 72%, transparent 100%)"

/** Feathers a column's two long sides so it has no edge to catch on. */
const SIDE_FEATHER =
  "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 22%, black 50%, rgba(0,0,0,0.6) 78%, transparent 100%)"

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

/**
 * Columns of light falling from the top edge, each on its own clock.
 *
 * There is no blur on the individual columns and no hard edge to hide. Each
 * one is a radial gradient that is already soft on every side, which costs a
 * paint rather than a filter pass per column, and leaves the drift free to be
 * a plain transform.
 *
 * Sizes, colours, offsets and timings all come out of a seeded generator, so
 * the layout is the same on the server as in the browser and the same on every
 * render. Fed real randomness, every column would jump to a new place the next
 * time anything above it re-rendered.
 */
export function LightCurtain({
  beams = 7,
  colors = DEFAULT_COLORS,
  duration = 9,
  drift = "2rem",
  fall = "9rem",
  reach = "72%",
  intensity = 0.85,
  blur = 18,
  fade = true,
  seed = 1,
  disabled = false,
  className,
  style,
  ...props
}: LightCurtainProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const visible = useInViewport(ref)

  const columns = React.useMemo(() => {
    const random = createRandom(seed)

    return Array.from({ length: beams }, (_, index) => {
      // Spread across the width first, then nudged, so no two land on top of
      // each other however the generator falls.
      const lane = ((index + 0.5) / beams) * 100
      const offset = (random() - 0.5) * (100 / beams) * 0.9

      return {
        key: index,
        left: lane + offset,
        // Narrow. Wide columns overlap into one wash and stop reading as
        // separate beams at all.
        width: 4 + random() * 7,
        // Tall enough to still be crossing the panel at the end of the fall.
        height: 95 + random() * 55,
        color: colors[Math.floor(random() * colors.length) % colors.length],
        // Never a whole number of seconds apart, so the columns do not fall
        // into step with each other and start arriving as one.
        duration: duration * (0.72 + random() * 0.66),
        delay: -random() * duration * 2,
        low: intensity * (0.35 + random() * 0.25),
        high: intensity * (0.78 + random() * 0.22),
      }
    })
  }, [beams, colors, duration, intensity, seed])

  const mask = fade === true ? BOTTOM_FADE : fade || undefined

  return (
    <div
      ref={ref}
      data-slot="light-curtain"
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        ...style,
      }}
      {...props}
    >
      {/* One softening pass over the whole layer rather than one per column.
          The blur is static: nothing animates it, and the columns drift
          underneath it on transforms that never re-run it. */}
      <div
        className="absolute inset-0"
        style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
      >
        {columns.map((column) => (
          <div
            key={column.key}
            className={cn(
              // Starts above the top edge, so a column is never seen to begin.
              "absolute -top-[8%] will-change-transform",
              !disabled && "animate-light-curtain",
              "motion-reduce:animate-none"
            )}
            style={
              {
                left: `${column.left}%`,
                width: `${column.width}%`,
                height: `${column.height}%`,
                maxHeight: reach,
                // Two gradients doing two different jobs. Down the column, a
                // linear ramp carries the colour the whole way and lets go at
                // the bottom. Across it, a mask feathers both sides.
                //
                // A radial gradient does both at once and neither well: the
                // colour pools near the top and the column reads as a blob
                // rather than as light falling.
                backgroundImage: `linear-gradient(to bottom, ${column.color}, transparent 88%)`,
                maskImage: SIDE_FEATHER,
                WebkitMaskImage: SIDE_FEATHER,
                opacity: disabled ? column.high : undefined,
                animationDuration: `${column.duration}s`,
                animationDelay: `${column.delay}s`,
                animationPlayState: visible ? undefined : "paused",
                "--curtain-drift": drift,
                "--curtain-fall": fall,
                "--curtain-low": column.low,
                "--curtain-high": column.high,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

export interface LightCurtainProps extends React.ComponentProps<"div"> {
  /** How many bands of colour are layered into the wash. */
  bands?: number
  /** Colours the bands are drawn from, one picked per band. */
  colors?: string[]
  /** Seconds for one band to lean out and back. */
  duration?: number
  /** How far a band drifts sideways, as a CSS length. */
  drift?: string
  /** How far down the wash reaches, as a percentage of the container. */
  reach?: string
  /** Brightest the wash gets. */
  intensity?: number
  /** Softening pass over the whole layer, in pixels. */
  blur?: number
  /** Fade the layer out downwards. `true` for the default, or pass a CSS mask. */
  fade?: boolean | string
  /** Changes how the bands are laid out. Same seed, same wash, every render. */
  seed?: number
  /** Render the wash still. */
  disabled?: boolean
}

/** The same four as grid-beams, so the two can sit on one page. */
const DEFAULT_COLORS = ["#22d3ee", "#38bdf8", "#a855f7", "#f472b6"]

/**
 * Rounded off rather than ramped. A two-stop ramp meets full opacity at a
 * point the eye reads as a hard line across the page.
 */
const BOTTOM_FADE =
  "linear-gradient(to bottom, black 0%, rgba(0,0,0,0.82) 42%, rgba(0,0,0,0.3) 72%, transparent 100%)"

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
 * An aurora hanging from the top edge: broad bands of colour leaning across
 * each other and falling away down the page.
 *
 * The bands are wide and overlapping on purpose. Narrow ones read as separate
 * beams, and separate beams that come and go read as something loading. An
 * aurora is one moving sheet, so what moves here is the shape of the sheet
 * rather than any object in it. Each band widens, narrows and leans on its own
 * clock, and the silhouette they add up to is never the same twice.
 *
 * Sizes, colours, offsets and timings all come out of a seeded generator, so
 * the layout is the same on the server as in the browser and the same on every
 * render. Fed real randomness, the whole wash would rearrange itself the next
 * time anything above it re-rendered.
 */
export function LightCurtain({
  bands = 5,
  colors = DEFAULT_COLORS,
  duration = 16,
  drift = "5rem",
  reach = "85%",
  intensity = 0.55,
  blur = 64,
  fade = true,
  seed = 1,
  disabled = false,
  className,
  style,
  ...props
}: LightCurtainProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const visible = useInViewport(ref)

  const veils = React.useMemo(() => {
    const random = createRandom(seed)

    return Array.from({ length: bands }, (_, index) => {
      // Spread across the width, then nudged. Every band is far wider than its
      // own share of the row, so they always overlap into one sheet.
      const lane = ((index + 0.5) / bands) * 100
      const width = 46 + random() * 38

      return {
        key: index,
        left: lane + (random() - 0.5) * (100 / bands) - width / 2,
        width,
        height: 70 + random() * 45,
        color: colors[Math.floor(random() * colors.length) % colors.length],
        // Never a whole number of seconds apart, so the bands do not fall into
        // step and start breathing as one.
        duration: duration * (0.7 + random() * 0.7),
        delay: -random() * duration * 2,
        narrow: 0.82 + random() * 0.12,
        wide: 1.12 + random() * 0.16,
        low: intensity * (0.45 + random() * 0.2),
        high: intensity * (0.82 + random() * 0.18),
      }
    })
  }, [bands, colors, duration, intensity, seed])

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
      style={{ maskImage: mask, WebkitMaskImage: mask, ...style }}
      {...props}
    >
      {/* One softening pass over the whole sheet rather than one per band. It
          is what turns five overlapping gradients into a single wash, and it is
          static: the bands lean underneath it on transforms that never re-run
          it. */}
      <div
        className="absolute inset-0"
        style={{ filter: blur > 0 ? `blur(${blur}px)` : undefined }}
      >
        {veils.map((veil) => (
          <div
            key={veil.key}
            className={cn(
              // Pinned to the top edge and scaled from it, so a band that
              // widens never lifts off the edge the light comes in at.
              "absolute top-0 origin-top will-change-transform",
              !disabled && "animate-light-curtain",
              "motion-reduce:animate-none"
            )}
            style={
              {
                left: `${veil.left}%`,
                width: `${veil.width}%`,
                height: `${veil.height}%`,
                maxHeight: reach,
                // Soft on every side by construction, so the blur has no edge
                // to hide and the sheet has no seam in it.
                backgroundImage: `radial-gradient(ellipse 62% 100% at 50% 0%, ${veil.color}, transparent 74%)`,
                opacity: disabled ? veil.high : undefined,
                animationDuration: `${veil.duration}s`,
                animationDelay: `${veil.delay}s`,
                animationPlayState: visible ? undefined : "paused",
                "--curtain-drift": drift,
                "--curtain-narrow": veil.narrow,
                "--curtain-wide": veil.wide,
                "--curtain-low": veil.low,
                "--curtain-high": veil.high,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}

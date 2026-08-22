"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

export interface AuroraBackdropProps extends React.ComponentProps<"div"> {
  /** Colours of the drifting blobs. One blob is drawn per colour. */
  colors?: string[]
  /** Blur applied to the whole wash, as a CSS length. */
  blur?: string
  /** Seconds for one full drift of a single blob. */
  duration?: number
  /** Opacity of the layer, from `0` to `1`. */
  intensity?: number
  /** Changes where the blobs sit. Same seed, same layout, every render. */
  seed?: number
  /** Render the wash static. */
  disabled?: boolean
}

const DEFAULT_COLORS = ["#2dd4bf", "#38bdf8", "#3b82f6", "#a78bfa"]

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
 * ancestor. Give it a `static` parent and it does not fail. It quietly finds
 * whatever is positioned further up and covers that instead, usually the whole
 * page. Nothing on screen says which parent is at fault.
 */
function useContainingBlock(
  ref: React.RefObject<HTMLDivElement | null>,
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

export function AuroraBackdrop({
  colors = DEFAULT_COLORS,
  blur = "72px",
  duration = 18,
  intensity = 0.5,
  seed = 1,
  disabled = false,
  className,
  style,
  ...props
}: AuroraBackdropProps) {
  const blobs = React.useMemo(() => {
    const palette = colors.length > 0 ? colors : DEFAULT_COLORS
    const random = createRandom(seed)

    return palette.map((color, index) => ({
      key: index,
      color,
      // Well under the container, so the drift is a blob crossing the frame
      // rather than a full-bleed wash shifting a few percent.
      size: 38 + random() * 32,
      x: random() * 100,
      y: random() * 100,
      // Every blob runs the same keyframes at a different length and phase.
      // Cycles that never line up are what stops the wash reading as a loop.
      duration: duration * (0.75 + random() * 0.6),
      delay: -random() * duration,
    }))
  }, [colors, seed, duration])

  const root = React.useRef<HTMLDivElement>(null)
  useContainingBlock(root, "AuroraBackdrop")
  // Large blurred gradients are the most expensive thing here to keep drifting
  // for a viewport nobody is looking at.
  const onScreen = useInViewport(root)

  return (
    <div
      ref={root}
      data-slot="aurora-backdrop"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      style={{ opacity: intensity, ...style }}
      {...props}
    >
      {blobs.map((blob) => (
        <span
          key={blob.key}
          className={cn(
            "absolute rounded-full",
            !disabled && "animate-aurora-drift motion-reduce:animate-none",
            !onScreen && "[animation-play-state:paused]"
          )}
          style={{
            width: `${blob.size}%`,
            height: `${blob.size}%`,
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            // The blobs are placed by their centres, so one sitting at the edge
            // still bleeds off it instead of stopping short.
            translate: "-50% -50%",
            // An ellipse, not a circle: a circle sized to the closest side
            // leaves the corners of a wide blob empty.
            background: `radial-gradient(closest-side, ${blob.color}, transparent)`,
            filter: `blur(${blur})`,
            animationDuration: `${blob.duration}s`,
            animationDelay: `${blob.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

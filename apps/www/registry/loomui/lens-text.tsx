"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LensTextProps extends React.ComponentProps<"span"> {
  /** Blur radius of the resting text, in pixels. */
  blur?: number
  /** Diameter of the lens in pixels. */
  size?: number
  /** How much of the lens fades out at its edge, from `0` to `1`. */
  feather?: number
  /** Scale applied to the text under the lens. `1` is a plain focus window. */
  magnify?: number
  /** Corner radius of the frosted panel. Any CSS length; `em` scales with the type. */
  radius?: string
  /**
   * Milliseconds the lens takes to catch up to the pointer, and the pace it
   * opens and closes at. `0` locks it to the pointer.
   */
  follow?: number
  /** Draw a hairline ring around the lens. */
  ring?: boolean
  /** Render the text sharp, with no blur and no lens. */
  disabled?: boolean
}

/**
 * A hovering pointer is the only way to aim the lens, so anything else (touch,
 * pen, keyboard-only) gets the text sharp rather than never getting it at all.
 */
const HOVER_QUERY = "(hover: hover) and (pointer: fine)"
const MOTION_QUERY = "(prefers-reduced-motion: reduce)"

/** The lens opens slower than it tracks, or it pops on the way in. */
const OPEN_FACTOR = 1.6

/**
 * Room for the blur to fall off inside the panel rather than at its edge.
 * In `em` so it tracks the type it is wrapped around.
 */
const PANEL_PADDING = "0.28em 0.45em"

function useMediaQuery(query: string, fallback: boolean) {
  // Server and first client paint agree on `fallback`. The effect corrects it
  // before anyone can interact, so there is no hydration mismatch.
  const [matches, setMatches] = React.useState(fallback)

  React.useEffect(() => {
    const list = window.matchMedia(query)
    const sync = () => setMatches(list.matches)

    sync()
    list.addEventListener("change", sync)
    return () => list.removeEventListener("change", sync)
  }, [query])

  return matches
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1)
}

export function LensText({
  children,
  className,
  blur = 8,
  size = 110,
  feather = 0.5,
  magnify = 1,
  radius = "0.35em",
  follow = 130,
  ring = false,
  disabled = false,
  style,
  ...props
}: LensTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const frame = React.useRef(0)
  const running = React.useRef(false)
  const hasHover = useMediaQuery(HOVER_QUERY, true)
  const reduceMotion = useMediaQuery(MOTION_QUERY, false)

  const lensRadius = size / 2
  const tau = reduceMotion ? 0 : Math.max(follow, 0)

  // Everything the animation reads and writes lives in one ref. The lens runs
  // entirely on CSS custom properties, so a pointer crossing the text costs
  // zero renders.
  const lens = React.useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    radius: 0,
    targetRadius: 0,
    last: 0,
  })

  const write = React.useCallback((open: number) => {
    const node = ref.current
    const state = lens.current
    if (!node) {
      return
    }

    node.style.setProperty("--lens-x", `${state.x}px`)
    node.style.setProperty("--lens-y", `${state.y}px`)
    node.style.setProperty("--lens-radius", `${state.radius}px`)
    node.style.setProperty("--lens-open", `${open}`)
  }, [])

  const tick = React.useCallback(
    (now: number) => {
      const state = lens.current
      const elapsed = state.last ? Math.min(now - state.last, 64) : 16
      state.last = now

      // Exponential ease toward the target. Framing it as a time constant
      // rather than a per-frame fraction keeps the feel identical at 60Hz and
      // at 120Hz.
      const move = tau === 0 ? 1 : 1 - Math.exp(-elapsed / tau)
      const open = tau === 0 ? 1 : 1 - Math.exp(-elapsed / (tau * OPEN_FACTOR))

      state.x += (state.targetX - state.x) * move
      state.y += (state.targetY - state.y) * move
      state.radius += (state.targetRadius - state.radius) * open

      const settled =
        Math.abs(state.targetRadius - state.radius) < 0.25 &&
        Math.abs(state.targetX - state.x) < 0.25 &&
        Math.abs(state.targetY - state.y) < 0.25

      if (settled) {
        state.x = state.targetX
        state.y = state.targetY
        state.radius = state.targetRadius
        state.last = 0
        running.current = false
      }

      write(lensRadius === 0 ? 0 : clamp01(state.radius / lensRadius))

      if (!settled) {
        frame.current = requestAnimationFrame(tick)
      }
    },
    [lensRadius, tau, write]
  )

  // A single loop runs until the lens settles. Pointer events only move the
  // target, so a fast mouse cannot stack frames or reset the timing.
  const start = React.useCallback(() => {
    if (running.current) {
      return
    }

    running.current = true
    lens.current.last = 0
    frame.current = requestAnimationFrame(tick)
  }, [tick])

  const point = React.useCallback(
    (event: React.PointerEvent<HTMLSpanElement>, snap: boolean) => {
      const node = ref.current
      if (!node) {
        return
      }

      const rect = node.getBoundingClientRect()
      const state = lens.current
      state.targetX = event.clientX - rect.left
      state.targetY = event.clientY - rect.top
      state.targetRadius = lensRadius

      // On the way in the lens opens where the pointer already is. Sliding it
      // across from wherever it was left last time reads as a bug.
      if (snap) {
        state.x = state.targetX
        state.y = state.targetY
      }

      start()
    },
    [lensRadius, start]
  )

  const handleLeave = React.useCallback(() => {
    lens.current.targetRadius = 0
    start()
  }, [start])

  React.useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      running.current = false
    },
    []
  )

  if (disabled || !hasHover) {
    return (
      <span
        data-slot="lens-text"
        className={className}
        style={style}
        {...props}
      >
        {children}
      </span>
    )
  }

  // Where the lens stops being fully opaque. At `feather: 0` the edge is a
  // hard cut. At `1` it falls off from the centre.
  const core = `${Math.round((1 - clamp01(feather)) * 100)}%`
  const at = "var(--lens-x, 50%) var(--lens-y, 50%)"

  return (
    <span
      ref={ref}
      data-slot="lens-text"
      onPointerEnter={(event) => point(event, true)}
      onPointerMove={(event) => point(event, false)}
      onPointerLeave={handleLeave}
      className={cn("relative isolate inline-block", className)}
      style={
        {
          "--lens": `radial-gradient(var(--lens-radius, 0px) circle at ${at}, #000 ${core}, transparent 100%)`,
          "--lens-hole": `radial-gradient(var(--lens-radius, 0px) circle at ${at}, transparent ${core}, #000 100%)`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* The blurred copy is the real text: filters are invisible to assistive
          technology, so the accessible name and the selection stay here. The
          lens is punched out of it, or the sharp copy would sit on top of a
          blurred one and read as a halo.

          The blur goes on the inner span and the panel does the clipping.
          Blurring the panel itself would spread the glow past its own edges,
          where the mask cuts it off square, and a pane of frosted glass with
          four hard corners is the tell that this is two divs. */}
      <span
        className="block overflow-hidden [mask-image:var(--lens-hole)] [-webkit-mask-image:var(--lens-hole)]"
        style={{ padding: PANEL_PADDING, borderRadius: radius }}
      >
        <span className="block" style={{ filter: `blur(${blur}px)` }}>
          {children}
        </span>
      </span>

      {/* The sharp copy is a duplicate clipped to the lens. `inset-0` and the
          same padding put it exactly over the blurred one, so both wrap on the
          same words. Nothing here fades: the lens radius is what animates, and
          both layers read it from the same custom property, so the hole and
          the fill always agree. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 block [mask-image:var(--lens)] select-none [-webkit-mask-image:var(--lens)]"
        style={{
          padding: PANEL_PADDING,
          transform: magnify === 1 ? undefined : `scale(${magnify})`,
          transformOrigin: at,
        }}
      >
        {children}
      </span>

      {ring ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{
            top: "var(--lens-y, 50%)",
            left: "var(--lens-x, 50%)",
            height: "calc(var(--lens-radius, 0px) * 2)",
            width: "calc(var(--lens-radius, 0px) * 2)",
            opacity: "var(--lens-open, 0)",
            borderColor: "color-mix(in oklch, currentColor 20%, transparent)",
          }}
        />
      ) : null}
    </span>
  )
}

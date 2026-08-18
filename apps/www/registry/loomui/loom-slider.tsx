"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LoomSliderProps extends Omit<
  React.ComponentProps<"div">,
  "onChange" | "defaultValue"
> {
  /** The current value. Leave it out to let the slider own it. */
  value?: number
  /** Starting value when the slider owns it. */
  defaultValue?: number
  /** Called with the value the slider moved to. */
  onValueChange?: (value: number) => void
  /** Low end of the range. */
  min?: number
  /** High end of the range. */
  max?: number
  /** Smallest movement the value can make. */
  step?: number
  /** How many dashes are strung across the track. */
  tickCount?: number
  /** How many dashes either side of the value the rise reaches across. */
  reach?: number
  /** Show the value above the dash it belongs to. */
  showValue?: boolean
  /** Turns the value into the text shown above the track. */
  formatValue?: (value: number) => string
  /** Name for the slider. */
  label?: string
  /** Render at the current value, but refuse input. */
  disabled?: boolean
}

/**
 * Dash lengths as a share of the track's height, measured from its middle. The
 * row is close to even on purpose: the rise only has to say where the value is,
 * and a dash that towers over its neighbours turns the track into a chart.
 */
const BASE_LENGTH = 30
const PEAK_LENGTH = 36
const WAVE_LENGTH = 8

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

/** Nearest step from `min`, so a range like 0–7 in 0.5s never lands off-grid. */
function snap(value: number, min: number, max: number, step: number) {
  if (step <= 0) return clamp(value, min, max)
  return clamp(min + Math.round((value - min) / step) * step, min, max)
}

/**
 * A bell centred on the value: 1 at the dash being held, 0 once `reach` dashes
 * away. Cosine rather than linear, so the rise has no corner at either end.
 */
function bell(distance: number, reach: number) {
  if (distance >= reach) return 0
  return (1 + Math.cos((distance / reach) * Math.PI)) / 2
}

interface Motion {
  /** Where the value is now, on its way to the target. */
  value: number
  /** Units per millisecond, which is how hard the wave is driven. */
  velocity: number
  /** Milliseconds the slider has been in motion, used as the wave's phase. */
  elapsed: number
}

/**
 * Every dash is drawn from this on each frame, so the slider is animated in one
 * place. Nothing is left to a CSS transition: the value changes on every
 * pointer move, and a transition that restarts each frame never arrives.
 *
 * `tau` is roughly how long it takes to close the gap to the target. Frames are
 * measured rather than counted, so the ease is the same on a 60Hz panel and a
 * 120Hz one.
 */
function useMotion(target: number, tau: number): Motion {
  const [motion, setMotion] = React.useState<Motion>({
    value: target,
    velocity: 0,
    elapsed: 0,
  })
  const valueRef = React.useRef(target)
  const elapsedRef = React.useRef(0)

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      valueRef.current = target
      setMotion({ value: target, velocity: 0, elapsed: elapsedRef.current })
      return
    }

    let frame = 0
    let last = performance.now()

    const tick = (now: number) => {
      // A tab that was in the background hands back one enormous frame. Capping
      // it keeps that from registering as a violent flick of the slider.
      const delta = Math.min(now - last, 64)
      last = now
      elapsedRef.current += delta

      const remaining = target - valueRef.current
      if (Math.abs(remaining) < 0.002) {
        valueRef.current = target
        setMotion({ value: target, velocity: 0, elapsed: elapsedRef.current })
        return
      }

      const movement = remaining * (1 - Math.exp(-delta / tau))
      valueRef.current += movement
      setMotion({
        value: valueRef.current,
        velocity: movement / delta,
        elapsed: elapsedRef.current,
      })
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, tau])

  return motion
}

/**
 * A row of dashes rather than a bar. The dash on the value is the longest and
 * its neighbours fall away behind it, each growing from the middle of the track
 * rather than standing on its floor, so the grab point reads without a knob
 * drawn over it. Moving the value sends a wave out along the row, and the wave
 * is as strong as the movement that caused it.
 */
export function LoomSlider({
  value,
  defaultValue = 50,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  tickCount = 41,
  reach = 4,
  showValue = true,
  formatValue,
  label = "Value",
  disabled = false,
  className,
  style,
  ...props
}: LoomSliderProps) {
  const [own, setOwn] = React.useState(() => snap(defaultValue, min, max, step))
  const [dragging, setDragging] = React.useState(false)
  const trackRef = React.useRef<HTMLDivElement>(null)

  const isControlled = value !== undefined
  const current = snap(isControlled ? value : own, min, max, step)
  // Close behind the finger while dragging, unhurried when a key or a click
  // sends the value somewhere else and the trip is worth watching.
  const motion = useMotion(current, dragging ? 45 : 110)

  const span = max === min ? 1 : max - min
  /** Where the value sits along the track, 0 to 1. */
  const ratio = clamp((motion.value - min) / span, 0, 1)
  /** How hard the row is being driven, 0 at rest and 1 on a fast drag. */
  const energy = clamp((Math.abs(motion.velocity) / span) * 900, 0, 1)

  // The rise is centred on a dash, not on the raw ratio. Landing between two
  // dashes lifts one side harder than the other and leaves no middle to read
  // the value off, which is the whole job of the peak.
  const peakIndex = Math.round(ratio * (tickCount - 1))
  const peak = tickCount > 1 ? peakIndex / (tickCount - 1) : 0

  const commit = (next: number) => {
    if (disabled) return
    const snapped = snap(next, min, max, step)
    if (!isControlled) setOwn(snapped)
    if (snapped !== current) onValueChange?.(snapped)
  }

  const commitFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const position = (event.clientX - rect.left) / rect.width
    commit(min + clamp(position, 0, 1) * (max - min))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const distance = event.shiftKey ? step * 10 : step

    if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      commit(current - distance)
    } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      commit(current + distance)
    } else if (event.key === "PageDown") {
      commit(current - step * 10)
    } else if (event.key === "PageUp") {
      commit(current + step * 10)
    } else if (event.key === "Home") {
      commit(min)
    } else if (event.key === "End") {
      commit(max)
    } else {
      return
    }

    event.preventDefault()
  }

  const ticks = React.useMemo(
    () => Array.from({ length: tickCount }, (_, index) => index),
    [tickCount]
  )

  return (
    <div
      data-slot="loom-slider"
      data-dragging={dragging ? "" : undefined}
      className={cn("w-full select-none", disabled && "opacity-50", className)}
      style={style}
      {...props}
    >
      {showValue ? (
        <div className="relative mb-3 h-7">
          <div
            data-slot="loom-slider-value"
            className="text-foreground absolute top-0 text-2xl leading-none font-semibold tabular-nums"
            // Sits over the dash the rise is centred on, so the number and the
            // tallest dash are never a few pixels out from each other.
            style={{ left: `${peak * 100}%`, translate: "-50% 0" }}
          >
            {formatValue
              ? formatValue(current)
              : Math.round(motion.value).toLocaleString()}
          </div>
        </div>
      ) : null}

      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-orientation="horizontal"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={formatValue?.(current)}
        aria-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        onPointerDown={(event) => {
          if (disabled) return
          event.currentTarget.setPointerCapture(event.pointerId)
          setDragging(true)
          commitFromPointer(event)
        }}
        onPointerMove={(event) => {
          if (dragging) commitFromPointer(event)
        }}
        onPointerUp={(event) => {
          event.currentTarget.releasePointerCapture(event.pointerId)
          setDragging(false)
        }}
        onPointerCancel={() => setDragging(false)}
        className={cn(
          "ring-ring/60 relative flex h-16 items-center justify-between rounded-md outline-none focus-visible:ring-2",
          disabled ? "cursor-not-allowed" : "cursor-ew-resize"
        )}
        // Only the axis the value travels on is claimed, so a finger that lands
        // on the track can still scroll the page.
        style={{ touchAction: "pan-y" }}
      >
        {ticks.map((index) => {
          const position = tickCount > 1 ? index / (tickCount - 1) : 0
          // A whole number of dashes from the peak, so the same count rises on
          // either side and `reach` means the same thing however many dashes
          // are strung across the track.
          const distance = Math.abs(index - peakIndex)
          const weight = bell(distance, reach)

          // The wave: one travelling ripple, strongest at the value and dying
          // out along the row, and only there at all while the value moves.
          const ripple =
            energy > 0
              ? Math.sin(distance * 0.8 - motion.elapsed * 0.013) *
                Math.exp(-distance / 7) *
                WAVE_LENGTH *
                energy
              : 0

          const length = Math.max(
            6,
            BASE_LENGTH + weight * PEAK_LENGTH + ripple
          )

          return (
            <span
              key={index}
              aria-hidden="true"
              data-slot="loom-slider-tick"
              className={cn(
                "w-[3px] shrink-0 rounded-full",
                index <= peakIndex ? "bg-primary" : "bg-muted-foreground"
              )}
              style={{
                height: `${length}%`,
                opacity: clamp(0.45 + weight * 0.55 + energy * 0.1, 0, 1),
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

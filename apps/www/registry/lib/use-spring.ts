"use client"

import * as React from "react"

export interface SpringOptions {
  /**
   * Seconds to settle, roughly. A spring has no fixed end, but this is the
   * number you would have reached for with a duration.
   */
  duration?: number
  /**
   * Overshoot. `0` arrives and stops, above `0` passes the target and comes
   * back, below `0` eases in slow. Keep it under `0.3` for anything that is
   * not meant to be playful.
   */
  bounce?: number
  /** Below this, in target units, the spring is called finished. */
  epsilon?: number
}

type Values = Record<string, number>

/** Fixed step, so the motion is the same on a 60Hz screen and a 120Hz one. */
const STEP = 1 / 240
/** A tab left in the background hands back one enormous frame. Ignore it. */
const MAX_FRAME = 0.064

/**
 * Apple's parameterisation: say how long and how bouncy, rather than picking
 * mass, stiffness and damping and discovering what they add up to.
 */
function coefficients({ duration = 0.4, bounce = 0 }: SpringOptions) {
  const omega = (2 * Math.PI) / duration
  const damping =
    bounce >= 0
      ? (4 * Math.PI * (1 - bounce)) / duration
      : (4 * Math.PI) / (duration * (1 + bounce))

  return { stiffness: omega * omega, damping }
}

/**
 * A spring over a set of named numbers, driven straight onto a callback rather
 * than through state. A frame that re-renders is a frame that can drop.
 *
 * The point of a spring over a curve is interruption. A CSS animation retargeted
 * halfway through restarts from a standstill, which is the moment it stops
 * feeling physical. This carries velocity across every retarget, so a value
 * already travelling keeps travelling.
 */
export function useSpring(
  onFrame: (values: Values) => void,
  options: SpringOptions = {}
) {
  const { epsilon = 0.0005 } = options
  const { stiffness, damping } = coefficients(options)

  const current = React.useRef<Values>({})
  const velocity = React.useRef<Values>({})
  const target = React.useRef<Values>({})
  const frame = React.useRef(0)
  const clock = React.useRef(0)

  // Read through refs so the loop never closes over a stale callback and never
  // has to be torn down and rebuilt when one changes.
  const frameRef = React.useRef(onFrame)
  const springRef = React.useRef({ stiffness, damping, epsilon })
  React.useEffect(() => {
    frameRef.current = onFrame
    springRef.current = { stiffness, damping, epsilon }
  })

  const stop = React.useCallback(() => {
    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = 0
  }, [])

  const tick = React.useCallback((now: number) => {
    const elapsed = Math.min((now - clock.current) / 1000, MAX_FRAME)
    clock.current = now

    const { stiffness: k, damping: c, epsilon: rest } = springRef.current
    let moving = false

    for (const key of Object.keys(target.current)) {
      const to = target.current[key]
      let x = current.current[key] ?? to
      let v = velocity.current[key] ?? 0

      // Sub-stepped: one big step at a low frame rate overshoots into
      // oscillation, and a stiff spring diverges outright.
      for (let t = 0; t < elapsed; t += STEP) {
        const step = Math.min(STEP, elapsed - t)
        v += (-k * (x - to) - c * v) * step
        x += v * step
      }

      if (Math.abs(x - to) < rest && Math.abs(v) < rest) {
        x = to
        v = 0
      } else {
        moving = true
      }

      current.current[key] = x
      velocity.current[key] = v
    }

    frameRef.current({ ...current.current })

    if (moving) {
      frame.current = requestAnimationFrame(tick)
    } else {
      frame.current = 0
    }
  }, [])

  const run = React.useCallback(() => {
    if (frame.current) return
    clock.current = performance.now()
    frame.current = requestAnimationFrame(tick)
  }, [tick])

  /** Retarget. Whatever is already moving keeps its velocity. */
  const to = React.useCallback(
    (next: Values) => {
      target.current = { ...target.current, ...next }
      for (const key of Object.keys(next)) {
        if (current.current[key] === undefined) {
          current.current[key] = next[key]
          velocity.current[key] = 0
        }
      }
      run()
    },
    [run]
  )

  /**
   * Put the values somewhere directly. Pass `carry` to keep them moving as
   * they land there. That is what a remeasure needs, since the numbers change
   * meaning but the motion they describe does not.
   */
  const set = React.useCallback(
    (next: Values, carry?: Values) => {
      stop()
      current.current = { ...current.current, ...next }
      if (!carry) target.current = { ...target.current, ...next }
      for (const key of Object.keys(next)) {
        velocity.current[key] = carry?.[key] ?? 0
      }
      frameRef.current({ ...current.current })
    },
    [stop]
  )

  /** Where each value is right now, mid flight included. */
  const peek = React.useCallback(() => ({ ...current.current }), [])
  /** How fast each value is travelling, for carrying across a remeasure. */
  const speed = React.useCallback(() => ({ ...velocity.current }), [])

  React.useEffect(() => stop, [stop])

  return { to, set, peek, speed, stop }
}

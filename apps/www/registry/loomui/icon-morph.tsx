"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** Which pair of shapes the icon travels between. */
export type IconMorphSet = "menu" | "plus" | "play" | "chevron"

export interface IconMorphProps extends Omit<
  React.ComponentProps<"svg">,
  "children"
> {
  /** Which pair of shapes to morph between. */
  set?: IconMorphSet
  /** `false` shows the first shape, `true` the second. */
  active?: boolean
  /** Milliseconds for the morph. Set to `0` to turn it off. */
  duration?: number
  /** Stroke weight, in viewBox units. */
  strokeWidth?: number
}

/**
 * What each `set` travels between, and what `active` means.
 *
 * | set       | active false | active true |
 * | --------- | ------------ | ----------- |
 * | `menu`    | hamburger    | close       |
 * | `plus`    | plus         | close       |
 * | `play`    | play         | pause       |
 * | `chevron` | chevron      | tick        |
 */

/**
 * Shared by every piece that moves rather than reshapes. The duration is a
 * custom property set on the root, so one prop reaches every part without
 * being threaded through them.
 *
 * `motion-reduce:transition-none` is a class rather than an inline style on
 * purpose: an inline `transition` would outrank it and the escape would not
 * work.
 */
const SHIFT =
  "transition-[transform,opacity] ease-out-quart [transition-duration:var(--icon-morph-duration)] motion-reduce:transition-none"

/**
 * SVG transforms resolve against the viewBox once `transform-box` says so.
 * Firefox and Safari have both shipped a different initial value at some
 * point, so it is stated rather than assumed.
 */
function pose(
  origin: string,
  transform?: string,
  opacity?: number
): React.CSSProperties {
  return {
    transformBox: "view-box",
    transformOrigin: origin,
    transform: transform ?? "none",
    opacity,
  }
}

/**
 * Quartic ease out. `--ease-out-quart` is the cubic-bezier approximation of
 * this curve, so driving the tween with the curve itself keeps the reshaping
 * sets in step with the transforming ones.
 */
function easeOutQuart(t: number) {
  return 1 - (1 - t) ** 4
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setReduced(query.matches)
    read()
    query.addEventListener("change", read)
    return () => query.removeEventListener("change", read)
  }, [])

  return reduced
}

function round(value: number) {
  return Math.round(value * 1000) / 1000
}

/** Build an outline from its commands and a flat list of coordinates. */
function draw(commands: readonly string[], points: readonly number[]) {
  let at = 0
  let d = ""

  for (const command of commands) {
    if (command === "Z") {
      d += "Z"
      continue
    }
    // Rounded, or a tween writes fifteen decimal places into the DOM on every
    // frame. A 24px icon cannot see the third one.
    d += `${command}${round(points[at])} ${round(points[at + 1])}`
    at += 2
  }

  return d
}

// `from` and `to` are also SMIL attribute names on `path`, hence the omission.
interface MorphPathProps extends Omit<
  React.ComponentProps<"path">,
  "d" | "from" | "to"
> {
  /** The command letters, shared by both poses. */
  commands: readonly string[]
  /** Coordinates while inactive. */
  from: readonly number[]
  /** Coordinates while active. Same length, same order. */
  to: readonly number[]
  active: boolean
  duration: number
}

/**
 * Interpolates the outline itself, one coordinate at a time.
 *
 * The CSS `d` property does this declaratively and Safari does not implement
 * it, which on iOS means every browser, since they are all WebKit underneath.
 * Left to CSS, two of the four sets would cut instead of morph on every phone
 * ever made, and only on phones, which is the kind of bug that survives a long
 * time because it never reproduces on the machine it was written on.
 *
 * So the points are walked here and written to the `d` attribute, which every
 * engine has understood since SVG shipped. It costs a paint per frame on a
 * 24px icon, which is nothing, and it is the same cost in every browser rather
 * than a morph in some and a cut in others.
 */
function MorphPath({
  commands,
  from,
  to,
  active,
  duration,
  ...props
}: MorphPathProps) {
  const node = React.useRef<SVGPathElement>(null)
  const current = React.useRef<number[]>([...(active ? to : from)])
  const frame = React.useRef(0)
  const reduced = usePrefersReducedMotion()

  React.useEffect(() => {
    const target = active ? to : from
    const start = current.current.slice()

    const paint = (points: number[]) => {
      current.current = points
      node.current?.setAttribute("d", draw(commands, points))
    }

    if (reduced || duration <= 0) {
      paint([...target])
      return
    }

    const began = performance.now()
    const step = (now: number) => {
      const elapsed = Math.min((now - began) / duration, 1)
      const eased = easeOutQuart(elapsed)

      paint(start.map((value, i) => value + (target[i] - value) * eased))

      if (elapsed < 1) frame.current = requestAnimationFrame(step)
    }

    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [active, commands, duration, from, reduced, to])

  return <path ref={node} d={draw(commands, current.current)} {...props} />
}

interface PartProps {
  active: boolean
  duration: number
}

/** Three bars. The middle one is not needed by an X, so it leaves. */
function Menu({ active }: PartProps) {
  return (
    <>
      <path
        d="M4 6h16"
        className={SHIFT}
        style={pose(
          "12px 6px",
          active ? "translateY(6px) rotate(45deg)" : undefined
        )}
      />
      <path
        d="M4 12h16"
        className={SHIFT}
        style={pose(
          "12px 12px",
          active ? "scaleX(0.4)" : undefined,
          active ? 0 : 1
        )}
      />
      <path
        d="M4 18h16"
        className={SHIFT}
        style={pose(
          "12px 18px",
          active ? "translateY(-6px) rotate(-45deg)" : undefined
        )}
      />
    </>
  )
}

/** A plus is an X that has not been turned yet. Same two bars throughout. */
function Plus({ active }: PartProps) {
  const turn = active ? "rotate(45deg) scale(0.86)" : undefined

  return (
    <>
      <path d="M12 5v14" className={SHIFT} style={pose("12px 12px", turn)} />
      <path d="M5 12h14" className={SHIFT} style={pose("12px 12px", turn)} />
    </>
  )
}

/**
 * The triangle is cut down the middle so both states are two four-point
 * quadrilaterals, which is what lets the coordinates correspond. The right
 * half of the triangle is a quad with its two right-hand points on top of each
 * other, so it reads as the tip.
 *
 * Both halves live in one path, and that is not a tidiness choice. As two
 * elements the shared edge down the middle is a boundary each of them
 * antialiases against, and `currentColor` is rarely fully opaque, so the seam
 * shows until the triangle reads as the pause bars in disguise. One path is
 * one fill: the halves union and the join disappears.
 *
 * For the same reason there is no stroke. A stroke follows every edge of every
 * subpath, the two interior ones included, and paints them over a fill that is
 * already there.
 */
const BARS = ["M", "L", "L", "L", "Z", "M", "L", "L", "L", "Z"] as const
// prettier-ignore
const PLAY = [
  7.5, 4.5, 13.25, 8.25, 13.25, 15.75, 7.5, 19.5,
  13.25, 8.25, 19, 12, 19, 12, 13.25, 15.75,
] as const
// prettier-ignore
const PAUSE = [
  7, 4.5, 10.5, 4.5, 10.5, 19.5, 7, 19.5,
  13.5, 4.5, 17, 4.5, 17, 19.5, 13.5, 19.5,
] as const

function Play({ active, duration }: PartProps) {
  return (
    <MorphPath
      commands={BARS}
      from={PLAY}
      to={PAUSE}
      active={active}
      duration={duration}
      fill="currentColor"
      stroke="none"
    />
  )
}

/** Three points in both states, so one path covers the whole journey. */
const ARROW = ["M", "L", "L"] as const
const CHEVRON = [9, 5, 16, 12, 9, 19] as const
const TICK = [4, 12, 10, 18, 20, 6] as const

function Chevron({ active, duration }: PartProps) {
  return (
    <MorphPath
      commands={ARROW}
      from={CHEVRON}
      to={TICK}
      active={active}
      duration={duration}
    />
  )
}

const SETS: Record<IconMorphSet, (props: PartProps) => React.ReactNode> = {
  menu: Menu,
  plus: Plus,
  play: Play,
  chevron: Chevron,
}

/**
 * One icon that changes into another. The pieces are shared between the two
 * shapes and travel, so there is never a frame with both icons on screen at
 * once. Two legible glyphs on top of each other reads as a fault, which is
 * what a crossfade gives you.
 *
 * The icon is decorative by default. Put the label on whatever wraps it.
 */
export function IconMorph({
  set = "menu",
  active = false,
  duration = 220,
  strokeWidth = 2,
  className,
  style,
  ...props
}: IconMorphProps) {
  const Parts = SETS[set]

  return (
    <svg
      data-slot="icon-morph"
      data-active={active}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-6 shrink-0", className)}
      style={
        {
          "--icon-morph-duration": `${duration}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <Parts active={active} duration={duration} />
    </svg>
  )
}

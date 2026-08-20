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
 * Shared by every moving piece. The duration is a custom property set on the
 * root, so one prop reaches every part without being threaded through them.
 *
 * `motion-reduce:transition-none` is a class rather than an inline style on
 * purpose: an inline `transition` would outrank it and the escape would not
 * work.
 */
const MOTION =
  "ease-out-quart [transition-duration:var(--icon-morph-duration)] motion-reduce:transition-none"

/** Pieces whose story is rotation and travel. */
const SHIFT = cn("transition-[transform,opacity]", MOTION)
/** Pieces whose story is the outline itself changing. */
const RESHAPE = cn("transition-[d]", MOTION)

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
 * The CSS `d` property interpolates between two `path()` values as long as
 * they hold the same commands in the same order, which is what makes a real
 * morph possible without a path-interpolation library. It is a paint-level
 * property rather than a compositor one, which would matter on a large shape
 * and does not on a 24px icon.
 *
 * The `d` attribute carries the same value so a browser without the CSS
 * property still draws the right shape. It cuts rather than morphs there.
 */
function reshape(d: string) {
  return { d: `path("${d}")` } as React.CSSProperties
}

interface PartProps {
  active: boolean
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
 * quadrilaterals, which is what lets the outlines interpolate. The right half
 * of the triangle is a quad with its two right-hand points on top of each
 * other, so it reads as the tip.
 *
 * Both halves live in **one** path as two subpaths, and that is not a tidiness
 * choice. As two elements the shared edge down the middle of the triangle is a
 * boundary each of them antialiases against, and `currentColor` is usually not
 * fully opaque, so the seam shows and the triangle reads as the pause bars in
 * disguise. One path is one fill: the halves union, and the join disappears.
 *
 * For the same reason there is no stroke here. A stroke follows every edge of
 * every subpath, including the two interior ones, and paints them over a fill
 * that is already there.
 */
const PLAY =
  "M7.5 4.5L13.25 8.25L13.25 15.75L7.5 19.5ZM13.25 8.25L19 12L19 12L13.25 15.75Z"
const PAUSE =
  "M7 4.5L10.5 4.5L10.5 19.5L7 19.5ZM13.5 4.5L17 4.5L17 19.5L13.5 19.5Z"

function Play({ active }: PartProps) {
  const d = active ? PAUSE : PLAY

  return (
    <path
      d={d}
      fill="currentColor"
      stroke="none"
      className={RESHAPE}
      style={reshape(d)}
    />
  )
}

/** Three points in both states, so one path covers the whole journey. */
const CHEVRON = "M9 5L16 12L9 19"
const TICK = "M4 12L10 18L20 6"

function Chevron({ active }: PartProps) {
  const d = active ? TICK : CHEVRON

  return <path d={d} className={RESHAPE} style={reshape(d)} />
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
      <Parts active={active} />
    </svg>
  )
}

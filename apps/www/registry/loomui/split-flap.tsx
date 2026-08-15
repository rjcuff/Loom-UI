"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SplitFlapProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** The string the board settles on. Matched against the charset in caps. */
  value: string
  /** Every glyph a cell can show, in the order it flaps through them. */
  charset?: string
  /** Milliseconds per flap. One flap is also this long, so the board never gaps. */
  interval?: number
  /** Flaps of head start each cell gives the one after it. */
  stagger?: number
  /** Keep at least this many cells, so a shorter value does not resize the board. */
  padTo?: number
}

/** The glyphs a departure board actually carries, in board order. */
const DEFAULT_CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:'-?!"

export function SplitFlap({
  value,
  charset = DEFAULT_CHARSET,
  interval = 62,
  stagger = 2,
  padTo,
  className,
  ...props
}: SplitFlapProps) {
  const target = React.useMemo(() => {
    const text = value.toUpperCase()
    const width = Math.max(padTo ?? 0, text.length)
    return text.padEnd(width, " ").split("")
  }, [value, padTo])

  const blank = charset[0] ?? " "
  const charsRef = React.useRef<string[]>(target.map(() => blank))
  const [chars, setChars] = React.useState(charsRef.current)

  // The half falling away carries the glyph from the previous commit, so the
  // flap has something to show on its way out. Read during render, written
  // after it, which is the only ordering that gives the outgoing face.
  const previousRef = React.useRef(chars)
  const previous = previousRef.current
  React.useEffect(() => {
    previousRef.current = chars
  }, [chars])

  React.useEffect(() => {
    const commit = (next: string[]) => {
      charsRef.current = next
      setChars(next)
    }

    // A board that grew gets blank cells to flap up from rather than popping.
    const from = target.map((_, index) => charsRef.current[index] ?? blank)

    // Flaps forward through the charset, per cell. A cell whose target is not
    // in the charset takes none and is set outright.
    const steps = from.map((char, index) => {
      const start = charset.indexOf(char)
      const end = charset.indexOf(target[index])
      if (start < 0 || end < 0) {
        return 0
      }
      return (end - start + charset.length) % charset.length
    })

    const total = steps.reduce(
      (longest, count, index) =>
        count > 0 ? Math.max(longest, count + index * stagger) : longest,
      0
    )

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (reduced || total === 0) {
      commit(target)
      return
    }

    // Cells with nothing to flap land now instead of waiting out the stagger.
    commit(
      from.map((char, index) => (steps[index] === 0 ? target[index] : char))
    )

    let tick = 0
    const timer = window.setInterval(() => {
      tick += 1
      commit(
        target.map((char, index) => {
          const count = steps[index]
          if (count === 0) {
            return char
          }
          const start = charset.indexOf(from[index])
          const walked = Math.min(Math.max(tick - index * stagger, 0), count)
          return charset[(start + walked) % charset.length]
        })
      )
      if (tick >= total) {
        window.clearInterval(timer)
      }
    }, interval)

    return () => window.clearInterval(timer)
  }, [target, charset, interval, stagger, blank])

  return (
    <div
      data-slot="split-flap"
      // One image with one name. Reading the cells out would spell the value a
      // letter at a time, and mid-flap it would spell nonsense.
      role="img"
      aria-label={value}
      className={cn(
        "inline-flex flex-wrap gap-[0.1em] font-mono text-[2rem] leading-none tabular-nums select-none",
        className
      )}
      {...props}
    >
      {chars.map((char, index) => (
        <span
          key={index}
          data-slot="split-flap-cell"
          className="bg-card text-card-foreground relative block h-[1.3em] w-[0.86em] overflow-hidden rounded-[0.08em] border shadow-xs"
          style={
            {
              perspective: "10em",
              "--flap-duration": `${interval}ms`,
            } as React.CSSProperties
          }
        >
          {/* Settled halves. The top already carries the new glyph and the
              bottom still carries the old one; the two flaps cover the swap. */}
          <Half char={char} side="top" />
          <Half char={previous[index] ?? char} side="bottom" />

          {/* Keyed on the glyph so a new character remounts the flaps and the
              animations restart. Nothing else re-triggers a CSS animation. */}
          <React.Fragment key={char}>
            <Half char={previous[index] ?? char} side="top" flap />
            <Half char={char} side="bottom" flap />
          </React.Fragment>

          {/* The hinge. Without the seam the cell reads as a fade, not a flap. */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-black/20 dark:bg-black/50"
          />
        </span>
      ))}
    </div>
  )
}

function Half({
  char,
  side,
  flap,
}: {
  char: string
  side: "top" | "bottom"
  flap?: boolean
}) {
  const top = side === "top"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "absolute inset-x-0 h-1/2 overflow-hidden [backface-visibility:hidden]",
        top ? "top-0" : "bottom-0",
        flap && "bg-card z-10 motion-reduce:animate-none",
        flap &&
          (top
            ? "animate-split-flap-out origin-bottom"
            : "animate-split-flap-in origin-top")
      )}
    >
      {/* A full-height glyph box pinned to this half's outer edge, so both
          halves clip the same letter along the same line. */}
      <span
        className={cn(
          "absolute inset-x-0 flex h-[200%] items-center justify-center",
          top ? "top-0" : "bottom-0"
        )}
      >
        {char === " " ? " " : char}
      </span>
    </span>
  )
}

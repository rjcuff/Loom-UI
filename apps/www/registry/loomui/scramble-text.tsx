"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ScrambleTextProps extends Omit<
  React.ComponentProps<"span">,
  "children"
> {
  /** The string the run resolves to. */
  text: string
  /** Glyphs drawn in a slot that has not settled yet. */
  characters?: string
  /** Milliseconds per scramble frame. */
  speed?: number
  /** Frames a slot scrambles before it settles. */
  cycles?: number
  /** Frames between one slot settling and the next. */
  stagger?: number
  /** What starts a run. `hover` starts a fresh one on every enter. */
  trigger?: "mount" | "view" | "hover"
  /** Render the finished text with no scramble. */
  disabled?: boolean
}

const DEFAULT_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@*<>/"

// `useEffect` would let the finished text paint for a frame before the first
// scramble frame replaced it, and `useLayoutEffect` alone warns during SSR.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

export function ScrambleText({
  text,
  characters = DEFAULT_CHARACTERS,
  speed = 45,
  cycles = 8,
  stagger = 2,
  trigger = "mount",
  disabled = false,
  className,
  ...props
}: ScrambleTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null)

  // The first render is the finished text, so the server and the client agree
  // and the component degrades to plain text without JavaScript.
  const [display, setDisplay] = React.useState(text)
  const [run, setRun] = React.useState(0)

  const start = React.useCallback(() => setRun((value) => value + 1), [])

  React.useEffect(() => {
    if (trigger === "mount") {
      start()
      return
    }
    if (trigger !== "view") {
      return
    }

    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start()
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [trigger, text, start])

  useIsomorphicLayoutEffect(() => {
    if (run === 0) {
      return
    }
    if (
      disabled ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(text)
      return
    }

    const slots = Array.from(text)
    const pool = characters.length > 0 ? characters : DEFAULT_CHARACTERS
    const last = (slots.length - 1) * stagger + cycles
    let frame = 0

    const draw = () => {
      setDisplay(
        slots
          .map((slot, index) => {
            // Whitespace never scrambles. Word boundaries are what makes a
            // half-resolved line still read as a line.
            if (slot.trim() === "") {
              return slot
            }
            if (frame >= index * stagger + cycles) {
              return slot
            }
            return pool[Math.floor(Math.random() * pool.length)]
          })
          .join("")
      )
    }

    draw()
    const timer = setInterval(() => {
      frame += 1
      draw()
      if (frame >= last) {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [run, text, characters, speed, cycles, stagger, disabled])

  return (
    <span
      ref={ref}
      data-slot="scramble-text"
      onPointerEnter={trigger === "hover" ? start : undefined}
      className={cn("inline-grid", className)}
      {...props}
    >
      {/* The finished text reserves the width, so a run cannot reflow what is
          sitting next to it. */}
      <span
        aria-hidden="true"
        className="invisible col-start-1 row-start-1 whitespace-pre"
      >
        {text}
      </span>
      {/* Announcing every frame would be noise, so the real string is read
          once and the scramble itself is decoration. */}
      <span className="sr-only">{text}</span>
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 whitespace-pre"
      >
        {display}
      </span>
    </span>
  )
}

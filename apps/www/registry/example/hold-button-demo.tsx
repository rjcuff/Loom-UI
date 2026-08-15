"use client"

import * as React from "react"

import { HoldButton } from "@/registry/loomui/hold-button"

/** How long the confirmation sits there before the button is offered again. */
const CONFIRM_MS = 1500
/** Exits run shorter than entrances: leaving should not be dwelt on. */
const EXIT_MS = 180
const ENTER_MS = 260
/**
 * The incoming half starts before the outgoing one is gone. A clean gap
 * between them reads as a stall; an overlap reads as one thing becoming
 * another.
 */
const ENTER_DELAY = 90

/**
 * Both halves share one grid cell, so the swap never moves anything around
 * it. Only opacity and transform animate, and both directions are eased out,
 * since each half is entering or leaving rather than moving on screen.
 * `will-change` promotes each half to its own layer up front, so the first
 * frame of the swap is not spent rasterising.
 */
const SWAP =
  "col-start-1 row-start-1 will-change-[opacity,transform] transition-[opacity,transform] ease-[var(--ease-out-quart)] motion-reduce:transition-none"

export default function HoldButtonDemo() {
  const [done, setDone] = React.useState(false)
  const button = React.useRef<HTMLButtonElement>(null)
  const hadFocus = React.useRef(false)
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([])

  React.useEffect(
    () => () => timers.current.forEach((timer) => clearTimeout(timer)),
    []
  )

  const handleHold = () => {
    // A keyboard user held this with Space. Hand focus back when it returns,
    // or the swap quietly drops them on the body.
    hadFocus.current = document.activeElement === button.current
    setDone(true)

    timers.current = [
      setTimeout(() => setDone(false), CONFIRM_MS),
      setTimeout(
        () => {
          if (hadFocus.current) {
            // Focusing scrolls by default, which yanks the page mid-swap.
            button.current?.focus({ preventScroll: true })
          }
        },
        CONFIRM_MS + ENTER_DELAY + ENTER_MS
      ),
    ]
  }

  return (
    <div className="grid place-items-center">
      {/* The button half moves and fades but does not scale. The button
          already runs its own scale as the press is released, and a second
          scale on top of it, on a different clock, is what made the swap
          wobble. */}
      <span
        className={`${SWAP} ${
          done
            ? "-translate-y-1 opacity-0"
            : "translate-y-0 opacity-100 delay-[90ms]"
        }`}
        style={{ transitionDuration: `${done ? EXIT_MS : ENTER_MS}ms` }}
      >
        <HoldButton
          ref={button}
          duration={1100}
          onHold={handleHold}
          color="color-mix(in oklch, var(--destructive) 22%, transparent)"
          className="text-destructive px-4 py-2 text-sm font-medium"
          tabIndex={done ? -1 : undefined}
          inert={done}
        >
          Hold to delete
        </HoldButton>
      </span>

      <span
        aria-hidden="true"
        className={`${SWAP} text-muted-foreground pointer-events-none flex items-center gap-2 text-sm ${
          done
            ? "translate-y-0 scale-100 opacity-100 delay-[90ms]"
            : "translate-y-1.5 scale-[0.98] opacity-0"
        }`}
        style={{ transitionDuration: `${done ? ENTER_MS : EXIT_MS}ms` }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent size-4"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Successfully deleted
      </span>

      {/* The visible confirmation is decoration on a swap; this is the part a
          screen reader is told about, and only when it changes. */}
      <span role="status" className="sr-only">
        {done ? "Successfully deleted" : ""}
      </span>
    </div>
  )
}

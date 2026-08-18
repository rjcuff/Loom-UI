"use client"

import * as React from "react"

import { HoldButton } from "@/registry/loomui/hold-button"

const CONFIRM_MS = 1500
/** Exits run shorter than entrances. */
const EXIT_MS = 150
const ENTER_MS = 200
/** Enough that the two are never both half there, smearing together. */
const ENTER_DELAY = 120

/** One grid cell for both halves, so the swap is opacity and nothing else. */
const SWAP =
  "col-start-1 row-start-1 will-change-[opacity] transition-opacity ease-[var(--ease-out-quart)] motion-reduce:transition-none"

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
    // Held with Space? Hand focus back, or the swap drops them on the body.
    hadFocus.current = document.activeElement === button.current
    setDone(true)

    timers.current = [
      setTimeout(() => setDone(false), CONFIRM_MS),
      setTimeout(
        () => {
          // Focusing scrolls by default, which yanks the page mid swap.
          if (hadFocus.current) button.current?.focus({ preventScroll: true })
        },
        CONFIRM_MS + ENTER_DELAY + ENTER_MS
      ),
    ]
  }

  return (
    <div className="grid place-items-center">
      <span
        className={`${SWAP} ${done ? "opacity-0" : "opacity-100 delay-[120ms]"}`}
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
          done ? "opacity-100 delay-[120ms]" : "opacity-0"
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
        Gone. No takebacks
      </span>

      {/* The visible half is decoration. This is what is announced. */}
      <span role="status" className="sr-only">
        {done ? "Deleted" : ""}
      </span>
    </div>
  )
}

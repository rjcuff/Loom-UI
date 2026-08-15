"use client"

import * as React from "react"

import { HoldButton } from "@/registry/loomui/hold-button"

/** How long the check sits there before the button offers the action again. */
const RESET_MS = 1600

/** Both faces share one grid cell, so the button never changes width. */
const FACE =
  "col-start-1 row-start-1 transition-all duration-200 ease-[var(--ease-out-quart)] motion-reduce:transition-none"

export default function HoldButtonDemo() {
  const [done, setDone] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const handleHold = () => {
    setDone(true)
    timer.current = setTimeout(() => setDone(false), RESET_MS)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <HoldButton
        duration={1100}
        onHold={handleHold}
        color="color-mix(in oklch, var(--destructive) 22%, transparent)"
        className="text-destructive px-4 py-2 text-sm font-medium"
      >
        <span className="grid">
          {/* The label leaves before the check arrives, so the two never
              cross-fade through each other into a smudge. */}
          <span
            className={`${FACE} ${done ? "scale-90 opacity-0" : "scale-100 opacity-100 delay-150"}`}
          >
            Hold to delete
          </span>

          <span
            className={`${FACE} grid place-items-center ${
              done ? "scale-100 opacity-100 delay-150" : "scale-90 opacity-0"
            }`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
        </span>
      </HoldButton>

      <p className="text-muted-foreground text-xs" aria-live="polite">
        {done ? "Nothing was really deleted" : "Press and keep holding"}
      </p>
    </div>
  )
}

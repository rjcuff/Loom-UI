"use client"

import * as React from "react"

import { Spool, SpoolItem } from "@/registry/loomui/spool"

const STATES = ["idle", "playing", "saved"]
const DWELL = 2600

/** Five bars on five clocks, so the meter never pulses as one block. */
function Meter() {
  return (
    <span aria-hidden="true" className="flex items-end gap-[3px]">
      {[0.9, 1.4, 0.7, 1.2, 1].map((rate, index) => (
        <span
          key={index}
          className="bg-accent animate-spool-meter h-3.5 w-[3px] rounded-full"
          style={{
            animationDuration: `${rate}s`,
            animationDelay: `${index * -0.31}s`,
          }}
        />
      ))}
    </span>
  )
}

export default function SpoolDemo() {
  const [index, setIndex] = React.useState(0)
  const value = STATES[index]

  const advance = React.useCallback(
    () => setIndex((current) => (current + 1) % STATES.length),
    []
  )

  React.useEffect(() => {
    const timer = window.setInterval(advance, DWELL)
    return () => window.clearInterval(timer)
  }, [advance])

  return (
    <div className="flex flex-col items-center gap-4">
      <Spool
        value={value}
        role="button"
        tabIndex={0}
        aria-label="Next state"
        onClick={advance}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            advance()
          }
        }}
        className="focus-visible:ring-ring/60 cursor-pointer focus-visible:ring-2 focus-visible:outline-none"
      >
        <SpoolItem value="idle">
          <span className="bg-muted-foreground/40 size-2 rounded-full" />
          <span className="text-sm font-medium">Idle, and smug about it</span>
        </SpoolItem>

        <SpoolItem value="playing" className="gap-3 pr-5">
          <span className="bg-accent/15 text-accent grid size-6 place-items-center rounded-full">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="size-2.5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="font-mono text-sm">shuttle.mp3</span>
          <Meter />
        </SpoolItem>

        <SpoolItem value="saved">
          <span className="bg-accent/15 text-accent grid size-5 place-items-center rounded-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-2.5"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <span className="text-sm font-medium">Saved</span>
        </SpoolItem>
      </Spool>

      <p className="text-muted-foreground text-xs">
        Impatient? Click it mid-morph.
      </p>
    </div>
  )
}

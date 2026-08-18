"use client"

import * as React from "react"

import { Spool, SpoolItem } from "@/registry/loomui/spool"

const STATES = ["idle", "playing", "saved"] as const

const BUTTON =
  "border-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/60 inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ease focus-visible:ring-2 focus-visible:outline-none active:scale-[0.97]"

/** Five bars on five clocks, so the meter never pulses as one block. */
function Meter() {
  return (
    <span aria-hidden="true" className="flex items-end gap-[3px]">
      {[0.9, 1.4, 0.7, 1.2, 1].map((rate, index) => (
        <span
          key={index}
          className="bg-accent animate-spool-meter w-[3px] rounded-full"
          style={{
            height: "0.9rem",
            animationDuration: `${rate}s`,
            animationDelay: `${index * -0.31}s`,
          }}
        />
      ))}
    </span>
  )
}

export default function SpoolDemo() {
  const [value, setValue] = React.useState<string>("idle")

  return (
    <div className="flex flex-col items-center gap-7">
      <Spool value={value}>
        <SpoolItem value="idle">
          <span className="bg-muted-foreground/40 size-2 rounded-full" />
          <span className="text-sm font-medium">Weaving</span>
        </SpoolItem>

        <SpoolItem value="playing" className="gap-3 pr-5">
          <span className="bg-accent/15 text-accent grid size-6 place-items-center rounded-full text-[0.6rem]">
            ▶
          </span>
          <span className="font-mono text-sm">shuttle.mp3</span>
          <Meter />
        </SpoolItem>

        <SpoolItem value="saved">
          <span className="bg-accent/15 text-accent grid size-5 place-items-center rounded-full text-[0.65rem]">
            ✓
          </span>
          <span className="text-sm font-medium">Saved</span>
        </SpoolItem>
      </Spool>

      <div className="flex gap-2">
        {STATES.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => setValue(state)}
            data-active={value === state ? "" : undefined}
            className={`${BUTTON} data-active:border-accent/50 data-active:text-accent`}
          >
            {state}
          </button>
        ))}
      </div>
    </div>
  )
}

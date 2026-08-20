"use client"

import * as React from "react"

import { IconMorph, type IconMorphSet } from "@/registry/loomui/icon-morph"

const SETS: { set: IconMorphSet; off: string; on: string }[] = [
  { set: "menu", off: "Open menu", on: "Close menu" },
  { set: "plus", off: "Add thread", on: "Cancel" },
  { set: "play", off: "Play", on: "Pause" },
  { set: "chevron", off: "Continue", on: "Done" },
]

export default function IconMorphDemo() {
  const [active, setActive] = React.useState<Record<string, boolean>>({})

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        {SETS.map(({ set, off, on }) => (
          <button
            key={set}
            type="button"
            aria-pressed={active[set] ?? false}
            aria-label={active[set] ? on : off}
            onClick={() =>
              setActive((current) => ({ ...current, [set]: !current[set] }))
            }
            className="ease-out-quart text-foreground/70 hover:text-foreground flex size-11 items-center justify-center transition-colors duration-180"
          >
            <IconMorph set={set} active={active[set] ?? false} />
          </button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        One shape the whole way. Nothing crossfades.
      </p>
    </div>
  )
}

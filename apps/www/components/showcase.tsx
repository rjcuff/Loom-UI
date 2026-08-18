"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { GridBeams } from "@/registry/loomui/grid-beams"
import { LoomLoader } from "@/registry/loomui/loom-loader"
import { SplitFlap } from "@/registry/loomui/split-flap"
import { Spool, SpoolItem } from "@/registry/loomui/spool"
import { Typewriter } from "@/registry/loomui/typewriter"
import { WeaveText } from "@/registry/loomui/weave-text"

const BOARD = ["LISBON", "OSAKA", "REYKJAVIK", "MONTREAL"]
const SPOOL_STATES = ["idle", "playing", "saved"]

/** Advances an index on an interval, and stops while the tab is hidden. */
function useCycle(length: number, every: number) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % length),
      every
    )
    return () => window.clearInterval(timer)
  }, [length, every])

  return index
}

function BoardPreview() {
  const index = useCycle(BOARD.length, 3200)
  return <SplitFlap value={BOARD[index]} padTo={9} />
}

function SpoolPreview() {
  const value = SPOOL_STATES[useCycle(SPOOL_STATES.length, 2400)]

  return (
    <Spool value={value}>
      <SpoolItem value="idle">
        <span className="bg-muted-foreground/40 size-2 rounded-full" />
        <span className="text-sm font-medium">Idle</span>
      </SpoolItem>
      <SpoolItem value="playing" className="pr-5">
        <span className="bg-accent/15 text-accent grid size-5 place-items-center rounded-full text-[0.6rem]">
          ▶
        </span>
        <span className="font-mono text-sm">shuttle.mp3</span>
      </SpoolItem>
      <SpoolItem value="saved">
        <span className="bg-accent/15 text-accent grid size-5 place-items-center rounded-full text-[0.65rem]">
          ✓
        </span>
        <span className="text-sm font-medium">Saved</span>
      </SpoolItem>
    </Spool>
  )
}

const PIECES = [
  {
    name: "Spool",
    href: "/docs/components/spool",
    line: "Changes shape to fit what it holds.",
    render: () => <SpoolPreview />,
  },
  {
    name: "Split Flap",
    href: "/docs/components/split-flap",
    line: "Every character flips on its own timing.",
    render: () => <BoardPreview />,
  },
  {
    name: "Weave Text",
    href: "/docs/components/weave-text",
    line: "A gradient with no seam at the loop.",
    render: () => (
      <span className="text-3xl font-semibold tracking-tight sm:text-4xl">
        <WeaveText>Threaded</WeaveText>
      </span>
    ),
  },
  {
    name: "Loom Loader",
    href: "/docs/components/loom-loader",
    line: "Warp threads down, shuttle across.",
    render: () => <LoomLoader className="size-16" />,
  },
  {
    name: "Grid Beams",
    href: "/docs/components/grid-beams",
    line: "Light running the lines of a grid.",
    render: () => <GridBeams cellSize={34} beams={6} length="40%" />,
  },
  {
    name: "Typewriter",
    href: "/docs/components/typewriter",
    line: "Types, waits, deletes, goes again.",
    render: () => (
      <span className="font-mono text-xl sm:text-2xl">
        <Typewriter words={["ships today", "no runtime", "one file"]} />
      </span>
    ),
  },
]

/**
 * Six pieces, each running on its own, each a link to its page. No entrance on
 * scroll: the tiles are the argument, and something that has to arrive before
 * it can be read is a worse argument.
 */
export function Showcase() {
  return (
    <section className="border-border/60 border-t">
      <div className="mx-auto w-full max-w-5xl px-5 py-20 sm:py-24">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Six of them, running right now
          </h2>
          <p className="text-muted-foreground mt-3 text-pretty">
            Nothing here is a screenshot. Pick one and the whole thing is a
            single file you paste into your project.
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PIECES.map((piece) => (
            <li key={piece.name}>
              <Link
                href={piece.href}
                className={cn(
                  "group border-border bg-surface/40 focus-visible:ring-ring/60 block overflow-hidden rounded-xl border",
                  "focus-visible:ring-2 focus-visible:outline-none",
                  // Hover only where there is a real pointer, on `ease`, and
                  // quick. It is a hover, not an entrance.
                  "ease transition-[transform,border-color] duration-200",
                  "hover:border-muted-foreground/40 hover:-translate-y-0.5",
                  "motion-reduce:transition-none"
                )}
              >
                {/* Relative and clipping, so a piece that fills the cell has
                    a box to fill and an edge to be cut off at. */}
                <div className="relative grid h-44 place-items-center overflow-hidden px-4">
                  {piece.render()}
                </div>

                <div className="border-border/60 border-t px-4 py-3 text-center">
                  <div className="text-sm font-medium">{piece.name}</div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {piece.line}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="/docs/components"
            className="text-muted-foreground hover:text-foreground ease text-sm underline underline-offset-4 transition-colors duration-150"
          >
            All 41 of them
          </Link>
        </div>
      </div>
    </section>
  )
}

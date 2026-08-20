"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { ChartRange } from "@/registry/lib/chart-frame"
import { BentoCard, BentoGrid } from "@/registry/loomui/bento-grid"
import { CountUp } from "@/registry/loomui/count-up"
import { ElasticTabs } from "@/registry/loomui/elastic-tabs"
import { FunnelRows } from "@/registry/loomui/funnel-rows"
import { GaugeArc } from "@/registry/loomui/gauge-arc"
import { IconMorph } from "@/registry/loomui/icon-morph"
import { ProgressRing } from "@/registry/loomui/progress-ring"
import { ScrambleText } from "@/registry/loomui/scramble-text"
import { SplitFlap } from "@/registry/loomui/split-flap"
import { Spool, SpoolItem } from "@/registry/loomui/spool"
import {
  Terminal,
  TerminalCommand,
  TerminalOutput,
} from "@/registry/loomui/terminal"
import { TrendStack } from "@/registry/loomui/trend-stack"
import { Typewriter } from "@/registry/loomui/typewriter"

const BOARD = ["LISBON", "OSAKA", "REYKJAVIK", "MONTREAL"]
const RING = [20, 64, 38, 92]
const TALLY = [48291, 1204, 99640]
const SPOOL_STATES = ["idle", "playing", "saved"]
const SCRAMBLE = ["Woven in place", "One file, yours", "No runtime"]

/** Advances an index on an interval. */
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

/** The mark printed beside a finished step. */
function Tick() {
  return (
    <IconMorph
      set="chevron"
      active
      className="text-accent inline-block size-3 align-[-1px]"
    />
  )
}

/** The caption under a tile. The component itself is the argument above it. */
function Caption({ name, line }: { name: string; line: string }) {
  return (
    <div className="mt-4">
      <div className="text-sm leading-none font-medium">{name}</div>
      <p className="text-muted-foreground mt-1.5 text-xs">{line}</p>
    </div>
  )
}

/**
 * A tile. The preview fills what is left after the caption, and clips, so a
 * piece bigger than its cell is cut off at the edge rather than pushing the
 * grid around.
 */
function Tile({
  name,
  line,
  href,
  children,
  className,
  frame = true,
}: {
  name: string
  line: string
  href: string
  children: React.ReactNode
  className?: string
  /** Off for a piece that brings its own card. */
  frame?: boolean
}) {
  return (
    <BentoCard className={cn("p-0", className)}>
      <Link
        href={href}
        aria-label={name}
        className="focus-visible:ring-ring/60 flex h-full flex-col p-5 focus-visible:ring-2 focus-visible:outline-none"
      >
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden",
            frame && "grid place-items-center"
          )}
        >
          {children}
        </div>
        <Caption name={name} line={line} />
      </Link>
    </BentoCard>
  )
}

function BoardPreview() {
  return <SplitFlap value={BOARD[useCycle(BOARD.length, 3200)]} padTo={9} />
}

function RingPreview() {
  return (
    <ProgressRing
      value={RING[useCycle(RING.length, 1900)]}
      size={96}
      label="Threads wound"
    />
  )
}

// Runs once and stops, so the key remounts it to run again.
function ScramblePreview() {
  const index = useCycle(SCRAMBLE.length, 3400)
  return (
    <ScrambleText
      key={index}
      text={SCRAMBLE[index]}
      className="text-xl font-semibold tracking-tight"
    />
  )
}

function TallyPreview() {
  const index = useCycle(TALLY.length, 3000)
  return (
    <CountUp
      key={index}
      value={TALLY[index]}
      className="text-3xl font-semibold tracking-tight tabular-nums"
    />
  )
}

function MorphPreview() {
  const on = useCycle(2, 1400) === 1
  return (
    <div className="text-foreground/80 flex items-center gap-5">
      <IconMorph set="menu" active={on} className="size-7" />
      <IconMorph set="play" active={on} className="size-7" />
      <IconMorph set="plus" active={on} className="size-7" />
      <IconMorph set="chevron" active={on} className="size-7" />
    </div>
  )
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
        <span className="bg-accent/15 text-accent grid size-5 place-items-center rounded-full">
          <IconMorph set="play" className="size-3" />
        </span>
        <span className="font-mono text-sm">shuttle.mp3</span>
      </SpoolItem>
      <SpoolItem value="saved">
        <span className="bg-accent/15 text-accent grid size-5 place-items-center rounded-full">
          <IconMorph set="chevron" active className="size-3" />
        </span>
        <span className="text-sm font-medium">Saved</span>
      </SpoolItem>
    </Spool>
  )
}

const TREND = [
  { name: "Edge", values: [3420, 3990, 4270, 4640, 4910, 5330, 5840] },
  { name: "Origin", values: [2180, 2290, 2510, 2660, 2880, 2990, 3410] },
  { name: "Cache miss", values: [860, 1020, 1110, 1230, 1180, 1290, 1380] },
]

const FUNNEL = [
  { name: "Invited", value: 2840 },
  { name: "Opened", value: 1960 },
  { name: "Started", value: 1180 },
  { name: "Finished", value: 640 },
]

const SOURCES = [
  { name: "Search", value: 4820 },
  { name: "Direct", value: 2140 },
  { name: "Social", value: 1360 },
  { name: "Newsletter", value: 890 },
]

/**
 * The grid under the marquee. Everything here runs on its own clock, which is
 * why it is here and not on the row above: nothing in this grid is being
 * translated while it animates.
 */
export function Showcase() {
  return (
    <section aria-label="Components, running">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:pb-24">
        <BentoGrid className="sm:grid-cols-4">
          <Tile
            name="Trend Stack"
            line="Stacked series, revealed left to right."
            href="/docs/components/trend-stack"
            frame={false}
            className="sm:col-span-2 sm:row-span-2"
          >
            <TrendStack
              className="h-full border-0 bg-transparent p-0"
              series={TREND}
              labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]}
              label="Requests served"
              delta={11.4}
              range={<ChartRange>Last quarter</ChartRange>}
            />
          </Tile>

          <Tile
            name="Gauge Arc"
            line="One hand goes round the dial."
            href="/docs/components/gauge-arc"
            frame={false}
            className="sm:col-span-2 sm:row-span-2"
          >
            <GaugeArc
              className="h-full border-0 bg-transparent p-0"
              segments={SOURCES}
              label="Sessions by source"
              delta={6.7}
              range={<ChartRange>Last 30 days</ChartRange>}
            />
          </Tile>

          <Tile
            name="Spool"
            line="Changes shape to fit what it holds."
            href="/docs/components/spool"
            className="sm:col-span-2"
          >
            <SpoolPreview />
          </Tile>

          <Tile
            name="Count Up"
            line="Numbers that arrive rather than appear."
            href="/docs/components/count-up"
          >
            <TallyPreview />
          </Tile>

          <Tile
            name="Progress Ring"
            line="Springs to the number, never restarts."
            href="/docs/components/progress-ring"
          >
            <RingPreview />
          </Tile>

          <Tile
            name="Split Flap"
            line="Every character flips on its own timing."
            href="/docs/components/split-flap"
            className="sm:col-span-2"
          >
            <BoardPreview />
          </Tile>

          <Tile
            name="Icon Morph"
            line="One shape the whole way. Nothing crossfades."
            href="/docs/components/icon-morph"
            className="sm:col-span-2"
          >
            <MorphPreview />
          </Tile>

          <Tile
            name="Funnel Rows"
            line="Each bar as long as its share of the first."
            href="/docs/components/funnel-rows"
            frame={false}
            className="sm:col-span-2 sm:row-span-2"
          >
            <FunnelRows
              className="h-full border-0 bg-transparent p-0"
              stages={FUNNEL}
              label="Onboarding"
              delta={-1.8}
            />
          </Tile>

          <Tile
            name="Terminal"
            line="Types its commands, then prints the answer."
            href="/docs/components/terminal"
            frame={false}
            className="sm:col-span-2 sm:row-span-2"
          >
            <Terminal title="~/acme-app" className="h-full">
              <TerminalCommand>
                npx shadcn@latest add @loomui/gauge-arc
              </TerminalCommand>
              <TerminalOutput delay={420}>
                Checking registry at loomui.design
              </TerminalOutput>
              <TerminalOutput delay={320}>
                <Tick /> Installed gauge-arc.tsx
              </TerminalOutput>
              <TerminalOutput delay={220}>
                <Tick /> Installed chart-frame.tsx
              </TerminalOutput>
              <TerminalOutput delay={220}>
                <Tick /> Updated app/globals.css
              </TerminalOutput>
              <TerminalCommand>pnpm dev</TerminalCommand>
              <TerminalOutput delay={380}>
                ready on http://localhost:3000
              </TerminalOutput>
            </Terminal>
          </Tile>

          <Tile
            name="Scramble Text"
            line="Resolves out of noise, left to right."
            href="/docs/components/scramble-text"
            className="sm:col-span-2"
          >
            <ScramblePreview />
          </Tile>

          <Tile
            name="Typewriter"
            line="Types and deletes, with no layout shift."
            href="/docs/components/typewriter"
            className="sm:col-span-2"
          >
            <span className="text-xl font-semibold tracking-tight">
              <Typewriter
                words={["Copy it in.", "Own the file.", "Ship it."]}
              />
            </span>
          </Tile>
        </BentoGrid>
      </div>
    </section>
  )
}

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
import { TestimonialWall } from "@/registry/loomui/testimonial-wall"
import { TrendStack } from "@/registry/loomui/trend-stack"
import { Typewriter } from "@/registry/loomui/typewriter"

const BOARD = ["LISBON", "OSAKA", "REYKJAVIK", "MONTREAL"]
const RING = [20, 64, 38, 92]
const TALLY = [48291, 1204, 99640]
const SPOOL_STATES = ["idle", "playing", "saved"]
const SCRAMBLE = ["Woven in place", "One file, yours", "No runtime"]

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

/** Matches the `sm` the grid lays itself out on, so the two cannot drift. */
function useSmallScreen() {
  const [small, setSmall] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)")
    const read = () => setSmall(query.matches)
    read()
    query.addEventListener("change", read)
    return () => query.removeEventListener("change", read)
  }, [])

  return small
}

function Caption({ name, line }: { name: string; line: string }) {
  return (
    <div className="mt-4">
      <div className="text-sm leading-none font-medium">{name}</div>
      <p className="text-muted-foreground mt-1.5 text-xs">{line}</p>
    </div>
  )
}

/** Preview fills what is left after the caption, and clips. */
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
        className="focus-visible:ring-ring/60 flex h-full flex-col focus-visible:ring-2 focus-visible:outline-none"
      >
        {/* A piece with its own card gets nearly the whole tile: it is
            already padded, and stacking the tile's on top inset it twice.
            Tighter on the left than the right, because the last x-axis label
            is centred on the plot's right edge and hangs past it. */}
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-hidden",
            frame ? "grid place-items-center p-5 pb-0" : "pt-3 pr-4 pl-2"
          )}
        >
          {children}
        </div>
        <div className="px-5 pb-5">
          <Caption name={name} line={line} />
        </div>
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
    // No shadow: the tile is already a card, and a second one under the pill
    // reads as a layer that is not there.
    <Spool value={value} className="shadow-none">
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

const QUOTES = [
  {
    name: "Ada",
    handle: "@ada",
    body: "Shipped the landing page in an afternoon.",
  },
  {
    name: "Ren",
    handle: "@ren",
    body: "Motion I can hand to a designer without a meeting.",
  },
  {
    name: "Kofi",
    handle: "@kofi",
    body: "The off switch is the reason I kept it.",
  },
  {
    name: "Mira",
    handle: "@mira",
    body: "Reads like code I would have written myself.",
  },
  {
    name: "Otto",
    handle: "@otto",
    body: "One file. No package to babysit for a year.",
  },
  {
    name: "Suki",
    handle: "@suki",
    body: "Reduced motion was already handled.",
  },
  {
    name: "Iris",
    handle: "@iris",
    body: "Every timing I wanted to change was a prop.",
  },
  {
    name: "Bo",
    handle: "@bo",
    body: "Dark mode looked right on the first try.",
  },
]

const SOURCES = [
  { name: "Search", value: 4820 },
  { name: "Direct", value: 2140 },
  { name: "Social", value: 1360 },
  { name: "Newsletter", value: 890 },
]

export function Showcase() {
  const small = useSmallScreen()

  return (
    <section aria-labelledby="showcase-heading">
      <div className="mx-auto w-full max-w-6xl px-5 pb-20 sm:pb-24">
        {/* The tiles are the argument, so the heading is not drawn. It is
            still a heading: the section had only an `aria-label`, which names
            a region without placing it in the document outline. */}
        <h2 id="showcase-heading" className="sr-only">
          Components in the loom React design system
        </h2>
        {/* On a phone the tiles are simply there: the grid is six screens
            tall, so holding them for a scroll leaves the section blank. */}
        <BentoGrid startOnView={!small} className="sm:grid-cols-4">
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
            name="Testimonial Wall"
            line="Columns that drift at their own speeds."
            href="/docs/components/testimonial-wall"
            frame={false}
            className="sm:col-span-2 sm:row-span-2"
          >
            {/* `h-full` deadlocks against `auto` rows. Out of flow it fills
                whatever the tile beside it settles the row at. */}
            <TestimonialWall
              // Its own padding: `inset-0` resolves against the padding box,
              // so a pad on the tile is ignored here.
              className="h-72 w-full p-3 sm:absolute sm:inset-0 sm:h-auto sm:w-auto"
              columns={2}
              duration={38}
              speeds={[1, 1.35]}
            >
              {QUOTES.map((quote) => (
                <figure
                  key={quote.handle}
                  className="bg-card rounded-xl border p-4"
                >
                  <blockquote className="text-sm text-pretty">
                    {quote.body}
                  </blockquote>
                  <figcaption className="text-muted-foreground mt-3 text-xs">
                    {quote.name}{" "}
                    <span className="opacity-70">{quote.handle}</span>
                  </figcaption>
                </figure>
              ))}
            </TestimonialWall>
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

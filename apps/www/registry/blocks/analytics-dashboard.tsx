"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ChartRange } from "@/registry/lib/chart-frame"
import { BentoCard, BentoGrid } from "@/registry/loomui/bento-grid"
import { CountUp } from "@/registry/loomui/count-up"
import { ElasticTabs } from "@/registry/loomui/elastic-tabs"
import { FunnelRows } from "@/registry/loomui/funnel-rows"
import { GaugeArc } from "@/registry/loomui/gauge-arc"
import { TrendStack } from "@/registry/loomui/trend-stack"

/**
 * An analytics view built from loom's charts.
 *
 * Product pace throughout: nothing here runs longer than the panel step, and
 * the only motion is each chart arriving once when it is scrolled to. A
 * dashboard is read every day, and a reveal that was charming on the first
 * visit is a delay on the two hundredth.
 */

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
]

const SERIES = {
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    trend: [
      { name: "Edge", values: [3420, 3990, 4270, 4640, 4910, 5330, 5840] },
      { name: "Origin", values: [2180, 2290, 2510, 2660, 2880, 2990, 3410] },
      { name: "Cache miss", values: [860, 1020, 1110, 1230, 1180, 1290, 1380] },
    ],
    visitors: 48291,
    delta: 11.4,
  },
  "30d": {
    labels: ["W1", "W2", "W3", "W4"],
    trend: [
      { name: "Edge", values: [14200, 16800, 18400, 21600] },
      { name: "Origin", values: [9100, 9800, 10400, 12200] },
      { name: "Cache miss", values: [3400, 3900, 4100, 4600] },
    ],
    visitors: 186540,
    delta: 8.2,
  },
  "90d": {
    labels: ["Jan", "Feb", "Mar"],
    trend: [
      { name: "Edge", values: [41000, 47800, 58600] },
      { name: "Origin", values: [27400, 29900, 34800] },
      { name: "Cache miss", values: [9800, 11200, 13400] },
    ],
    visitors: 542180,
    delta: -2.6,
  },
}

const SOURCES = [
  { name: "Search", value: 4820 },
  { name: "Direct", value: 2140 },
  { name: "Social", value: 1360 },
  { name: "Newsletter", value: 890 },
]

const FUNNEL = [
  { name: "Invited", value: 2840 },
  { name: "Opened", value: 1960 },
  { name: "Started", value: 1180 },
  { name: "Finished", value: 640 },
]

/** A number and what it counts, with the direction it moved. */
function Stat({
  label,
  value,
  delta,
  prefix,
  suffix,
}: {
  label: string
  value: number
  delta: number
  prefix?: string
  suffix?: string
}) {
  const up = delta >= 0

  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {prefix}
          <CountUp value={value} />
          {suffix}
        </span>
        <span
          data-direction={up ? "up" : "down"}
          className="rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums data-[direction=down]:bg-[color-mix(in_oklch,var(--chart-down)_16%,transparent)] data-[direction=down]:text-[var(--chart-down)] data-[direction=up]:bg-[color-mix(in_oklch,var(--chart-up)_16%,transparent)] data-[direction=up]:text-[var(--chart-up)]"
        >
          {up ? "+" : "-"}
          {Math.abs(delta).toFixed(1)}%
        </span>
      </p>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [range, setRange] = React.useState<keyof typeof SERIES>("7d")
  const current = SERIES[range]

  return (
    <div className="bg-background min-h-svh">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:py-12">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Overview</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Traffic and onboarding across every property.
            </p>
          </div>

          {/* The range control is the one thing on this page a person touches
              repeatedly, so it is the one thing given a pill that moves. */}
          <ElasticTabs
            items={RANGES}
            value={range}
            onValueChange={(value) => setRange(value as keyof typeof SERIES)}
          />
        </header>

        {/* The stats sit in their own grid. Dropped into the bento they take
            a row sized for a chart, and a two line figure leaves most of a
            9rem tile empty. */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="border-border bg-card rounded-xl border p-5">
            <Stat
              label="Visitors"
              value={current.visitors}
              delta={current.delta}
            />
          </div>
          <div className="border-border bg-card rounded-xl border p-5">
            <Stat label="Sessions" value={9210} delta={6.7} />
          </div>
          <div className="border-border bg-card rounded-xl border p-5">
            <Stat label="Avg. session" value={214} delta={3.1} suffix="s" />
          </div>
          <div className="border-border bg-card rounded-xl border p-5">
            <Stat label="Revenue" value={38420} delta={-1.8} prefix="$" />
          </div>
        </div>

        <BentoGrid className="mt-4 sm:grid-cols-4">
          {/* Charts bring their own card, so the tile gives up its padding and
              its border rather than drawing a second one around them. */}
          <BentoCard className="border-0 bg-transparent p-0 sm:col-span-4 lg:col-span-2">
            <TrendStack
              // Keyed on the range, so a change replays the reveal instead of
              // interpolating between two different shapes.
              key={range}
              className="h-full"
              series={current.trend}
              labels={current.labels}
              label="Requests served"
              delta={current.delta}
              range={
                <ChartRange>
                  {RANGES.find((entry) => entry.value === range)?.label}
                </ChartRange>
              }
            />
          </BentoCard>

          <BentoCard className="border-0 bg-transparent p-0 sm:col-span-4 lg:col-span-2">
            <GaugeArc
              className="h-full"
              segments={SOURCES}
              label="Sessions by source"
              delta={6.7}
              range={<ChartRange>Last 30 days</ChartRange>}
            />
          </BentoCard>

          <BentoCard className="border-0 bg-transparent p-0 sm:col-span-4">
            <FunnelRows
              className="h-full"
              stages={FUNNEL}
              label="Onboarding"
              delta={-1.8}
            />
          </BentoCard>
        </BentoGrid>
      </div>
    </div>
  )
}

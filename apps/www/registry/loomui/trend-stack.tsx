"use client"

import * as React from "react"

import {
  chartColor,
  ChartFrame,
  compact,
  grouped,
  type ChartTile,
} from "@/registry/lib/chart-frame"

export interface TrendSeries {
  /** Named in the legend, so identity is never colour alone. */
  name: string
  /** One value per label, in the same order. */
  values: number[]
  /** Overrides the slot this series would otherwise be given. */
  color?: string
}

export interface TrendStackProps extends Omit<
  React.ComponentProps<"figure">,
  "children" | "title"
> {
  /** Bottom to top. The first series is the bottom band. */
  series: TrendSeries[]
  /** One per point, along the bottom. */
  labels: string[]
  /** What the headline counts. */
  label?: string
  /** Percentage change on the headline. */
  delta?: number
  /** The range control. */
  range?: React.ReactNode
  /** Milliseconds for the reveal. A one-off entrance, so above the 300ms
   * product-UI ceiling on purpose: it is closer to a page transition than to a
   * control someone will trip forty times an hour. */
  duration?: number
  /** Run on mount instead of holding until the chart scrolls into view. */
  startOnView?: boolean
  /** Render the finished plot with no reveal. */
  disabled?: boolean
  /** Formats the headline and the tiles. */
  format?: (value: number) => string
  /** Formats the axis. */
  formatAxis?: (value: number) => string
}

/** The plot's width in its own coordinate space. Nothing about it reaches the page. */
const W = 640
/** Horizontal rules, including the floor. */
const ROWS = 4
/** Room one label needs before it starts touching the next one. */
const LABEL_PX = 34

/**
 * The plot's rendered width, so the chart can decide how tall to be and how
 * many labels there is room for.
 *
 * A chart cannot be laid out by breakpoints alone. The same component goes in a
 * full-width panel and in a third of a dashboard row, and it is the element's
 * own width that decides whether twelve months fit, not the window's.
 */
function useWidth<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof ResizeObserver === "undefined") {
      setWidth(node.getBoundingClientRect().width)
      return
    }

    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width)
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}

/**
 * Latches on the first sighting and lets the observer go. A chart that redraws
 * itself every time it scrolls past is a chart nobody can read on the way back
 * up the page.
 */
function useArrived(startOnView: boolean, disabled: boolean) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [arrived, setArrived] = React.useState(!startOnView || disabled)

  React.useEffect(() => {
    if (!startOnView || disabled) return

    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setArrived(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArrived(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [disabled, startOnView])

  return [ref, arrived] as const
}

/** Steps a person would have chosen, rather than whatever the data topped out at. */
const NICE = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

/**
 * The first of those steps at or above the tallest stack.
 *
 * Rounding to the next half decade instead put an axis of 15K over data that
 * peaked at 11.1K, and a third of the plot was empty sky.
 */
function ceiling(value: number) {
  if (value <= 0) return 1
  const size = 10 ** Math.floor(Math.log10(value))
  const step = NICE.find((n) => n * size >= value) ?? 10
  return step * size
}

function line(points: number[][]) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")
}

/**
 * Stacked series under a line each, revealed left to right when the chart
 * arrives, and read by pointing at a column.
 *
 * The bands are stacked rather than overlaid because the question a stacked
 * area answers is "what does this add up to, and who contributed". Overlaid
 * translucent areas answer neither: the overlaps make a colour that is in no
 * legend, and no band can be read against the axis.
 */
export function TrendStack({
  series,
  labels,
  label = "Total",
  delta,
  range,
  duration = 700,
  startOnView = true,
  disabled = false,
  format = grouped,
  formatAxis = compact,
  className,
  ...props
}: TrendStackProps) {
  const [plot, arrived] = useArrived(startOnView, disabled)
  const [box, width] = useWidth<HTMLDivElement>()
  const [at, setAt] = React.useState<number | null>(null)

  /**
   * Height is chosen in rendered pixels and converted back into the viewBox,
   * rather than the viewBox being fixed and the plot squashing with it. A
   * 640x200 box on a phone is 90px tall, which is not a chart.
   */
  const px = width || 640
  const tall = Math.min(260, Math.max(150, px * 0.42))
  const H = Math.round((tall / px) * W)

  /**
   * The narrowest the plot is allowed to be before it scrolls instead. Below
   * this every label is on top of the next one.
   */
  const floor = labels.length * LABEL_PX
  const overflowing = width > 0 && floor > width

  /**
   * Show every nth label. With the scroller there is normally room for all of
   * them, so this only bites where a consumer has pinned the width.
   */
  const step = Math.max(
    1,
    Math.ceil(labels.length / Math.max(1, Math.floor(px / LABEL_PX)))
  )

  const gradient = React.useId().replace(/:/g, "")

  // Stack once. Every band, every line and every dot reads off this.
  const { bands, totals, top } = React.useMemo(() => {
    const running = labels.map(() => 0)
    const bands = series.map((entry) => {
      const lower = running.slice()
      // Walked over the labels, not over the series. A series carrying more
      // values than the axis has slots wrote past the end of the running
      // total, and `undefined + n` is NaN: one long series took the scale,
      // every gridline and every path down with it. A short series is padded
      // with zero for the same reason.
      for (let i = 0; i < running.length; i++) {
        running[i] += entry.values[i] ?? 0
      }
      return { lower, upper: running.slice() }
    })

    return {
      bands,
      totals: running.slice(),
      top: ceiling(Math.max(...running)),
    }
  }, [labels, series])

  const x = (i: number) =>
    labels.length > 1 ? (i / (labels.length - 1)) * W : W / 2
  const y = (value: number) => H - (value / top) * H

  const focus = at === null ? null : at
  const headline =
    focus === null ? totals.reduce((a, b) => a + b, 0) : totals[focus]

  const tiles: ChartTile[] = series.map((entry, index) => ({
    name: entry.name,
    color: entry.color ?? chartColor(index),
    value: format(
      focus === null
        ? // Only what the axis actually plots, so the tile agrees with the
          // band above it rather than counting points nobody can see.
          entry.values.slice(0, labels.length).reduce((a, b) => a + (b ?? 0), 0)
        : (entry.values[focus] ?? 0)
    ),
  }))

  const read = (event: React.PointerEvent<HTMLDivElement>) => {
    // A finger dragging across the plot is scrolling it, not reading it. Touch
    // reads on a tap instead, which is the gesture that means "this one".
    if (event.pointerType === "touch" && event.type === "pointermove") return

    const box = event.currentTarget.getBoundingClientRect()
    const share = (event.clientX - box.left) / box.width
    setAt(
      Math.min(
        labels.length - 1,
        Math.max(0, Math.round(share * (labels.length - 1)))
      )
    )
  }

  return (
    <ChartFrame
      label={focus === null ? label : `${label} · ${labels[focus]}`}
      value={format(headline)}
      delta={delta}
      range={range}
      tiles={tiles}
      className={className}
      {...props}
    >
      <div>
        {/* The ticks share a row with the plot and nothing else. Sitting in the
            same flex child as the month labels, the column would be as tall as
            both and every tick would be spread over a height the gridlines do
            not use. */}
        <div ref={plot} className="flex gap-2">
          {/* Ticks are HTML rather than SVG text: inside the viewBox they would
              scale with the container and end up a different size on every
              screen. */}
          {/* Given the plot's height explicitly. As a stretched flex item it
              would be as tall as the scroller, labels included, and every tick
              would sit a little below the rule it names. */}
          <div
            style={{ height: `${tall}px` }}
            // Only as wide as four characters need. The ticks are right
            // aligned in it, so every pixel they do not use is dead space
            // between the card's edge and the first thing printed in it.
            className="text-muted-foreground relative w-7 shrink-0 self-start text-[10px] tabular-nums"
          >
            {Array.from({ length: ROWS + 1 }, (_, row) => (
              <span
                key={row}
                className="absolute right-0 -translate-y-1/2"
                style={{ top: `${(row / ROWS) * 100}%` }}
              >
                {formatAxis((top * (ROWS - row)) / ROWS)}
              </span>
            ))}
          </div>

          {/* The plot scrolls rather than compresses. Twelve months in 240px
              is not twelve months, and the alternative to scrolling is dropping
              data the card claims to be showing. The ticks stay outside the
              scroller, so the scale is still readable at any scroll position. */}
          <div
            data-overflowing={overflowing ? "" : undefined}
            className="no-scrollbar min-w-0 flex-1 overflow-x-auto data-overflowing:[mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]"
          >
            <div style={{ minWidth: `${floor}px` }}>
              <div
                ref={box}
                onPointerMove={read}
                onPointerDown={read}
                onPointerLeave={() => setAt(null)}
                className="relative"
              >
                <svg
                  viewBox={`0 0 ${W} ${H}`}
                  className="block h-auto w-full overflow-visible"
                  role="img"
                  aria-label={`${label} by ${series.map((s) => s.name).join(", ")}`}
                >
                  <defs>
                    {series.map((entry, index) => (
                      <linearGradient
                        key={entry.name}
                        id={`${gradient}-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={entry.color ?? chartColor(index)}
                          stopOpacity="0.35"
                        />
                        <stop
                          offset="100%"
                          stopColor={entry.color ?? chartColor(index)}
                          stopOpacity="0.04"
                        />
                      </linearGradient>
                    ))}
                    <clipPath id={`${gradient}-wipe`}>
                      {/* Scaled rather than resized: a width animation lays the
                      clip out again every frame, a transform does not. */}
                      <rect
                        width={W}
                        height={H}
                        className="ease-out-quart origin-left transition-transform motion-reduce:transition-none"
                        style={{
                          transformBox: "view-box",
                          transitionDuration: disabled
                            ? "0ms"
                            : `${duration}ms`,
                          transform: arrived ? "scaleX(1)" : "scaleX(0)",
                        }}
                      />
                    </clipPath>
                  </defs>

                  {Array.from({ length: ROWS + 1 }, (_, row) => (
                    <line
                      key={row}
                      x1="0"
                      x2={W}
                      y1={(row / ROWS) * H}
                      y2={(row / ROWS) * H}
                      className="stroke-border"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}

                  <g clipPath={`url(#${gradient}-wipe)`}>
                    {bands.map((band, index) => {
                      const color = series[index].color ?? chartColor(index)
                      const upper = band.upper.map((value, i) => [
                        x(i),
                        y(value),
                      ])
                      const lower = band.lower
                        .map((value, i) => [x(i), y(value)])
                        .reverse()

                      return (
                        <g key={series[index].name}>
                          <path
                            d={`${line(upper)}L${lower.map(([px, py]) => `${px} ${py}`).join("L")}Z`}
                            fill={`url(#${gradient}-${index})`}
                          />
                          <path
                            d={line(upper)}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        </g>
                      )
                    })}
                  </g>

                  {focus === null ? null : (
                    <g>
                      <line
                        x1={x(focus)}
                        x2={x(focus)}
                        y1="0"
                        y2={H}
                        className="stroke-muted-foreground/40"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                      {bands.map((band, index) => (
                        <circle
                          key={series[index].name}
                          cx={x(focus)}
                          cy={y(band.upper[focus])}
                          r="4"
                          fill={series[index].color ?? chartColor(index)}
                          // A ring in the surface colour, so a dot sitting on a
                          // line of its own colour still reads as a dot.
                          className="stroke-card"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}
                    </g>
                  )}
                </svg>
              </div>

              {/* Inside the scroller, so a label never parts company with the
                  point it belongs to. */}
              <div className="text-muted-foreground relative mt-2 h-4 text-[10px] [&>span:first-child]:translate-x-0 [&>span:last-child]:-translate-x-full">
                {labels.map((name, i) =>
                  // Thinned, not shrunk. Twelve months at 6px each is not twelve
                  // labels, it is a smudge.
                  i % step === 0 || i === focus ? (
                    <span
                      key={name}
                      data-focus={i === focus ? "" : undefined}
                      className="data-focus:text-foreground absolute -translate-x-1/2 data-focus:font-medium"
                      style={{
                        left: `${labels.length > 1 ? (i / (labels.length - 1)) * 100 : 50}%`,
                      }}
                    >
                      {name}
                    </span>
                  ) : null
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ChartFrame>
  )
}

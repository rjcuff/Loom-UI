"use client"

import * as React from "react"

import {
  chartColor,
  ChartFrame,
  grouped,
  type ChartTile,
} from "@/registry/lib/chart-frame"

export interface GaugeSegment {
  /** Named in the legend and in the middle of the ring. */
  name: string
  /** How much of the whole this segment is. */
  value: number
  /** Overrides the slot this segment would otherwise be given. */
  color?: string
}

export interface GaugeArcProps extends Omit<
  React.ComponentProps<"figure">,
  "children" | "title"
> {
  /** Clockwise from the left. The first segment is the one the middle reads. */
  segments: GaugeSegment[]
  /** What the headline counts. */
  label?: string
  /** Percentage change on the headline. */
  delta?: number
  /** The range control. */
  range?: React.ReactNode
  /** Milliseconds for the whole ring to sweep round. */
  duration?: number
  /** Milliseconds of pause between one segment finishing and the next starting. */
  stagger?: number
  /** Surface left between segments, in the plot's own units. */
  gap?: number
  /** Ring thickness, in the plot's own units. */
  thickness?: number
  /** Run on mount instead of holding until the gauge scrolls into view. */
  startOnView?: boolean
  /** Render the finished ring with no draw. */
  disabled?: boolean
  /** Formats the headline and the tiles. */
  format?: (value: number) => string
}

/** The plot's own coordinate space. */
const W = 200
const H = 118
const CX = 100
const CY = 102
const R = 78

/**
 * Latches on the first sighting and lets the observer go. A gauge that redraws
 * every time it scrolls past is one nobody can read on the way back up.
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

function point(angle: number) {
  const radians = (angle * Math.PI) / 180
  return [CX + R * Math.cos(radians), CY - R * Math.sin(radians)]
}

/**
 * An arc from `from` degrees to `to`, measured the way a protractor is: 180 on
 * the left, 0 on the right, over the top.
 */
function arc(from: number, to: number) {
  const [x0, y0] = point(from)
  const [x1, y1] = point(to)
  // Sweeping from a larger angle to a smaller one is clockwise on screen,
  // because SVG's y axis points down.
  return `M${x0} ${y0}A${R} ${R} 0 ${from - to > 180 ? 1 : 0} 1 ${x1} ${y1}`
}

/**
 * Half a ring, divided into segments, with the share of whichever one is in
 * focus written in the middle.
 *
 * A gauge earns its place when one share is the headline and the rest are
 * context. If every segment matters equally, this is a worse bar chart: arcs
 * of different radius are genuinely hard to compare, which is why the numbers
 * are on tiles underneath rather than left to be read off the ring.
 */
export function GaugeArc({
  segments,
  label = "Total",
  delta,
  range,
  duration = 900,
  stagger = 40,
  gap = 5,
  thickness = 18,
  startOnView = true,
  disabled = false,
  format = grouped,
  className,
  ...props
}: GaugeArcProps) {
  const [root, arrived] = useArrived(startOnView, disabled)
  const [at, setAt] = React.useState<number | null>(null)

  const total = segments.reduce((sum, segment) => sum + segment.value, 0)

  /**
   * How far back each end has to be pulled for a gap to be visible.
   *
   * A round cap sticks out past the end of its path by half the stroke, so a
   * gap narrower than the ring is not a gap at all: the two caps meet in the
   * middle of it and the segments read as touching. The pull-back is therefore
   * half the stroke plus the surface actually wanted, converted from the
   * plot's units into degrees at this radius.
   */
  const pad = (((thickness + gap) / 2) * 180) / (R * Math.PI)

  // Walk the half circle once, handing each segment the span it has earned.
  const spans = React.useMemo(() => {
    let angle = 180
    const last = segments.length - 1

    let elapsed = 0

    return segments.map((segment, index) => {
      const share = total > 0 ? segment.value / total : 0
      const sweep = share * 180
      const from = angle
      angle -= sweep

      // Only the joins are padded. Padding the two outer ends as well would
      // leave a stub of bare track sticking out past each end of the ring,
      // which reads as an unfinished chart rather than as breathing room.
      const start = index === 0 ? from : from - pad
      const end = index === last ? angle : angle + pad

      // Each segment takes as long as it is long, and starts where the one
      // before it stopped. Given every segment the same duration instead, a 10%
      // slice crawled while a 52% slice raced, and four of them overlapping
      // read as four animations rather than as one hand going round a dial.
      const span = Math.max(120, duration * share)
      const delay = elapsed
      elapsed += span + stagger

      return { from: start, to: Math.min(start, end), span, delay }
    })
  }, [duration, pad, segments, stagger, total])

  const focus = at ?? 0
  const showing = segments[focus]
  const share = total > 0 ? (showing?.value ?? 0) / total : 0

  const tiles: ChartTile[] = segments.map((segment, index) => ({
    name: segment.name,
    color: segment.color ?? chartColor(index),
    value: format(segment.value),
    dim: at !== null && at !== index,
  }))

  return (
    <ChartFrame
      label={label}
      value={format(total)}
      delta={delta}
      range={range}
      tiles={tiles}
      onTileFocus={setAt}
      className={className}
      {...props}
    >
      {/*
       * Clearing on the wrapper's `pointerleave` alone left a segment lit
       * while the pointer sat in the middle of the ring, or in the empty
       * corner of the card: those are still inside the wrapper. Every move
       * that is not over a segment clears it, so the highlight ends where the
       * colour ends.
       */}
      <div
        ref={root}
        onPointerMove={(event) => {
          if (!(event.target as Element).closest("[data-segment]")) setAt(null)
        }}
        onPointerLeave={() => setAt(null)}
      >
        <div className="relative mx-auto w-full max-w-sm">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block h-auto w-full"
            role="img"
            aria-label={`${label} by ${segments.map((s) => s.name).join(", ")}`}
          >
            <path
              d={arc(180, 0)}
              fill="none"
              className="stroke-muted"
              strokeWidth={thickness}
              strokeLinecap="round"
            />

            {spans.map((span, index) => {
              const segment = segments[index]
              const dim = at !== null && at !== index

              return (
                <g key={segment.name}>
                  <path
                    d={arc(span.from, span.to)}
                    fill="none"
                    stroke={segment.color ?? chartColor(index)}
                    strokeWidth={thickness}
                    strokeLinecap="round"
                    // Normalised to 1, so one dash covers the segment whatever
                    // its real length is and a 3% slice and a 47% slice draw in
                    // the same time rather than at the same speed.
                    //
                    // `stroke-dashoffset` is a paint, not a compositor
                    // property. On one ring, once, that is the right trade for
                    // a draw that actually follows the arc.
                    pathLength={1}
                    strokeDasharray={1}
                    className="motion-reduce:transition-none"
                    style={{
                      strokeDashoffset: arrived ? 0 : 1,
                      opacity: dim ? 0.28 : 1,
                      // Two transitions, not one. Sharing a delay with the draw
                      // made the dimming stagger too, so pointing at a segment
                      // set the others fading one after another, like something
                      // loading rather than something answering.
                      //
                      // The draw is linear. Easing each segment out on its own
                      // makes the sweep speed pulse once per segment, which is
                      // the opposite of a hand travelling round a dial. Loom
                      // gives linear to marquees and to progress, and a gauge
                      // filling is progress.
                      transition: [
                        `stroke-dashoffset ${disabled ? 0 : span.span}ms linear ${
                          disabled ? 0 : span.delay
                        }ms`,
                        "opacity 180ms var(--ease-out-quart)",
                      ].join(","),
                    }}
                  />
                  {/* A wider invisible copy, so a 19 unit ring is not a 19 unit
                      hit target. Nothing is drawn, only pointed at. */}
                  <path
                    data-segment=""
                    d={arc(span.from, span.to)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={thickness + 14}
                    strokeLinecap="round"
                    onPointerEnter={() => setAt(index)}
                    style={{ pointerEvents: "stroke" }}
                  />
                </g>
              )
            })}
          </svg>

          {/* The middle is HTML. Inside the viewBox it would be a different
              type size at every container width. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
            <span className="text-2xl leading-none font-semibold tabular-nums">
              {Math.round(share * 100)}%
            </span>
            <span className="text-muted-foreground mt-1 text-xs">
              {showing?.name}
            </span>
          </div>
        </div>
      </div>
    </ChartFrame>
  )
}

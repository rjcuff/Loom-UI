"use client"

import * as React from "react"

import {
  chartColor,
  ChartFrame,
  grouped,
  type ChartTile,
} from "@/registry/lib/chart-frame"

export interface FunnelStage {
  /** Named on the row and in the tile, so identity is never colour alone. */
  name: string
  /** How many got this far. */
  value: number
  /** Overrides the slot this stage would otherwise be given. */
  color?: string
  /** Sits at the head of the bar. Decorative. */
  icon?: React.ReactNode
}

export interface FunnelRowsProps extends Omit<
  React.ComponentProps<"figure">,
  "children" | "title"
> {
  /** In order, widest first. The first stage sets the scale. */
  stages: FunnelStage[]
  /** What the headline counts. */
  label?: string
  /** Percentage change on the headline. */
  delta?: number
  /** The range control. */
  range?: React.ReactNode
  /** Milliseconds for one bar to grow. */
  duration?: number
  /** Milliseconds between one bar starting and the next. */
  stagger?: number
  /** Run on mount instead of holding until the chart scrolls into view. */
  startOnView?: boolean
  /** Render the finished bars with no growth. */
  disabled?: boolean
  /** Formats the headline and the tiles. */
  format?: (value: number) => string
}

/**
 * Latches on the first sighting and lets the observer go. A funnel that
 * regrows every time it scrolls past is a funnel nobody can read on the way
 * back up the page.
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

/**
 * A funnel as a row per stage: the name, a bar as long as its share of the
 * first stage, then the count and that share as a percentage.
 *
 * The bar is the whole track wide and scaled down to its share, rather than
 * being given a width. A width animation lays the row out on every frame; a
 * transform does not touch layout at all, and the number beside it can stay
 * exactly where it is while the bar moves.
 *
 * Share is always against the first stage, never against the row above. A
 * funnel where each row is a percentage of the last one reads as though the
 * drop-off is smaller than it is.
 */
export function FunnelRows({
  stages,
  label = "Total",
  delta,
  range,
  duration = 520,
  stagger = 65,
  startOnView = true,
  disabled = false,
  format = grouped,
  className,
  ...props
}: FunnelRowsProps) {
  const [root, arrived] = useArrived(startOnView, disabled)
  const [at, setAt] = React.useState<number | null>(null)

  const first = stages[0]?.value ?? 0
  const share = (value: number) => (first > 0 ? value / first : 0)

  const headline = at === null ? first : stages[at].value

  const tiles: ChartTile[] = stages.map((stage, index) => ({
    name: stage.name,
    color: stage.color ?? chartColor(index),
    value: format(stage.value),
    dim: at !== null && at !== index,
  }))

  return (
    <ChartFrame
      label={at === null ? label : `${label} · ${stages[at].name}`}
      value={format(headline)}
      delta={delta}
      range={range}
      tiles={tiles}
      onTileFocus={setAt}
      className={className}
      {...props}
    >
      {/* The gaps between rows belong to this element, not to a row, so a
          pointer resting in one used to keep the row above it lit. */}
      <div
        ref={root}
        onPointerMove={(event) => {
          if (!(event.target as Element).closest("[data-stage]")) setAt(null)
        }}
        onPointerLeave={() => setAt(null)}
        className="flex flex-col gap-2"
      >
        {stages.map((stage, index) => {
          const color = stage.color ?? chartColor(index)
          const dim = at !== null && at !== index

          return (
            <div
              key={stage.name}
              data-stage=""
              onPointerEnter={() => setAt(index)}
              data-dim={dim ? "" : undefined}
              className="ease-out-quart grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 transition-opacity duration-180 data-dim:opacity-45 motion-reduce:transition-none sm:grid-cols-[5.5rem_1fr_auto] sm:gap-3"
            >
              <span className="text-muted-foreground truncate text-right text-xs">
                {stage.name}
              </span>

              <span className="bg-muted relative block h-7 overflow-hidden rounded-full">
                {/* The bar is laid out at its final length and grown from
                    nothing with a transform. Scaling a full-width bar down to
                    its share instead squashes the pill's end caps into
                    ellipses, and the smaller the stage the worse it looks. */}
                <span
                  className="ease-out-quart absolute inset-y-0 left-0 origin-left rounded-full transition-transform motion-reduce:transition-none"
                  style={{
                    background: color,
                    // Clamped, though the percentage beside it is not. A stage
                    // larger than the first is bad data, and the honest thing
                    // is to say 400% and draw a full bar — not to lay out an
                    // element four times the width of the track it is in.
                    width: `${Math.min(1, Math.max(0, share(stage.value))) * 100}%`,
                    transitionDuration: disabled ? "0ms" : `${duration}ms`,
                    transitionDelay: disabled ? "0ms" : `${index * stagger}ms`,
                    transform: `scaleX(${arrived ? 1 : 0})`,
                  }}
                />
                {stage.icon ? (
                  // Outside the scaled bar. Inside it the icon would be
                  // squashed flat at the start and stretch as the bar grew.
                  <span
                    aria-hidden
                    className="text-card absolute top-1/2 left-1.5 flex size-5 -translate-y-1/2 items-center justify-center"
                  >
                    {stage.icon}
                  </span>
                ) : null}
              </span>

              <span className="flex items-baseline justify-end gap-2 text-xs tabular-nums">
                <span className="font-medium">{format(stage.value)}</span>
                {/* The share is the first thing to go when the row runs out of
                    room: the bar already shows it. */}
                <span className="text-muted-foreground hidden w-9 text-right sm:inline">
                  {Math.round(share(stage.value) * 100)}%
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </ChartFrame>
  )
}

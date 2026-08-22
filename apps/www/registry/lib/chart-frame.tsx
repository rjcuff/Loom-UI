"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** One entry in the grid under the plot. */
export interface ChartTile {
  /** The series or stage this stands for. */
  name: string
  /** Already formatted. The frame does not know what the number means. */
  value: string
  /** The mark's colour. Any CSS colour; loom's charts pass `--chart-n`. */
  color?: string
  /** Held back while something else is in focus. */
  dim?: boolean
}

export interface ChartFrameProps extends Omit<
  React.ComponentProps<"figure">,
  "title"
> {
  /** What the headline number counts. */
  label: React.ReactNode
  /** The headline itself, already formatted. */
  value: React.ReactNode
  /** Percentage change. Positive reads up, negative down, omitted reads not at all. */
  delta?: number
  /** The range control. A node, so a real `<select>` can go here. */
  range?: React.ReactNode
  /** The legend. Names carry identity so the colours never have to alone. */
  tiles?: ChartTile[]
  /** Pointing at a tile is pointing at its mark. `null` on leave. */
  onTileFocus?: (index: number | null) => void
  children: React.ReactNode
}

/** The six chart slots, in the order they are assigned. */
export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
] as const

/**
 * The colour for series `index`.
 *
 * Past the sixth it returns the muted ink rather than cycling. A seventh
 * series wearing the first one's colour is worse than a seventh series with no
 * colour at all: one of them is unreadable, the other is wrong.
 */
export function chartColor(index: number) {
  return CHART_COLORS[index] ?? "var(--muted-foreground)"
}

/** Compact by default: 94,700 stays itself, 13,500 becomes 13.5K. */
export function compact(value: number) {
  if (Math.abs(value) < 1000) return `${Math.round(value)}`
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

/** Grouped, for a headline that has room to be exact. */
export function grouped(value: number) {
  return new Intl.NumberFormat("en").format(Math.round(value))
}

function Delta({ value }: { value: number }) {
  const up = value >= 0

  return (
    <span
      data-direction={up ? "up" : "down"}
      className="rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums data-[direction=down]:bg-[color-mix(in_oklch,var(--chart-down)_16%,transparent)] data-[direction=down]:text-[var(--chart-down)] data-[direction=up]:bg-[color-mix(in_oklch,var(--chart-up)_16%,transparent)] data-[direction=up]:text-[var(--chart-up)]"
    >
      {up ? "+" : "-"}
      {Math.abs(value).toFixed(1)}%
    </span>
  )
}

/**
 * The card every loom chart sits in: what the number counts, the number, how
 * it moved, the plot, and a named tile per series.
 *
 * The tiles are not decoration. Three of the six light-mode series colours sit
 * under 3:1 against a white card, and a legend that names each series is what
 * makes that legible rather than a guess. They also carry the values while the
 * pointer is inside the plot, so reading one series does not mean hunting for
 * a tooltip.
 *
 * Everything numeric here is `tabular-nums`. A headline that changes under the
 * pointer must not change width while it does, or the whole card twitches on
 * every mouse move.
 */
export function ChartFrame({
  label,
  value,
  delta,
  range,
  tiles,
  onTileFocus,
  children,
  className,
  ...props
}: ChartFrameProps) {
  /**
   * Threes divide evenly, otherwise twos. Four tiles as three and one reads as
   * a tile that fell off the end; as two and two it reads as a set.
   *
   * Never more columns than there are tiles. A one-series chart was laid out
   * in three, so its only tile took a third of the card and the other two
   * thirds were closed but empty. At that width the name it carries, the
   * thing standing in for a colour nobody can be asked to distinguish,
   * truncated to two letters.
   */
  const columns = !tiles?.length
    ? 3
    : Math.min(
        tiles.length,
        tiles.length % 3 === 0 ? 3 : tiles.length % 2 === 0 ? 2 : 3
      )

  return (
    <figure
      data-slot="chart-frame"
      className={cn(
        "bg-card text-card-foreground flex w-full flex-col rounded-xl border p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <figcaption className="text-muted-foreground text-xs">
            {label}
          </figcaption>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl leading-none font-semibold tabular-nums">
              {value}
            </span>
            {delta === undefined ? null : <Delta value={delta} />}
          </div>
        </div>
        {range ? <div className="shrink-0">{range}</div> : null}
      </div>

      {/* Takes the slack when the card is taller than the plot needs, and
          centres the plot in it. Left to size itself the plot stays put at the
          top and the whole remainder collects between the legend and the
          bottom edge, which reads as the card having been cut short. */}
      <div className="mt-5 flex min-h-0 flex-1 flex-col justify-center">
        {children}
      </div>

      {tiles?.length ? (
        // The column count follows the tile count rather than the width the
        // grid happens to have: four tiles want two rows of two, six want two
        // rows of three, and `auto-fit` gave four and two for six.
        //
        // Separators are drawn by the cells rather than by a coloured gap
        // behind the grid, so a short last row leaves no stray colour. The
        // fillers exist to close the borders on that row: without them the
        // dividers stop where the tiles stop, halfway across the card.
        //
        // Two columns on a phone, so an odd count leaves one tile alone on the
        // last row. It takes the full width rather than sitting in half of it
        // beside an empty box: an outlined blank cell reads as a tile that
        // failed to load, which is worse than a wide one.
        <div
          style={{ "--tile-columns": columns } as React.CSSProperties}
          className="mt-5 grid grid-cols-2 overflow-hidden rounded-lg border sm:[grid-template-columns:repeat(var(--tile-columns),minmax(0,1fr))]"
        >
          {tiles.map((tile, index) => (
            <div
              key={tile.name}
              data-dim={tile.dim ? "" : undefined}
              onPointerEnter={
                onTileFocus ? () => onTileFocus(index) : undefined
              }
              onPointerLeave={onTileFocus ? () => onTileFocus(null) : undefined}
              className={cn(
                "bg-card ease-out-quart border-border -mt-px -ml-px flex flex-col gap-1 border-t border-l p-2.5 transition-opacity duration-180 data-dim:opacity-40 motion-reduce:transition-none",
                index === tiles.length - 1 &&
                  tiles.length % 2 === 1 &&
                  "max-sm:col-span-2"
              )}
            >
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{
                    background: tile.color ?? "var(--muted-foreground)",
                  }}
                />
                <span className="truncate">{tile.name}</span>
              </span>
              <span className="text-sm font-medium tabular-nums">
                {tile.value}
              </span>
            </div>
          ))}

          {Array.from(
            { length: (columns - (tiles.length % columns)) % columns },
            (_, i) => (
              <span
                key={`wide-${i}`}
                aria-hidden
                className="bg-card border-border -mt-px -ml-px hidden border-t border-l sm:block"
              />
            )
          )}
        </div>
      ) : null}
    </figure>
  )
}

/**
 * The range chip. Inert on purpose: it is a slot, and a real app puts its own
 * control in it. Rendering a `<button>` that does nothing would be a lie about
 * what it does.
 */
export function ChartRange({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs",
        className
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3.5"
        aria-hidden
      >
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
      {children}
    </span>
  )
}

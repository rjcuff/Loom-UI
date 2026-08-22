"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const WIDTHS = [
  { label: "Phone", value: 390 },
  { label: "Tablet", value: 768 },
  { label: "Desktop", value: 0 },
] as const

/**
 * A block, rendered in an iframe at a width you choose.
 *
 * An iframe rather than a div, because a block is a page. It brings its own
 * heading order and its own full-height background, and dropping that into the
 * middle of a docs article would put a second `h1` inside the first one's
 * outline and let the docs stylesheet reach into it.
 *
 * The width buttons are the point of the frame: these are responsive layouts,
 * and the only honest way to show that is to let someone narrow it.
 */
export function BlockPreview({
  name,
  title,
  height = 720,
}: {
  /** Registry item name. Rendered from `/view/<name>`. */
  name: string
  title: string
  /** Frame height in pixels. */
  height?: number
}) {
  const [width, setWidth] = React.useState<number>(0)

  return (
    <figure className="not-prose border-border my-8 overflow-hidden rounded-xl border">
      <figcaption className="border-border flex items-center justify-between gap-4 border-b px-4 py-2">
        <span className="text-sm font-medium">{title}</span>

        <div className="flex items-center gap-1">
          {WIDTHS.map((entry) => (
            <button
              key={entry.label}
              type="button"
              onClick={() => setWidth(entry.value)}
              aria-pressed={width === entry.value}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150",
                width === entry.value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </figcaption>

      {/* The rail keeps its own background, so a narrowed block reads as a
          device on a surface rather than as a layout that failed to fill. */}
      <div className="bg-muted/40 grid place-items-center p-0 sm:p-4">
        <iframe
          // Remounted per width so the block's scroll-triggered reveals run
          // again at the new size, which is usually what you resized to see.
          key={width}
          src={`/view/${name}`}
          title={title}
          loading="lazy"
          className="bg-background ease-out-quart w-full border-0 transition-[max-width] duration-300 sm:rounded-lg"
          style={{ height, maxWidth: width || "100%" }}
        />
      </div>
    </figure>
  )
}

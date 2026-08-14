"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const format = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function GitHubStars({ className }: { className?: string }) {
  const [stars, setStars] = React.useState<number | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()

    fetch("/api/github-stars", { signal: controller.signal })
      .then((response) => response.json())
      .then((data: { stars?: number | null }) => {
        if (typeof data.stars === "number") {
          setStars(data.stars)
        }
      })
      // No count is a fine outcome. The slot stays empty and the link works.
      .catch(() => {})

    return () => controller.abort()
  }, [])

  // The slot holds its width from the first paint, so the number arriving does
  // not nudge the rest of the header sideways. A count that never arrives
  // leaves the space empty rather than a star with nothing beside it, which
  // would read as broken.
  return (
    <span
      className={cn(
        "text-muted-foreground inline-flex min-w-[4.5ch] items-center gap-1 text-xs tabular-nums",
        className
      )}
    >
      {stars === null ? null : (
        <span className="animate-in fade-in inline-flex items-center gap-1 duration-300">
          <span aria-hidden="true">⭐</span>
          {format.format(stars)}
          <span className="sr-only"> stars on GitHub</span>
        </span>
      )}
    </span>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/** One row of the grid: what the token is called and what it is currently set to. */
function Swatch({
  token,
  label,
  ring,
}: {
  token: string
  label?: string
  /** Draw the chip as an outline rather than a fill. For border tokens. */
  ring?: boolean
}) {
  const [value, setValue] = React.useState("")

  // Read from the live document rather than from a hardcoded table, so the
  // page tells the truth after a theme flip or an override in the picker.
  React.useEffect(() => {
    const read = () =>
      setValue(
        getComputedStyle(document.documentElement)
          .getPropertyValue(`--${token}`)
          .trim()
      )

    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    })
    return () => observer.disconnect()
  }, [token])

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "size-9 shrink-0 rounded-lg",
          ring ? "border-2" : "border"
        )}
        style={
          ring
            ? { borderColor: `var(--${token})` }
            : { background: `var(--${token})` }
        }
      />
      <span className="min-w-0">
        <span className="block truncate font-mono text-xs">--{token}</span>
        <span className="text-muted-foreground block truncate font-mono text-[11px]">
          {label ?? value}
        </span>
      </span>
    </div>
  )
}

export function SwatchGrid({
  tokens,
  ring,
}: {
  /** Comma separated, so MDX can pass them without an array literal. */
  tokens: string
  ring?: boolean
}) {
  const names = tokens
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

  return (
    <div className="not-prose border-border my-6 grid grid-cols-1 gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-3">
      {names.map((token) => (
        <Swatch key={token} token={token} ring={ring} />
      ))}
    </div>
  )
}

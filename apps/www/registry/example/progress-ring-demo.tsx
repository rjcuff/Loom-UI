"use client"

import * as React from "react"

import { ProgressRing } from "@/registry/loomui/progress-ring"

const STOPS = [20, 64, 38, 92, 12]

export default function ProgressRingDemo() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % STOPS.length),
      1800
    )
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4">
      <ProgressRing value={STOPS[index]} label="Threads wound" />
      <p className="text-muted-foreground text-xs">
        It never stops to start again.
      </p>
    </div>
  )
}

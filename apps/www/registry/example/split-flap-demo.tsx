"use client"

import * as React from "react"

import { SplitFlap } from "@/registry/loomui/split-flap"

const BOARD = [
  { city: "LISBON", gate: "B12", time: "10:42" },
  { city: "OSAKA", gate: "D04", time: "13:05" },
  { city: "REYKJAVIK", gate: "A21", time: "16:30" },
  { city: "MONTREAL", gate: "C09", time: "19:55" },
]

export default function SplitFlapDemo() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % BOARD.length),
      3600
    )
    return () => window.clearInterval(timer)
  }, [])

  const row = BOARD[index]

  return (
    <div className="bg-muted/40 flex flex-col items-center gap-3 rounded-xl border p-6">
      <SplitFlap value={row.city} padTo={9} className="text-[1.6rem]" />
      <div className="flex gap-3">
        <SplitFlap value={row.gate} padTo={3} className="text-base" />
        <SplitFlap value={row.time} padTo={5} className="text-base" />
      </div>
    </div>
  )
}

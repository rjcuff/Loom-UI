"use client"

import * as React from "react"

import { HoldButton } from "@/registry/loomui/hold-button"

export default function HoldButtonDemo() {
  const [deleted, setDeleted] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  React.useEffect(() => () => clearTimeout(timer.current), [])

  const handleHold = () => {
    setDeleted(true)
    timer.current = setTimeout(() => setDeleted(false), 2400)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <HoldButton
        duration={1100}
        onHold={handleHold}
        color="color-mix(in oklch, var(--destructive) 22%, transparent)"
        className="text-destructive px-4 py-2 text-sm font-medium"
      >
        {deleted ? "Deleted" : "Hold to delete"}
      </HoldButton>

      <p className="text-muted-foreground text-xs">
        {deleted ? "Nothing was really deleted" : "Press and keep holding"}
      </p>
    </div>
  )
}

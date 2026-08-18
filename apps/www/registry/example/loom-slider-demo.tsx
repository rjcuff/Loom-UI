"use client"

import * as React from "react"

import { LoomSlider } from "@/registry/loomui/loom-slider"

export default function LoomSliderDemo() {
  const [value, setValue] = React.useState(50)

  return (
    <div className="w-full max-w-md px-6">
      <LoomSlider
        label="Thread tension"
        value={value}
        onValueChange={setValue}
      />
    </div>
  )
}

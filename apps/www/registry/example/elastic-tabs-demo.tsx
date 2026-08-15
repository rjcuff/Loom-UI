"use client"

import * as React from "react"

import { ElasticTabs } from "@/registry/loomui/elastic-tabs"

const ITEMS = [
  { value: "text", label: "Text" },
  { value: "backgrounds", label: "Backgrounds" },
  { value: "interaction", label: "Interaction" },
  { value: "sections", label: "Sections" },
]

const COPY: Record<string, string> = {
  text: "Headlines that arrive with something to say.",
  backgrounds: "Surfaces that move without asking to be looked at.",
  interaction: "Things that answer back when you touch them.",
  sections: "Whole blocks, not just the pieces they are cut from.",
}

export default function ElasticTabsDemo() {
  const [value, setValue] = React.useState("text")

  return (
    <div className="flex flex-col items-center gap-5">
      <ElasticTabs items={ITEMS} value={value} onValueChange={setValue} />
      <p className="text-muted-foreground text-sm">{COPY[value]}</p>
    </div>
  )
}

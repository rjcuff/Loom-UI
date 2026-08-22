"use client"

import * as React from "react"

/**
 * Every step in the scale, set in the scale. The metrics beside each line are
 * read off the rendered element rather than repeated from the stylesheet, so
 * the specimen cannot drift from what the tokens actually do.
 */
const STEPS = [
  { name: "text-2xs", sample: "Axis ticks and dense labels" },
  { name: "text-xs", sample: "Captions, legends, meta" },
  { name: "text-sm", sample: "Body copy in dense UI" },
  { name: "text-base", sample: "Body copy" },
  { name: "text-lg", sample: "Lead paragraph" },
  { name: "text-xl", sample: "Small heading" },
  { name: "text-2xl", sample: "Section heading" },
  { name: "text-3xl", sample: "Page heading" },
  { name: "text-4xl", sample: "Large heading" },
  { name: "text-display-sm", sample: "Headline on a phone" },
  { name: "text-display", sample: "Headline" },
  { name: "text-display-lg", sample: "Big headline" },
  { name: "text-5xl", sample: "Display" },
  { name: "text-6xl", sample: "Hero" },
] as const

function Row({ name, sample }: { name: string; sample: string }) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  const [metrics, setMetrics] = React.useState("")

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const style = getComputedStyle(node)
    const px = (value: string) => `${Math.round(parseFloat(value) * 100) / 100}`
    const tracking =
      style.letterSpacing === "normal" ? "0" : px(style.letterSpacing)
    setMetrics(
      `${px(style.fontSize)} / ${px(style.lineHeight)} / ${tracking}px`
    )
  }, [])

  // The clip lives on the row, not on the text. The display steps set a line
  // height tighter than the glyph box, so `overflow: hidden` on the text itself
  // slices the tops off the ascenders. On the row, the vertical padding absorbs
  // the overhang and only the width is ever cut.
  return (
    <div className="border-border flex flex-col gap-1 overflow-hidden border-b py-4 last:border-0 sm:flex-row sm:items-baseline sm:gap-6">
      <div className="flex shrink-0 items-baseline gap-3 sm:w-64">
        <code className="text-muted-foreground font-mono text-xs">{name}</code>
        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
          {metrics}
        </span>
      </div>
      <p ref={ref} className={`${name} min-w-0 font-medium whitespace-nowrap`}>
        {sample}
      </p>
    </div>
  )
}

export function TypeSpecimen() {
  return (
    <div className="not-prose border-border my-6 rounded-xl border px-4">
      {STEPS.map((step) => (
        <Row key={step.name} {...step} />
      ))}
    </div>
  )
}

/** The three weights, and the reason there are only three. */
export function WeightSpecimen() {
  return (
    <div className="not-prose border-border my-6 grid gap-4 rounded-xl border p-4 sm:grid-cols-3">
      {[
        { cls: "font-normal", name: "normal", value: 400 },
        { cls: "font-medium", name: "medium", value: 500 },
        { cls: "font-semibold", name: "semibold", value: 600 },
      ].map((weight) => (
        <div key={weight.name}>
          <p className={`${weight.cls} text-xl`}>Grid, then a spring</p>
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            font-{weight.name} · {weight.value}
          </p>
        </div>
      ))}
    </div>
  )
}

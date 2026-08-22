"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Solved rather than picked by eye.
 *
 * For each hue, the lightness is the highest one that still clears 4.5:1
 * against the real `--accent-foreground`, and the chroma is as much as sRGB
 * will hold at that lightness. That is what keeps them vivid: one lightness and
 * chroma applied to every hue has to be set low enough for the worst case, and
 * every other hue then pays for it by going chalky.
 *
 * Dark steps are lighter and less saturated. The same value on a dark surface
 * vibrates, and it no longer has to carry light text.
 */
const HUES = [
  { name: "Teal", h: 200, l: 0.543, c: 0.09, dl: 0.69, dc: 0.072 },
  { name: "Green", h: 150, l: 0.538, c: 0.144, dl: 0.69, dc: 0.115 },
  { name: "Blue", h: 250, l: 0.555, c: 0.153, dl: 0.71, dc: 0.122 },
  { name: "Indigo", h: 280, l: 0.575, c: 0.231, dl: 0.73, dc: 0.141 },
  { name: "Violet", h: 305, l: 0.59, c: 0.275, dl: 0.74, dc: 0.164 },
  { name: "Pink", h: 350, l: 0.585, c: 0.237, dl: 0.74, dc: 0.189 },
  { name: "Red", h: 27, l: 0.583, c: 0.231, dl: 0.73, dc: 0.159 },
  { name: "Orange", h: 55, l: 0.565, c: 0.136, dl: 0.72, dc: 0.109 },
] as const

type Hue = (typeof HUES)[number]

const css = (l: number, c: number, h: number) => `oklch(${l} ${c} ${h})`

export function AccentPicker() {
  const [picked, setPicked] = React.useState<Hue | null>(null)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    const root = document.documentElement
    if (!picked) {
      root.style.removeProperty("--accent")
      root.style.removeProperty("--ring")
      return
    }
    const dark = root.classList.contains("dark")
    const value = dark
      ? css(picked.dl, picked.dc, picked.h)
      : css(picked.l, picked.c, picked.h)
    root.style.setProperty("--accent", value)
    root.style.setProperty("--ring", value)
  }, [picked])

  // Never leave an override behind on the rest of the docs.
  React.useEffect(
    () => () => {
      document.documentElement.style.removeProperty("--accent")
      document.documentElement.style.removeProperty("--ring")
    },
    []
  )

  const snippet = picked
    ? `:root {\n  --accent: ${css(picked.l, picked.c, picked.h)};\n  --ring: ${css(picked.l, picked.c, picked.h)};\n}\n\n.dark {\n  --accent: ${css(picked.dl, picked.dc, picked.h)};\n  --ring: ${css(picked.dl, picked.dc, picked.h)};\n}`
    : null

  const copy = async () => {
    if (!snippet) return
    await navigator.clipboard.writeText(snippet)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="not-prose border-border my-6 overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center gap-2 p-4">
        {HUES.map((hue) => (
          <button
            key={hue.h}
            type="button"
            onClick={() => setPicked(hue)}
            aria-label={hue.name}
            aria-pressed={picked?.h === hue.h}
            title={hue.name}
            className={cn(
              "ease-out-quart size-8 rounded-full transition-transform duration-150",
              "hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              picked?.h === hue.h && "ring-foreground ring-2 ring-offset-2"
            )}
            style={{ background: css(hue.l, hue.c, hue.h) }}
          />
        ))}

        <button
          type="button"
          onClick={() => setPicked(null)}
          className="text-muted-foreground hover:text-foreground ml-auto text-xs underline underline-offset-4"
        >
          Reset
        </button>
      </div>

      {snippet ? (
        <div className="border-border border-t">
          <div className="flex items-center justify-between gap-3 px-4 py-2">
            <span className="text-muted-foreground font-mono text-xs">
              Paste into your globals.css
            </span>
            <button
              type="button"
              onClick={copy}
              className="border-border hover:bg-muted rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="text-muted-foreground overflow-x-auto px-4 pb-4 font-mono text-xs leading-relaxed">
            {snippet}
          </pre>
        </div>
      ) : null}
    </div>
  )
}

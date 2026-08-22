"use client"

import * as React from "react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { ElasticTabs } from "@/registry/loomui/elastic-tabs"

export interface BlockEntry {
  name: string
  title: string
  description: string
  category: string
  /** Frame height in pixels. Blocks are pages and are not all one length. */
  height: number
}

const VIEWPORTS = [
  { label: "Desktop", value: 0, paths: ["M2 3h12v8H2z", "M6 13h4"] },
  { label: "Tablet", value: 768, paths: ["M4 2h8v12H4z", "M7 12.5h2"] },
  { label: "Phone", value: 390, paths: ["M5 2h6v12H5z", "M7 12.5h2"] },
] as const

function Glyph({ paths }: { paths: readonly string[] }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

function InstallCommand({ name }: { name: string }) {
  const [copied, setCopied] = React.useState(false)
  const command = `npx shadcn@latest add ${siteConfig.registry.namespace}/${name}`

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(command)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
      className="border-border hover:bg-muted ease-out-quart hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs transition-colors duration-150 lg:inline-flex"
    >
      <span className="text-muted-foreground">$</span>
      <span className="text-muted-foreground">
        {copied ? "Copied to clipboard" : command}
      </span>
    </button>
  )
}

function Block({ entry }: { entry: BlockEntry }) {
  const [width, setWidth] = React.useState(0)
  const [nonce, setNonce] = React.useState(0)

  return (
    <section aria-labelledby={`${entry.name}-title`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${entry.name}-title`} className="text-sm font-medium">
            {entry.title}
          </h2>
          <p className="text-muted-foreground mt-0.5 max-w-2xl text-sm text-pretty">
            {entry.description}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <InstallCommand name={entry.name} />

          <div className="border-border flex items-center rounded-lg border p-0.5">
            {VIEWPORTS.map((viewport) => (
              <button
                key={viewport.label}
                type="button"
                onClick={() => setWidth(viewport.value)}
                aria-label={viewport.label}
                aria-pressed={width === viewport.value}
                title={viewport.label}
                className={cn(
                  "ease-out-quart grid size-7 place-items-center rounded-md transition-colors duration-150",
                  width === viewport.value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Glyph paths={viewport.paths} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            aria-label="Replay"
            title="Replay"
            className="border-border text-muted-foreground hover:text-foreground ease-out-quart grid size-8 place-items-center rounded-lg border transition-colors duration-150"
          >
            <Glyph
              paths={["M13.5 8a5.5 5.5 0 1 1-1.6-3.9", "M13.5 2.5v3h-3"]}
            />
          </button>

          <a
            href={`/view/${entry.name}`}
            target="_blank"
            rel="noreferrer"
            className="border-border hover:bg-muted ease-out-quart rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors duration-150"
          >
            Open
          </a>
        </div>
      </div>

      {/* An iframe rather than a div. A block is a page: it brings its own
          heading order and its own full-height background, and inlining that
          would put a second `h1` inside this page's outline and let this
          stylesheet reach into it. */}
      <div className="border-border bg-muted/40 mt-3 grid place-items-center overflow-hidden rounded-xl border p-0 sm:p-4">
        <iframe
          // Remounted per width and per replay, so the scroll-triggered
          // reveals run again at the size you just asked to see.
          key={`${width}-${nonce}`}
          src={`/view/${entry.name}`}
          title={entry.title}
          loading="lazy"
          className="bg-background ease-out-quart w-full border-0 transition-[max-width] duration-300 sm:rounded-lg"
          style={{ height: entry.height, maxWidth: width || "100%" }}
        />
      </div>
    </section>
  )
}

/**
 * One block at a time, picked by a tab.
 *
 * Four blocks stacked on one page is four iframes, four sets of scroll
 * animations and a scrollbar nobody reaches the end of. The tabs are the
 * navigation, so only the chosen block is in the DOM at all.
 */
export function BlockBrowser({ blocks }: { blocks: BlockEntry[] }) {
  const [name, setName] = React.useState(blocks[0]?.name ?? "")
  const rail = React.useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = React.useState(false)

  // A tab sliced off at the edge reads as broken rather than as more to come.
  //
  // The scroller is the tab group itself, not this wrapper: ElasticTabs is
  // `max-w-full overflow-x-auto`, so the wrapper never overflows and measuring
  // it always said no. Measured rather than assumed, so the fade is never
  // painted over the last tab when everything already fits.
  React.useEffect(() => {
    const node = rail.current?.querySelector<HTMLElement>(
      "[data-slot='elastic-tabs']"
    )
    if (!node || typeof ResizeObserver === "undefined") return

    const read = () => setOverflowing(node.scrollWidth > node.clientWidth + 1)
    read()

    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [blocks])

  const items = React.useMemo(
    () => blocks.map((block) => ({ value: block.name, label: block.title })),
    [blocks]
  )

  const active = blocks.find((block) => block.name === name) ?? blocks[0]
  if (!active) return null

  return (
    <>
      {/* The pill stretches across both tabs before it lands on the one you
          picked, which is the whole reason this is not three buttons. */}
      <div ref={rail} className="flex justify-start">
        <ElasticTabs
          items={items}
          value={active.name}
          onValueChange={setName}
          className={cn(
            "no-scrollbar",
            overflowing &&
              "[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)]"
          )}
        />
      </div>

      {/* Keyed on the block, so switching replays its arrival rather than
          swapping the iframe's `src` under a frame that is already settled. */}
      <div key={active.name} className="animate-rise mt-8">
        <Block entry={active} />
      </div>
    </>
  )
}

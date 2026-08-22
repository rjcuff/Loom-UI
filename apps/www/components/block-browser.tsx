"use client"

import * as React from "react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export interface BlockEntry {
  name: string
  title: string
  description: string
  category: string
  /** Frame height in pixels. Blocks are pages and are not all one length. */
  height: number
}

const VIEWPORTS = [
  { label: "Desktop", value: 0, icon: "M2 3h12v8H2z M6 13h4" },
  { label: "Tablet", value: 768, icon: "M4 2h8v12H4z M7 12.5h2" },
  { label: "Phone", value: 390, icon: "M5 2h6v12H5z M7 12.5h2" },
] as const

function ViewportIcon({ path }: { path: string }) {
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
      {path.split(" M").map((segment, index) => (
        <path key={index} d={index === 0 ? segment : `M${segment}`} />
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
    <section
      id={entry.name}
      aria-labelledby={`${entry.name}-title`}
      className="scroll-mt-24"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id={`${entry.name}-title`} className="text-sm font-medium">
            {entry.title}
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm text-pretty">
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
                <ViewportIcon path={viewport.icon} />
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
              <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9" />
              <path d="M13.5 2.5v3h-3" />
            </svg>
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

export function BlockBrowser({ blocks }: { blocks: BlockEntry[] }) {
  const categories = React.useMemo(
    () => ["All", ...new Set(blocks.map((block) => block.category))],
    [blocks]
  )
  const [active, setActive] = React.useState("All")

  const shown =
    active === "All"
      ? blocks
      : blocks.filter((block) => block.category === active)

  return (
    <>
      <div className="border-border/60 sticky top-0 z-20 -mx-5 border-b px-5 backdrop-blur">
        <div className="bg-background/80 no-scrollbar -mx-5 flex gap-1 overflow-x-auto px-5 py-3">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={active === category}
              className={cn(
                "ease-out-quart shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors duration-150",
                active === category
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-14">
        {shown.map((block) => (
          <Block key={block.name} entry={block} />
        ))}
      </div>
    </>
  )
}

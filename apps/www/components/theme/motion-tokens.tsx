"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Runs once when the block is scrolled to, and again on pointer enter.
 *
 * The same arrival every chart and backdrop here uses. A button labelled "play"
 * is a worse version of this: it asks the reader to operate the page before the
 * page has shown them anything.
 */
function useReplay<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [run, setRun] = React.useState(0)

  React.useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setRun(1)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRun((n) => n + 1)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, run, replay: () => setRun((n) => n + 1) }
}

const CURVES = [
  {
    name: "ease-out-quad",
    points: [0.25, 0.46, 0.45, 0.94],
    use: "Weakest ease-out",
  },
  {
    name: "ease-out-cubic",
    points: [0.215, 0.61, 0.355, 1],
    use: "Gentle entrance",
  },
  {
    name: "ease-out-quart",
    points: [0.165, 0.84, 0.44, 1],
    use: "The house default",
  },
  {
    name: "ease-out-expo",
    points: [0.19, 1, 0.22, 1],
    use: "Leaves hard, lands soft",
  },
  {
    name: "ease-in-out-cubic",
    points: [0.645, 0.045, 0.355, 1],
    use: "Already on screen, moving",
  },
  {
    name: "ease-in-out-quart",
    points: [0.77, 0, 0.175, 1],
    use: "Stronger version of the above",
  },
  {
    name: "ease-drawer",
    points: [0.32, 0.72, 0, 1],
    use: "Most of the distance up front",
  },
] as const

/** The curve itself, drawn in its own unit square. */
function Curve({ points }: { points: readonly number[] }) {
  const [x1, y1, x2, y2] = points
  // SVG y runs downward, so every y is flipped to read the way the curve is
  // usually drawn: progress climbing from the bottom left.
  const d = `M 0 100 C ${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`

  return (
    <svg viewBox="-6 -6 112 112" className="size-full" aria-hidden>
      <path
        d="M 0 100 L 100 100 M 0 100 L 0 0"
        className="stroke-border"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M 0 100 L 100 0"
        className="stroke-border"
        strokeWidth="1"
        strokeDasharray="3 3"
        fill="none"
      />
      <path
        d={d}
        className="stroke-accent"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CurveCard({
  name,
  points,
  use,
}: {
  name: string
  points: readonly number[]
  use: string
}) {
  const { ref, run, replay } = useReplay<HTMLDivElement>()

  return (
    <div
      ref={ref}
      onPointerEnter={replay}
      className="border-border hover:border-muted-foreground/40 ease-out-quart rounded-xl border p-4 transition-colors duration-150"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <code className="font-mono text-xs">{name}</code>
          <p className="text-muted-foreground mt-0.5 text-xs">{use}</p>
        </div>
        <div className="size-12 shrink-0">
          <Curve points={points} />
        </div>
      </div>

      {/* The dot is the point. A curve on a graph is a shape; a dot travelling
          under it is what the curve actually feels like.

          A container, so the `cqw` the keyframe travels by resolves against
          this track. Without it the unit falls back to the viewport and the dot
          leaves the box entirely. */}
      <div className="bg-muted [container-type:inline-size] relative mt-4 h-8 overflow-hidden rounded-lg">
        <span
          key={run}
          className="bg-accent absolute top-1/2 size-5 -translate-y-1/2 rounded-full"
          style={{
            animation: run
              ? `theme-token-travel 900ms var(--${name}) both`
              : undefined,
            left: 6,
          }}
        />
      </div>
    </div>
  )
}

export function EasingGallery() {
  return (
    <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
      {CURVES.map((curve) => (
        <CurveCard key={curve.name} {...curve} />
      ))}
    </div>
  )
}

const DURATIONS = [
  { token: "duration-micro", ms: 120, use: "Micro-interactions" },
  { token: "duration-ui", ms: 180, use: "Tooltips, dropdowns" },
  { token: "duration-panel", ms: 260, use: "Modals, drawers" },
  { token: "duration-page", ms: 360, use: "Page transitions" },
  { token: "duration-marketing", ms: 600, use: "Marketing entrances" },
] as const

/**
 * The scale, raced against itself. Reading "180ms" tells you nothing; watching
 * 180 next to 600 tells you which one a dropdown should use.
 */
export function DurationScale() {
  const { ref, run, replay } = useReplay<HTMLDivElement>()

  return (
    <div
      ref={ref}
      onPointerEnter={replay}
      className="not-prose border-border my-6 space-y-3 rounded-xl border p-4"
    >
      {DURATIONS.map((entry) => (
        <div key={entry.token} className="flex items-center gap-3">
          <code className="text-muted-foreground w-40 shrink-0 font-mono text-xs">
            {entry.token}
          </code>
          <div className="bg-muted relative h-6 min-w-0 flex-1 overflow-hidden rounded-md">
            <span
              key={run}
              className="bg-accent absolute inset-y-0 left-0 w-full origin-left rounded-md"
              style={{
                animation: run
                  ? `theme-token-fill ${entry.ms}ms var(--ease-out-quart) both`
                  : undefined,
                transform: run ? undefined : "scaleX(0)",
              }}
            />
          </div>
          <span className="text-muted-foreground hidden w-40 shrink-0 text-right text-xs sm:block">
            {entry.use}
          </span>
          <span className="text-muted-foreground w-14 shrink-0 text-right text-xs tabular-nums">
            {entry.ms}ms
          </span>
        </div>
      ))}
    </div>
  )
}

/** The three elevation steps, on the surface they are drawn for. */
export function ElevationScale() {
  return (
    <div className="not-prose my-6 grid gap-6 sm:grid-cols-3">
      {[
        { token: "shadow-raised", use: "A card lifting off the page" },
        { token: "shadow-overlay", use: "Dropdowns, popovers" },
        { token: "shadow-panel", use: "Drawers, dialogs" },
      ].map((step) => (
        <div key={step.token} className="text-center">
          <div
            className={cn(
              "bg-card grid h-24 place-items-center rounded-xl",
              step.token
            )}
          >
            <code className="font-mono text-xs">{step.token}</code>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">{step.use}</p>
        </div>
      ))}
    </div>
  )
}

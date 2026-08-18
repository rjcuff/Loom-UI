"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useInViewport } from "@/registry/lib/use-in-viewport"

export interface CreditCardProps extends React.ComponentProps<"div"> {
  /** Which face to draw. Pair the two inside a flip card to turn it over. */
  side?: "front" | "back"
  /** Number across the face. Grouped however you write it. */
  number?: string
  /** Name along the bottom. */
  holder?: string
  /** Expiry along the bottom. */
  expiry?: string
  /** Security code on the back. */
  cvv?: string
  /** Name in the top left. */
  issuer?: React.ReactNode
  /** Mark in the bottom right. Leave it out for the placeholder rings. */
  brand?: React.ReactNode
  /** Show only the last four digits. */
  masked?: boolean
  /** Colours of the aurora drifting under the face. One blob per colour. */
  colors?: string[]
  /** Seconds for one drift of a single blob. */
  duration?: number
  /** Render the face still, with no drift. */
  disabled?: boolean
}

const DEFAULT_COLORS = ["#22d3ee", "#6366f1", "#c084fc", "#14b8a6"]

/**
 * Fixed rather than random. A card is one frame, and four blobs placed by hand
 * cover it better than four that happen to land in the same corner.
 */
const BLOB_LAYOUT = [
  { size: 78, x: 12, y: 18, speed: 1, delay: 0 },
  { size: 66, x: 82, y: 26, speed: 1.35, delay: -6 },
  { size: 88, x: 68, y: 88, speed: 0.85, delay: -11 },
  { size: 58, x: 34, y: 76, speed: 1.6, delay: -3 },
]

/** Keeps the last four and turns the rest into bullets, groups intact. */
function maskNumber(number: string) {
  const digits = number.replace(/\D/g, "")
  const hidden = Math.max(digits.length - 4, 0)
  let seen = 0

  return number.replace(/\d/g, (digit) => {
    seen += 1
    return seen <= hidden ? "•" : digit
  })
}

/** The contact plate. Drawn rather than shipped as an image so it stays sharp. */
function Chip() {
  return (
    <svg
      viewBox="0 0 40 30"
      aria-hidden="true"
      className="h-6 w-8 drop-shadow-sm sm:h-8 sm:w-11"
    >
      <rect
        width="40"
        height="30"
        rx="5"
        fill="url(#loom-card-chip)"
        stroke="rgba(0,0,0,0.18)"
      />
      <g stroke="rgba(0,0,0,0.28)" strokeWidth="1" fill="none">
        <path d="M14 0v30M26 0v30M0 11h14M26 11h14M0 19h14M26 19h14" />
      </g>
      <defs>
        <linearGradient id="loom-card-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e7bd" />
          <stop offset="45%" stopColor="#d9b466" />
          <stop offset="100%" stopColor="#f2dfae" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** The contactless arcs. */
function Contactless() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-4 opacity-80 sm:size-6"
    >
      <path d="M8 5.5a9 9 0 0 1 0 13" />
      <path d="M12 3a13 13 0 0 1 0 18" />
      <path d="M4 8.5a5 5 0 0 1 0 7" />
    </svg>
  )
}

/** Stands in for a network mark without pretending to be one. */
function PlaceholderBrand() {
  return (
    <span aria-hidden="true" className="flex items-center">
      <span className="size-5 rounded-full bg-white/70 sm:size-7" />
      <span className="-ml-2 size-5 rounded-full bg-white/35 sm:-ml-3 sm:size-7" />
    </span>
  )
}

/**
 * A placeholder payment card. Nothing here is real and no real mark is drawn,
 * so it is safe in a mockup. One face per render, so wrap two in a `FlipCard` for
 * a card that turns.
 */
export function CreditCard({
  side = "front",
  number = "4242 4242 4242 4242",
  holder = "A. Placeholder",
  expiry = "04/29",
  cvv = "123",
  issuer = "Loom",
  brand,
  masked = false,
  colors = DEFAULT_COLORS,
  duration = 16,
  disabled = false,
  className,
  style,
  ...props
}: CreditCardProps) {
  const palette = colors.length > 0 ? colors : DEFAULT_COLORS
  const shown = masked ? maskNumber(number) : number

  const root = React.useRef<HTMLDivElement>(null)
  const onScreen = useInViewport(root)

  return (
    <div
      ref={root}
      data-slot="credit-card"
      data-side={side}
      className={cn(
        "relative isolate aspect-[1.586] w-full max-w-[26rem] overflow-hidden rounded-2xl bg-neutral-950 text-white shadow-xl ring-1 ring-white/15 select-none",
        className
      )}
      style={style}
      {...props}
    >
      {/* The aurora. Blobs sit well inside the face and drift across it, each
          on its own cycle so the wash never reads as a loop. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {palette.map((color, index) => {
          const blob = BLOB_LAYOUT[index % BLOB_LAYOUT.length]
          return (
            <span
              key={`${color}-${index}`}
              className={cn(
                "absolute rounded-full opacity-70 blur-2xl",
                !disabled && "animate-aurora-drift motion-reduce:animate-none",
                !onScreen && "[animation-play-state:paused]"
              )}
              style={{
                width: `${blob.size}%`,
                height: `${blob.size}%`,
                left: `${blob.x}%`,
                top: `${blob.y}%`,
                translate: "-50% -50%",
                background: `radial-gradient(closest-side, ${color}, transparent)`,
                animationDuration: `${duration * blob.speed}s`,
                animationDelay: `${blob.delay}s`,
              }}
            />
          )
        })}
      </span>

      {/* Glass over the colour, which is what gives the face its plastic edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/20 via-transparent to-black/30"
      />

      {side === "front" ? (
        <div className="relative flex h-full flex-col justify-between p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase sm:text-sm">
              {issuer}
            </span>
            <Contactless />
          </div>

          <div className="flex flex-col gap-2.5 sm:gap-4">
            <Chip />
            {/* Tighter tracking on a phone: the number is the widest thing on
                the face and it has to hold one line at any card width. */}
            <div className="font-mono text-sm tracking-[0.1em] tabular-nums drop-shadow-sm sm:text-xl sm:tracking-[0.16em]">
              {shown}
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="text-[0.5rem] tracking-[0.18em] uppercase opacity-60 sm:text-[0.6rem]">
                Card holder
              </div>
              <div className="truncate text-xs font-medium tracking-wide uppercase sm:text-sm">
                {holder}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className="text-[0.5rem] tracking-[0.18em] uppercase opacity-60 sm:text-[0.6rem]">
                Expires
              </div>
              <div className="text-xs font-medium tabular-nums sm:text-sm">
                {expiry}
              </div>
            </div>

            {brand ?? <PlaceholderBrand />}
          </div>
        </div>
      ) : (
        <div className="relative flex h-full flex-col">
          <span
            aria-hidden="true"
            className="mt-5 h-9 w-full bg-black/85 sm:mt-7 sm:h-11"
          />

          <div className="flex items-center gap-2.5 px-4 pt-4 sm:gap-3 sm:px-6 sm:pt-5">
            {/* The signature panel: a light strip with the code sitting on it,
                the way it is printed rather than the way it is styled. */}
            <span
              aria-hidden="true"
              className="h-7 flex-1 rounded-sm bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.9)_0_6px,rgba(226,232,240,0.9)_6px_12px)] sm:h-9"
            />
            <span className="rounded-sm bg-white px-2 py-0.5 font-mono text-xs text-neutral-900 tabular-nums sm:px-2.5 sm:py-1 sm:text-sm">
              {cvv}
            </span>
          </div>

          <div className="mt-auto flex items-end justify-between p-4 sm:p-6">
            <p className="max-w-[60%] text-[0.5rem] leading-relaxed opacity-60 sm:text-[0.6rem]">
              Not a real card. For layout and demonstration only.
            </p>
            {brand ?? <PlaceholderBrand />}
          </div>
        </div>
      )}
    </div>
  )
}

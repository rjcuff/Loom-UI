"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TicketStubProps extends React.ComponentProps<"div"> {
  /** The torn-off part. Sits after the perforation. */
  stub?: React.ReactNode
  /** Where the perforation falls, as a percentage of the long side. */
  split?: number
  /** Radius of the notches bitten out at each end of the tear, in pixels. */
  notch?: number
  /** Stub on the right of a wide ticket, or below a tall one. */
  orientation?: "horizontal" | "vertical"
  /** Lift the ticket off the page on hover. */
  lift?: boolean
}

export function TicketStub({
  children,
  stub,
  split = 68,
  notch = 12,
  orientation = "horizontal",
  lift = true,
  className,
  style,
  ...props
}: TicketStubProps) {
  const vertical = orientation === "vertical"

  // Two circles cut out of the same shape. Intersecting the masks is what takes
  // a bite from both ends of the tear instead of only the last one declared.
  const mask = vertical
    ? `radial-gradient(circle at left ${split}%, transparent ${notch}px, #000 ${notch + 0.5}px), radial-gradient(circle at right ${split}%, transparent ${notch}px, #000 ${notch + 0.5}px)`
    : `radial-gradient(circle at ${split}% top, transparent ${notch}px, #000 ${notch + 0.5}px), radial-gradient(circle at ${split}% bottom, transparent ${notch}px, #000 ${notch + 0.5}px)`

  // Everything the edge is made of lives out here. A `box-shadow` or a `border`
  // on the masked element is cut away with the paper, which leaves the notches
  // unoutlined — and on a dark background an edge drawn only in shadow is not
  // an edge at all. Four offset drop shadows trace the alpha instead, so the
  // outline follows the curve of every bite.
  const edge = [
    "drop-shadow(0 1px 0 var(--border))",
    "drop-shadow(0 -1px 0 var(--border))",
    "drop-shadow(1px 0 0 var(--border))",
    "drop-shadow(-1px 0 0 var(--border))",
    "drop-shadow(0 4px 10px rgb(0 0 0 / 0.14))",
  ].join(" ")

  return (
    <div
      data-slot="ticket-stub"
      className={cn(
        "relative",
        lift &&
          "transition-transform duration-300 ease-[var(--ease-out-quart)] hover:-translate-y-1 hover:rotate-[-0.4deg] motion-reduce:transition-none",
        className
      )}
      style={{ filter: edge, ...style }}
      {...props}
    >
      <div
        className={cn(
          "bg-card text-card-foreground flex overflow-hidden rounded-xl",
          vertical ? "h-full flex-col" : "w-full flex-row"
        )}
        style={{
          WebkitMaskImage: mask,
          maskImage: mask,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        <div
          style={vertical ? { height: `${split}%` } : { width: `${split}%` }}
        >
          {children}
        </div>
        <div className="flex-1">{stub}</div>
      </div>

      {/* The perforation. Inset by the notch radius at both ends so it starts
          where the paper does. */}
      <span
        aria-hidden="true"
        className={cn(
          "border-muted-foreground/40 absolute border-dashed",
          vertical ? "border-t" : "border-l"
        )}
        style={
          vertical
            ? { top: `${split}%`, left: notch, right: notch }
            : { left: `${split}%`, top: notch, bottom: notch }
        }
      />
    </div>
  )
}

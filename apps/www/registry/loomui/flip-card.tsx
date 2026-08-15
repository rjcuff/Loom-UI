"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface FlipCardProps extends Omit<
  React.ComponentProps<"button">,
  "content"
> {
  /** Face shown at rest. It sets the card's size; the back is laid over it. */
  front: React.ReactNode
  /** Face shown once the card is turned. */
  back: React.ReactNode
  /** Turn the card yourself. Leave it out to let the card own its state. */
  flipped?: boolean
  /** Starting face when the card owns its state. */
  defaultFlipped?: boolean
  /** Called with the face the card is turning to. */
  onFlippedChange?: (flipped: boolean) => void
  /** Turn around the vertical axis (`y`) or the horizontal one (`x`). */
  axis?: "x" | "y"
  /** Length of the turn in milliseconds. */
  duration?: number
  /** How much perspective the turn is drawn with, in pixels. Lower is deeper. */
  depth?: number
}

const FACE = "absolute inset-0 [backface-visibility:hidden]"

export function FlipCard({
  front,
  back,
  flipped,
  defaultFlipped = false,
  onFlippedChange,
  axis = "y",
  duration = 480,
  depth = 900,
  className,
  disabled,
  onClick,
  style,
  ...props
}: FlipCardProps) {
  const [ownFlipped, setOwnFlipped] = React.useState(defaultFlipped)
  const isControlled = flipped !== undefined
  const isFlipped = isControlled ? flipped : ownFlipped

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)

    if (event.defaultPrevented || disabled) {
      return
    }

    const next = !isFlipped
    if (!isControlled) {
      setOwnFlipped(next)
    }
    onFlippedChange?.(next)
  }

  const turn = axis === "x" ? "rotateX" : "rotateY"

  return (
    // A real button, so the card is reachable by keyboard and announces its
    // state. `aria-pressed` is the honest mapping: this is a toggle, not a
    // link to somewhere else.
    <button
      type="button"
      data-slot="flip-card"
      data-flipped={isFlipped ? "" : undefined}
      aria-pressed={isFlipped}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "group relative block text-left",
        !disabled && "cursor-pointer",
        className
      )}
      style={{ perspective: `${depth}px`, ...style }}
      {...props}
    >
      <span
        className="relative block h-full w-full transition-transform ease-[var(--ease-back-out)] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{
          transitionDuration: `${duration}ms`,
          transform: isFlipped ? `${turn}(180deg)` : undefined,
        }}
      >
        {/* The front sits in flow and gives the card its size. Both faces are
            in the DOM the whole time, so the hidden one is taken out of the
            accessible name rather than left to be read through the card. */}
        <span
          className="relative block [backface-visibility:hidden]"
          aria-hidden={isFlipped || undefined}
        >
          {front}
        </span>

        <span
          className={FACE}
          style={{ transform: `${turn}(180deg)` }}
          aria-hidden={!isFlipped || undefined}
        >
          {back}
        </span>
      </span>
    </button>
  )
}

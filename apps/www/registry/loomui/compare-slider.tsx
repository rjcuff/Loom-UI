"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CompareSliderProps extends Omit<
  React.ComponentProps<"div">,
  "onChange"
> {
  /** Sits in flow and sets the size of the frame. Shown before the divider. */
  before: React.ReactNode
  /** Laid over the top and clipped to after the divider. */
  after: React.ReactNode
  /** Divider position, 0 to 100. Leave it out to let the slider own it. */
  position?: number
  /** Starting position when the slider owns it. */
  defaultPosition?: number
  /** Called with the position the divider moved to. */
  onPositionChange?: (position: number) => void
  /** Split left to right, or top to bottom. */
  orientation?: "horizontal" | "vertical"
  /** Percent moved per arrow key. Shift moves five of these. */
  step?: number
  /** Name for the divider, which is a real slider. */
  label?: string
}

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)

export function CompareSlider({
  before,
  after,
  position,
  defaultPosition = 50,
  onPositionChange,
  orientation = "horizontal",
  step = 2,
  label = "Compare",
  className,
  style,
  ...props
}: CompareSliderProps) {
  const [own, setOwn] = React.useState(defaultPosition)
  const [dragging, setDragging] = React.useState(false)
  const frameRef = React.useRef<HTMLDivElement>(null)

  const isControlled = position !== undefined
  const value = clamp(isControlled ? position : own)
  const vertical = orientation === "vertical"

  const commit = (next: number) => {
    const clamped = clamp(next)
    if (!isControlled) {
      setOwn(clamped)
    }
    onPositionChange?.(clamped)
  }

  const trackPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current
    if (!frame) {
      return
    }
    const rect = frame.getBoundingClientRect()
    const ratio = vertical
      ? (event.clientY - rect.top) / rect.height
      : (event.clientX - rect.left) / rect.width
    commit(ratio * 100)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const distance = event.shiftKey ? step * 5 : step
    const back = vertical ? "ArrowUp" : "ArrowLeft"
    const forward = vertical ? "ArrowDown" : "ArrowRight"

    if (event.key === back) {
      commit(value - distance)
    } else if (event.key === forward) {
      commit(value + distance)
    } else if (event.key === "Home") {
      commit(0)
    } else if (event.key === "End") {
      commit(100)
    } else {
      return
    }

    event.preventDefault()
  }

  return (
    <div
      ref={frameRef}
      data-slot="compare-slider"
      data-dragging={dragging ? "" : undefined}
      className={cn(
        "group/compare relative isolate overflow-hidden select-none",
        className
      )}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        setDragging(true)
        trackPointer(event)
      }}
      onPointerMove={(event) => {
        if (dragging) {
          trackPointer(event)
        }
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId)
        setDragging(false)
      }}
      onPointerCancel={() => setDragging(false)}
      style={{
        // Block only the axis the divider travels on, so the page can still be
        // scrolled with a finger that lands on the frame.
        touchAction: vertical ? "pan-x" : "pan-y",
        ...style,
      }}
      {...props}
    >
      <div className="h-full w-full">{before}</div>

      <div
        className="absolute inset-0"
        style={{
          clipPath: vertical
            ? `inset(${value}% 0 0 0)`
            : `inset(0 0 0 ${value}%)`,
        }}
      >
        {after}
      </div>

      <div
        // A real slider, so the comparison is reachable without a pointer. The
        // value is the divider's position, which is the only thing to move.
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-orientation={orientation}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "group/handle absolute z-10 flex items-center justify-center outline-none",
          vertical
            ? "inset-x-0 h-0 cursor-ns-resize"
            : "inset-y-0 w-0 cursor-ew-resize",
          // Only glide for keys. During a drag the divider has to sit exactly
          // under the finger or it feels like it is being towed.
          !dragging &&
            "transition-[left,top] duration-200 ease-[var(--ease-out-quart)] motion-reduce:transition-none"
        )}
        style={vertical ? { top: `${value}%` } : { left: `${value}%` }}
      >
        <span
          aria-hidden="true"
          className={cn(
            "bg-background/90 absolute",
            vertical ? "inset-x-0 h-0.5" : "inset-y-0 w-0.5"
          )}
        />
        <span
          data-slot="compare-slider-knob"
          aria-hidden="true"
          className="bg-background text-foreground ring-ring/60 relative grid size-8 place-items-center rounded-full border shadow-sm group-focus-visible/handle:ring-2"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("size-4", vertical && "rotate-90")}
          >
            <path d="m9 6-4 6 4 6" />
            <path d="m15 6 4 6-4 6" />
          </svg>
        </span>
      </div>
    </div>
  )
}

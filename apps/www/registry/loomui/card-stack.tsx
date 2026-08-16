"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface CardStackProps extends React.ComponentProps<"div"> {
  /** Pixels from the top of the viewport where the first card pins. */
  offset?: number
  /** Pixels of the card below that stay visible once it is covered. */
  peek?: number
  /**
   * How much a fully covered card shrinks, as a fraction of its size. Off by
   * default: it only reads as depth when `peek` is large enough to show a real
   * strip of the card behind.
   */
  scale?: number
  /** How much a fully covered card fades, from 0 to 1. */
  dim?: number
  /** Pixels of scroll the last card stays pinned for once it lands. */
  tail?: number
  /** Pin the cards but leave them at full size and opacity. */
  disabled?: boolean
}

/** Smoothstep. Eases the start and the end of the burial. */
function smooth(t: number) {
  return t * t * (3 - 2 * t)
}

/**
 * Sticky positions itself against the nearest scrolling ancestor, not always
 * the page, so the measurements have to be taken against that same box or a
 * stack inside a scrolling panel would be measured against a viewport it never
 * moves through.
 */
function findScrollport(node: HTMLElement) {
  let parent = node.parentElement
  while (parent) {
    const overflow = getComputedStyle(parent).overflowY
    if (overflow === "auto" || overflow === "scroll") {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

/**
 * Each card is pinned a little lower than the one before it, so a covered card
 * keeps a strip of itself on screen and the stack reads as a stack.
 *
 * A card's progress is measured from the card *after* it, because a pinned card
 * stops moving: how far it is buried is only knowable from what is burying it.
 */
export function CardStack({
  children,
  className,
  offset = 96,
  peek = 14,
  scale = 0,
  dim = 0.12,
  tail = 200,
  disabled = false,
  style,
  ...props
}: CardStackProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = ref.current
    if (!root) {
      return
    }

    const items = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>("[data-slot='card-stack-item']")
      )

    // The pin position is per card and never changes, so it is written once
    // rather than recomputed on every frame of every scroll.
    for (const [index, item] of items().entries()) {
      item.style.setProperty("--card-top", `${offset + index * peek}px`)
    }

    if (
      disabled ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      for (const item of items()) {
        item.style.setProperty("--card-progress", "0")
      }
      return
    }

    const port = findScrollport(root)
    let frame = 0

    const measure = () => {
      const list = items()
      const portTop = port ? port.getBoundingClientRect().top : 0
      const portHeight = port ? port.clientHeight : window.innerHeight

      for (const [index, item] of list.entries()) {
        const next = list[index + 1]
        if (!next) {
          item.style.setProperty("--card-progress", "0")
          continue
        }

        // Where the next card starts covering this one, and where it finishes.
        const end = offset + (index + 1) * peek
        const travelled =
          portHeight - (next.getBoundingClientRect().top - portTop)
        const total = portHeight - end
        const progress = total > 0 ? travelled / total : 0

        item.style.setProperty(
          "--card-progress",
          `${smooth(Math.min(Math.max(progress, 0), 1))}`
        )
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    const target: HTMLElement | Window = port ?? window
    measure()
    target.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      target.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [offset, peek, disabled])

  return (
    <div
      ref={ref}
      data-slot="card-stack"
      className={cn("relative", className)}
      style={
        {
          "--card-scale": `${scale}`,
          "--card-dim": `${dim}`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}

      {/* Room for the last card to hold its pin in. It has to be an element in
          the flow rather than padding on this wrapper: a sticky box is held
          inside its containing block's content box, so padding here would buy
          the scroll distance and then drag every pinned card up out of the
          stack at the end of it. */}
      {tail > 0 ? <div aria-hidden="true" style={{ height: tail }} /> : null}
    </div>
  )
}

export type CardStackItemProps = React.ComponentProps<"div">

export function CardStackItem({
  children,
  className,
  style,
  ...props
}: CardStackItemProps) {
  return (
    <div
      data-slot="card-stack-item"
      className={cn("sticky", className)}
      style={
        {
          top: "var(--card-top, 0px)",
          transformOrigin: "top center",
          scale: "calc(1 - var(--card-progress, 0) * var(--card-scale, 0))",
          opacity: "calc(1 - var(--card-progress, 0) * var(--card-dim, 0))",
          willChange: "scale, opacity",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

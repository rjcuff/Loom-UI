"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface BentoGridProps extends React.ComponentProps<"div"> {
  /** Milliseconds between one tile arriving and the next. */
  stagger?: number
  /** Run on mount instead of holding until the grid scrolls into view. */
  startOnView?: boolean
  /** Render the finished layout with no arrival. */
  disabled?: boolean
}

/**
 * The grid owns the arrival, not the tiles: it hands each tile its place in the
 * order, so tiles stay plain markup and can be composed, wrapped or reordered
 * without carrying an index around.
 */
export function BentoGrid({
  children,
  className,
  stagger = 70,
  startOnView = true,
  disabled = false,
  style,
  ...props
}: BentoGridProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(!startOnView)

  React.useEffect(() => {
    const root = ref.current
    if (!root) {
      return
    }

    for (const [index, tile] of Array.from(
      root.querySelectorAll<HTMLElement>("[data-slot='bento-card']")
    ).entries()) {
      tile.style.setProperty("--bento-delay", `${index * stagger}ms`)
    }
  }, [stagger, children])

  React.useEffect(() => {
    // Said rather than assumed. `active` is seeded from these on the first
    // render only, so turning either of them off afterwards left the tiles
    // waiting on an observer that this branch had already decided not to set
    // up, and they stayed at zero opacity for good.
    if (!startOnView || disabled) {
      setActive(true)
      return
    }

    const root = ref.current
    if (!root || typeof IntersectionObserver === "undefined") {
      setActive(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(root)
    return () => observer.disconnect()
  }, [startOnView, disabled])

  return (
    <div
      ref={ref}
      data-slot="bento-grid"
      data-active={disabled || active ? "" : undefined}
      className={cn(
        "group grid auto-rows-[minmax(9rem,auto)] grid-cols-1 gap-4 sm:grid-cols-3",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}

export interface BentoCardProps extends Omit<
  React.ComponentProps<"div">,
  "title"
> {
  /** Heading for the tile. */
  title?: React.ReactNode
  /** Supporting line under the title. */
  description?: React.ReactNode
  /** Mark shown above the title. A glyph or a small icon. */
  icon?: React.ReactNode
  /** Anything pinned to the bottom of the tile. A link, usually. */
  footer?: React.ReactNode
}

export function BentoCard({
  title,
  description,
  icon,
  footer,
  children,
  className,
  ...props
}: BentoCardProps) {
  return (
    <div
      data-slot="bento-card"
      className={cn(
        "border-border bg-card relative flex flex-col overflow-hidden rounded-xl border p-5",
        "ease opacity-0 transition-[border-color,translate] duration-200",
        "hover:border-muted-foreground/40 hover:-translate-y-0.5",
        // The tile is only allowed to arrive once the grid says the grid is on
        // screen, so a tile below the fold never plays to nobody.
        "group-data-[active]:animate-bento-rise",
        "motion-reduce:animate-none motion-reduce:opacity-100 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="text-muted-foreground mb-3 [&_svg]:size-5">{icon}</div>
      ) : null}

      {title ? (
        <h3 className="text-sm leading-none font-medium">{title}</h3>
      ) : null}

      {description ? (
        <p className="text-muted-foreground mt-2 text-sm">{description}</p>
      ) : null}

      {children}

      {footer ? <div className="mt-auto pt-4">{footer}</div> : null}
    </div>
  )
}

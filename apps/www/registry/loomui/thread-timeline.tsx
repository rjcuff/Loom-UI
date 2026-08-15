"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ThreadTimelineProps extends React.ComponentProps<"ol"> {
  /** Where the thread head sits in the viewport, 0 at the top, 1 at the bottom. */
  line?: number
}

export function ThreadTimeline({
  children,
  className,
  line = 0.55,
  style,
  ...props
}: ThreadTimelineProps) {
  const ref = React.useRef<HTMLOListElement>(null)

  React.useEffect(() => {
    const list = ref.current
    if (!list) {
      return
    }

    const settle = (progress: number, reached: boolean) => {
      list.style.setProperty("--thread-progress", `${progress}`)
      for (const item of list.querySelectorAll<HTMLElement>(
        "[data-slot='thread-timeline-item']"
      )) {
        item.toggleAttribute("data-reached", reached)
      }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      settle(1, true)
      return
    }

    let frame = 0

    const measure = () => {
      const head = window.innerHeight * line
      const rect = list.getBoundingClientRect()
      const progress = rect.height > 0 ? (head - rect.top) / rect.height : 1
      list.style.setProperty(
        "--thread-progress",
        `${Math.min(Math.max(progress, 0), 1)}`
      )

      // Each node is measured against the same head the thread is drawn to, so
      // a node can never light up ahead of the thread that reaches it.
      for (const item of list.querySelectorAll<HTMLElement>(
        "[data-slot='thread-timeline-item']"
      )) {
        const node = item.querySelector<HTMLElement>(
          "[data-slot='thread-timeline-node']"
        )
        const box = (node ?? item).getBoundingClientRect()
        item.toggleAttribute("data-reached", box.top + box.height / 2 <= head)
      }
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [line])

  return (
    <ol
      ref={ref}
      data-slot="thread-timeline"
      className={cn("relative", className)}
      style={{ "--thread-progress": "0", ...style } as React.CSSProperties}
      {...props}
    >
      {/* The pattern to sew along, and the thread that has reached it. */}
      <span
        aria-hidden="true"
        className="border-muted-foreground/25 absolute top-1 bottom-1 left-2 border-l border-dashed"
      />
      <span
        aria-hidden="true"
        className="bg-primary absolute top-1 bottom-1 left-2 w-px origin-top"
        style={{ scale: "1 var(--thread-progress)" }}
      />
      {children}
    </ol>
  )
}

export interface ThreadTimelineItemProps extends Omit<
  React.ComponentProps<"li">,
  "title"
> {
  /** Heading for the entry. */
  title?: React.ReactNode
  /** Small line above the title. A date, usually. */
  meta?: React.ReactNode
  /** Content for the node itself. A number or a glyph, if anything. */
  marker?: React.ReactNode
}

export function ThreadTimelineItem({
  title,
  meta,
  marker,
  children,
  className,
  ...props
}: ThreadTimelineItemProps) {
  return (
    <li
      data-slot="thread-timeline-item"
      className={cn("group relative pb-9 pl-9 last:pb-0", className)}
      {...props}
    >
      <span
        data-slot="thread-timeline-node"
        aria-hidden="true"
        className="bg-background border-muted-foreground/40 text-primary-foreground group-data-[reached]:border-primary group-data-[reached]:bg-primary absolute top-1 left-2 grid size-4 -translate-x-1/2 place-items-center rounded-full border-2 text-[0.5rem] font-medium transition duration-300 ease-[var(--ease-out-quart)] group-data-[reached]:scale-110 motion-reduce:transition-none"
      >
        {marker}
      </span>

      <div className="translate-x-1 opacity-55 transition duration-500 ease-[var(--ease-out-quart)] group-data-[reached]:translate-x-0 group-data-[reached]:opacity-100 motion-reduce:transition-none">
        {meta ? (
          <div className="text-muted-foreground text-xs tracking-wide">
            {meta}
          </div>
        ) : null}
        {title ? (
          <h3 className="mt-1 text-sm leading-none font-medium">{title}</h3>
        ) : null}
        {children ? (
          <div className="text-muted-foreground mt-2 text-sm">{children}</div>
        ) : null}
      </div>
    </li>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface LogoLoomProps extends React.ComponentProps<"div"> {
  /** Milliseconds between one logo arriving and the next. */
  stagger?: number
  /** Length of a single logo's arrival, in milliseconds. */
  duration?: number
  /** How far a logo travels in, as a CSS length. */
  distance?: string
  /** Draw the thread the logos are woven onto. */
  thread?: boolean
  /** Weave again every time the row comes back into view. */
  repeat?: boolean
}

export function LogoLoom({
  children,
  className,
  stagger = 90,
  duration = 700,
  distance = "1.6rem",
  thread = true,
  repeat = false,
  ...props
}: LogoLoomProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [woven, setWoven] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWoven(true)
        } else if (repeat) {
          setWoven(false)
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [repeat])

  const logos = React.Children.toArray(children)

  return (
    <div
      ref={ref}
      data-slot="logo-loom"
      data-woven={woven ? "" : undefined}
      className={cn(
        "relative flex flex-wrap items-center justify-center gap-x-10 gap-y-6",
        className
      )}
      {...props}
    >
      {/* The warp. It runs behind every logo, and only the logos that carry a
          background hide it, which is what makes the row read as woven rather
          than as a row of logos on a line. */}
      {thread ? (
        <span
          aria-hidden="true"
          className="border-muted-foreground/25 absolute inset-x-0 top-1/2 -z-10 border-t border-dashed"
        />
      ) : null}

      {logos.map((logo, index) => (
        <span
          key={index}
          data-slot="logo-loom-item"
          className={cn(
            "relative px-3 opacity-0",
            // Every other logo sits over the thread and the rest sit under it.
            // The pass a logo takes is also the direction it arrives from, so
            // the row interlaces as it lands.
            index % 2 === 0 ? "bg-background" : "bg-transparent",
            woven &&
              "animate-loom-weave motion-reduce:animate-none motion-reduce:opacity-100"
          )}
          style={
            {
              "--loom-from": index % 2 === 0 ? `-${distance}` : distance,
              animationDelay: `${index * stagger}ms`,
              animationDuration: `${duration}ms`,
            } as React.CSSProperties
          }
        >
          {logo}
        </span>
      ))}
    </div>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface WeaveTextProps extends React.ComponentProps<"span"> {
  /**
   * Colors woven through the gradient, left to right. The first color is
   * repeated at the end so the loop is seamless.
   */
  colors?: string[]
  /** Seconds for one full pass. Lower is faster. */
  duration?: number
  /** Render a static gradient with no animation. */
  paused?: boolean
}

const DEFAULT_COLORS = ["#2dd4bf", "#38bdf8", "#3b82f6", "#67e8f9"]

export function WeaveText({
  children,
  className,
  colors = DEFAULT_COLORS,
  duration = 8,
  paused = false,
  style,
  ...props
}: WeaveTextProps) {
  const backgroundImage = React.useMemo(() => {
    const stops = colors.length > 0 ? colors : DEFAULT_COLORS
    return `linear-gradient(90deg, ${[...stops, stops[0]].join(", ")})`
  }, [colors])

  return (
    <span
      data-slot="weave-text"
      className={cn(
        "inline-block bg-[length:200%_auto] bg-clip-text text-transparent",
        !paused && "animate-weave motion-reduce:animate-none",
        className
      )}
      style={{
        backgroundImage,
        animationDuration: `${duration}s`,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

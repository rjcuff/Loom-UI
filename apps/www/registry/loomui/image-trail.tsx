"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ImageTrailProps extends React.ComponentProps<"div"> {
  /** Sources dropped along the pointer's path, in order and on a loop. */
  images: string[]
  /** Pixels the pointer must travel before the next image is dropped. */
  distance?: number
  /** Milliseconds an image takes to arrive, hold and fade. */
  life?: number
  /** Most images alive at once. Older ones are dropped first. */
  max?: number
  /** Largest tilt either side of straight, in degrees. */
  tilt?: number
  /** Classes for each dropped image. Size and radius belong here. */
  imageClassName?: string
}

interface Drop {
  id: number
  x: number
  y: number
  src: string
  tilt: number
}

/**
 * Images are dropped by distance travelled rather than on a timer, so a slow
 * drag leaves the same trail a fast one does and a still pointer leaves none.
 */
export function ImageTrail({
  images,
  children,
  className,
  distance = 90,
  life = 900,
  max = 12,
  tilt = 14,
  imageClassName,
  onPointerMove,
  ...props
}: ImageTrailProps) {
  const [drops, setDrops] = React.useState<Drop[]>([])
  const last = React.useRef<{ x: number; y: number } | null>(null)
  const nextId = React.useRef(0)

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)

    if (
      images.length === 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const previous = last.current

    if (previous && Math.hypot(x - previous.x, y - previous.y) < distance) {
      return
    }

    last.current = { x, y }
    const id = nextId.current++

    setDrops((current) =>
      [
        ...current,
        {
          id,
          x,
          y,
          src: images[id % images.length],
          // Seeded off the id, so a given image in the trail always lands at
          // the same angle instead of jittering on re-render.
          tilt: ((id * 37) % (tilt * 2 + 1)) - tilt,
        },
      ].slice(-max)
    )
  }

  const drop = React.useCallback((id: number) => {
    setDrops((current) => current.filter((item) => item.id !== id))
  }, [])

  return (
    <div
      data-slot="image-trail"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        last.current = null
      }}
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {drops.map((item) => (
        <img
          key={item.id}
          src={item.src}
          alt=""
          aria-hidden="true"
          draggable={false}
          onAnimationEnd={() => drop(item.id)}
          className={cn(
            "animate-trail-fade pointer-events-none absolute -z-10 size-28 -translate-x-1/2 -translate-y-1/2 rounded-lg object-cover select-none motion-reduce:hidden",
            imageClassName
          )}
          style={
            {
              left: item.x,
              top: item.y,
              "--trail-tilt": `${item.tilt}deg`,
              "--trail-duration": `${life}ms`,
            } as React.CSSProperties
          }
        />
      ))}
      {children}
    </div>
  )
}

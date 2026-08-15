import * as React from "react"

import { cn } from "@/lib/utils"

export interface IPhoneProps extends React.ComponentProps<"div"> {
  /** Largest width the device is drawn at, in pixels. It shrinks below this. */
  width?: number
  /** Screenshot to fill the screen with. */
  src?: string
  /** Description of the screenshot. Required whenever `src` is set. */
  alt?: string
  /** Draw the island at the top of the screen. */
  island?: boolean
  /** Draw the buttons down the sides. */
  buttons?: boolean
}

/** Device points, so every measurement below is a real one. */
const DEVICE_WIDTH = 393
const DEVICE_HEIGHT = 852

/**
 * Every measurement is a share of the frame's own width. Container units keep
 * that share exact at any size. A percentage border-radius would go elliptical
 * on a box this tall, and a scale factor worked out in JS would be wrong the
 * moment the frame had to shrink to fit.
 */
const cq = (points: number) =>
  `${((points / DEVICE_WIDTH) * 100).toFixed(4)}cqw`

const BUTTONS = [
  { side: "left", top: 150, height: 32 },
  { side: "left", top: 216, height: 62 },
  { side: "left", top: 292, height: 62 },
  { side: "right", top: 240, height: 96 },
] as const

export function IPhone({
  children,
  src,
  alt = "",
  width = 300,
  island = true,
  buttons = true,
  className,
  style,
  ...props
}: IPhoneProps) {
  return (
    <div
      data-slot="iphone"
      className={cn("relative w-full", className)}
      style={{
        maxWidth: width,
        aspectRatio: `${DEVICE_WIDTH} / ${DEVICE_HEIGHT}`,
        containerType: "inline-size",
        ...style,
      }}
      {...props}
    >
      {buttons
        ? BUTTONS.map((button, index) => (
            <span
              key={index}
              aria-hidden="true"
              className="absolute bg-neutral-500"
              style={{
                ...(button.side === "left"
                  ? { left: cq(-2) }
                  : { right: cq(-2) }),
                top: cq(button.top),
                width: cq(3),
                height: cq(button.height),
                borderRadius: cq(2),
              }}
            />
          ))
        : null}

      {/* The rim. A gradient rather than a flat fill, because a solid band the
          same colour all the way round reads as a border, not as metal. */}
      <div
        className="absolute inset-0 bg-linear-to-br from-neutral-600 via-neutral-800 to-neutral-700 shadow-xl"
        style={{ borderRadius: cq(56), padding: cq(9) }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
          style={{ borderRadius: cq(48) }}
        >
          {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            children
          )}

          {island ? (
            <span
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 bg-black"
              style={{
                top: cq(12),
                width: cq(120),
                height: cq(34),
                borderRadius: cq(17),
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

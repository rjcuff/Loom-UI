import * as React from "react"

import { cn } from "@/lib/utils"

export interface IPadProps extends React.ComponentProps<"div"> {
  /** Largest width the device is drawn at, in pixels. It shrinks below this. */
  width?: number
  /** Screenshot to fill the screen with. */
  src?: string
  /** Description of the screenshot. Required whenever `src` is set. */
  alt?: string
  /** Which way up the tablet is held. */
  orientation?: "portrait" | "landscape"
  /** Draw the camera in the bezel above the screen. */
  camera?: boolean
}

/** iPad Pro 11" in points, held upright. */
const SHORT_SIDE = 834
const LONG_SIDE = 1194

export function IPad({
  children,
  src,
  alt = "",
  width = 420,
  orientation = "portrait",
  camera = true,
  className,
  style,
  ...props
}: IPadProps) {
  const portrait = orientation === "portrait"
  const deviceWidth = portrait ? SHORT_SIDE : LONG_SIDE
  const deviceHeight = portrait ? LONG_SIDE : SHORT_SIDE

  // Every measurement is a share of the frame's own width, so the proportions
  // hold at whatever size the frame ends up rather than at one tuned by eye.
  const cq = (points: number) =>
    `${((points / deviceWidth) * 100).toFixed(4)}cqw`

  return (
    <div
      data-slot="ipad"
      className={cn("relative w-full", className)}
      style={{
        maxWidth: width,
        aspectRatio: `${deviceWidth} / ${deviceHeight}`,
        containerType: "inline-size",
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 bg-linear-to-br from-neutral-500 via-neutral-700 to-neutral-600 shadow-xl"
        style={{ borderRadius: cq(50), padding: cq(22) }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
          style={{ borderRadius: cq(32) }}
        >
          {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            children
          )}
        </div>

        {/* In the bezel rather than on the screen, which is where it sits and
            what keeps it out of anything laid over the display. */}
        {camera ? (
          <span
            aria-hidden="true"
            className="absolute left-1/2 -translate-x-1/2 rounded-full bg-neutral-900"
            style={{ top: cq(8), width: cq(7), height: cq(7) }}
          />
        ) : null}
      </div>
    </div>
  )
}

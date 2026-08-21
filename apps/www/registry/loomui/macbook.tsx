import * as React from "react"

import { cn } from "@/lib/utils"

export interface MacBookProps extends React.ComponentProps<"div"> {
  /** Largest width the machine is drawn at, in pixels. It shrinks below this. */
  width?: number
  /** Screenshot to fill the screen with. */
  src?: string
  /** Description of the screenshot. Required whenever `src` is set. */
  alt?: string
  /** Draw the camera housing cut into the top of the display. */
  notch?: boolean
  /** Draw the base the lid stands on. */
  base?: boolean
}

/**
 * MacBook Pro 14" in points. The base is a little wider than the lid, which is
 * the only reason the machine reads as standing on something rather than
 * floating above a bar.
 */
const LID_WIDTH = 1544
const LID_HEIGHT = 1014
const BASE_WIDTH = 1600
const BASE_HEIGHT = 26

export function MacBook({
  children,
  src,
  alt = "",
  width = 620,
  notch = true,
  base = true,
  className,
  style,
  ...props
}: MacBookProps) {
  const height = LID_HEIGHT + (base ? BASE_HEIGHT : 0)

  // Shares of the whole machine's width, so the lid, the base and the scoop
  // stay in step with each other at any size.
  const cq = (points: number) =>
    `${((points / BASE_WIDTH) * 100).toFixed(4)}cqw`

  return (
    <div
      data-slot="macbook"
      className={cn(
        // `self-start` so a flex or grid parent does not stretch the frame.
        // The whole shape is an `aspect-ratio` on an auto height, and a
        // stretched item has a definite one, which the ratio then loses to:
        // the device silently comes out the height of its tallest sibling.
        // Override with `self-center` and friends through `className`.
        "relative w-full self-start",
        className
      )}
      style={{
        maxWidth: width,
        aspectRatio: `${BASE_WIDTH} / ${height}`,
        containerType: "inline-size",
        ...style,
      }}
      {...props}
    >
      {/* The lid. Narrower than the base and centred on it. */}
      <div
        className="mx-auto bg-linear-to-br from-neutral-500 via-neutral-700 to-neutral-600 shadow-xl"
        style={{
          width: cq(LID_WIDTH),
          height: cq(LID_HEIGHT),
          borderRadius: cq(22),
          padding: cq(16),
        }}
      >
        <div
          className="relative h-full w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800"
          style={{ borderRadius: cq(8) }}
        >
          {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          ) : (
            children
          )}

          {/* The camera housing is bezel that intrudes into the display, so it
              is drawn over the screen rather than around it. */}
          {notch ? (
            <span
              aria-hidden="true"
              className="absolute top-0 left-1/2 -translate-x-1/2 bg-neutral-900"
              style={{
                width: cq(160),
                height: cq(30),
                borderBottomLeftRadius: cq(10),
                borderBottomRightRadius: cq(10),
              }}
            />
          ) : null}
        </div>
      </div>

      {base ? (
        <div
          aria-hidden="true"
          className="relative w-full bg-linear-to-b from-neutral-400 to-neutral-600"
          style={{
            height: cq(BASE_HEIGHT),
            borderBottomLeftRadius: cq(10),
            borderBottomRightRadius: cq(10),
          }}
        >
          {/* The scoop cut into the front edge, which is the detail that names
              the machine from across a room. */}
          <span
            className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-neutral-500"
            style={{
              width: cq(210),
              height: cq(11),
              borderBottomLeftRadius: cq(11),
              borderBottomRightRadius: cq(11),
            }}
          />
        </div>
      ) : null}
    </div>
  )
}

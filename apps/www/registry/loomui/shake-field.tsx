"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ShakeFieldProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** The message. Anything falsy is "no error", and clears the last one. */
  error?: React.ReactNode
  /** The control this wraps. */
  children: React.ReactNode
  /** Milliseconds for one shake. */
  duration?: number
  /** How far the shake travels, as a CSS length. */
  distance?: string
  /**
   * Shake again when the same message is set twice in a row.
   *
   * A form submitted three times with the same wrong password should answer
   * three times. Pass a counter that goes up on every attempt.
   */
  attempt?: number
}

/**
 * A field that answers back.
 *
 * The shake is the acknowledgement and the message is the reason. Either alone
 * is worse: a shake with no text says something is wrong without saying what,
 * and text with no movement is easy to miss under a control you were already
 * looking at.
 *
 * The message opens on a grid row rather than a height, so it takes whatever
 * height the text turns out to be without anything measuring it first, and no
 * fixed height to keep in sync when the copy changes.
 *
 * Under reduced motion nothing shakes and nothing slides. The message still
 * appears, because it is the part that carries the meaning.
 */
export function ShakeField({
  error,
  children,
  duration = 420,
  distance = "0.35rem",
  attempt,
  className,
  style,
  ...props
}: ShakeFieldProps) {
  const id = React.useId()
  const [shake, setShake] = React.useState(0)

  // The last error that was actually shaken for. A re-render caused by typing
  // must not restart the animation, so the effect keys on the message and the
  // attempt rather than on every render.
  const previous = React.useRef<React.ReactNode>(null)

  React.useEffect(() => {
    if (!error) {
      previous.current = null
      return
    }
    if (error === previous.current && attempt === undefined) {
      return
    }
    previous.current = error
    setShake((count) => count + 1)
  }, [error, attempt])

  return (
    <div
      data-slot="shake-field"
      data-invalid={error ? "" : undefined}
      className={cn("min-w-0", className)}
      style={
        {
          "--shake-distance": distance,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Keyed, so a second failure replays the animation instead of being
          swallowed because the class is already on the element. */}
      <div
        key={shake}
        className={cn(
          shake > 0 && error && "animate-field-shake",
          "motion-reduce:animate-none"
        )}
        style={{ animationDuration: `${duration}ms` }}
      >
        {children}
      </div>

      {/* Two moves, in order. The row opens first, then the message fades
          up into the space that is already there.

          Sliding the text while the row is still opening drags it through the
          clip edge, and that hard line reading across the message is the part
          that looks wrong. Waiting for the room means nothing is ever half cut
          off, and the delay is shorter than the open so the two still read as
          one movement.

          The row itself is `0fr` to `1fr`, so the panel takes whatever height
          the message turns out to be with nothing measured and no fixed height
          to keep in sync when the copy changes. */}
      <div
        className={cn(
          "ease-out-quart grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          error ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0">
          <p
            id={`${id}-error`}
            // Announced when it appears, and not before. `alert` interrupts,
            // which is right for a message the reader asked for by submitting.
            role="alert"
            className={cn(
              "text-destructive ease-out-quart pt-1.5 text-sm",
              "transition-[opacity,filter] duration-150",
              "motion-reduce:blur-none motion-reduce:transition-none",
              error
                ? "opacity-100 blur-none delay-100"
                : "opacity-0 blur-[2px] delay-0"
            )}
          >
            {error}
          </p>
        </div>
      </div>
    </div>
  )
}

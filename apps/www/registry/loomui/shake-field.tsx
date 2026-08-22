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

      {/* `0fr` to `1fr` on a grid row: the panel opens to whatever height the
          message happens to be, with nothing measured and nothing hardcoded. */}
      <div
        className={cn(
          "ease-out-quart grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
          error ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          {/* Opacity, offset and blur together. Any one of the three on its
              own reads as a fade; all three read as something arriving, and
              the message should look like it came from the field rather than
              like it was always there at zero opacity.

              The blur stays small. A wide one spreads badly and costs more
              than it is worth, worst of all in Safari. */}
          <p
            id={`${id}-error`}
            // Announced when it appears, and not before. `alert` interrupts,
            // which is right for a message the reader asked for by submitting.
            role="alert"
            className={cn(
              "text-destructive ease-out-quart pt-1.5 text-sm",
              "transition-[opacity,translate,filter] duration-200",
              "motion-reduce:translate-y-0 motion-reduce:blur-none motion-reduce:transition-none",
              error
                ? "translate-y-0 opacity-100 blur-none"
                : "-translate-y-1 opacity-0 blur-[2px]"
            )}
          >
            {error}
          </p>
        </div>
      </div>
    </div>
  )
}

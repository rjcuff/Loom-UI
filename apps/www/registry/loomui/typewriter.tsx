"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TypewriterProps extends Omit<
  React.ComponentProps<"span">,
  "children"
> {
  /** Phrases typed in order. A single phrase types once and stops. */
  words: string[]
  /** Milliseconds per character while typing. */
  typingSpeed?: number
  /** Milliseconds per character while deleting. Deletes read faster. */
  deletingSpeed?: number
  /** Milliseconds held on a finished phrase before it deletes. */
  holdDelay?: number
  /** Start over after the last phrase. */
  loop?: boolean
  /** Show the blinking caret. */
  caret?: boolean
  /** Render the first phrase in full with no typing. */
  disabled?: boolean
}

export function Typewriter({
  words,
  typingSpeed = 70,
  deletingSpeed = 40,
  holdDelay = 1600,
  loop = true,
  caret = true,
  disabled = false,
  className,
  ...props
}: TypewriterProps) {
  const phrases = words.length > 0 ? words : [""]
  const longest = React.useMemo(
    () => phrases.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [phrases]
  )

  const [index, setIndex] = React.useState(0)
  const [text, setText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)
  const [enabled, setEnabled] = React.useState(false)

  // Typing is a text change, not a motion effect, but it is still motion to
  // anyone who asked for less of it.
  React.useEffect(() => {
    if (disabled) {
      return
    }
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setEnabled(!query.matches)

    const onChange = (event: MediaQueryListEvent) => setEnabled(!event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [disabled])

  React.useEffect(() => {
    if (!enabled) {
      return
    }

    const current = phrases[index % phrases.length]
    const done = text === current
    const atLast = index === phrases.length - 1

    if (done && !deleting) {
      if (!loop && atLast) {
        return
      }
      const timer = setTimeout(() => setDeleting(true), holdDelay)
      return () => clearTimeout(timer)
    }

    if (deleting && text === "") {
      setDeleting(false)
      setIndex((previous) => (previous + 1) % phrases.length)
      return
    }

    const timer = setTimeout(
      () => {
        setText((previous) =>
          deleting
            ? current.slice(0, previous.length - 1)
            : current.slice(0, previous.length + 1)
        )
      },
      deleting ? deletingSpeed : typingSpeed
    )

    return () => clearTimeout(timer)
  }, [
    enabled,
    text,
    deleting,
    index,
    phrases,
    loop,
    holdDelay,
    typingSpeed,
    deletingSpeed,
  ])

  const visible = enabled ? text : phrases[0]

  return (
    <span
      data-slot="typewriter"
      className={cn("inline-grid", className)}
      {...props}
    >
      {/* The longest phrase reserves the width, so nothing around the
          typewriter reflows while it types. */}
      <span
        aria-hidden="true"
        className="invisible col-start-1 row-start-1 whitespace-pre"
      >
        {longest}
      </span>
      {/* A live region here would announce every keystroke, so the phrases are
          read once as static text and the typing itself is decoration. */}
      <span className="sr-only">{phrases.join(", ")}</span>
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 whitespace-pre"
      >
        {visible}
        {caret ? (
          <span
            aria-hidden="true"
            className="animate-caret-blink ml-0.5 inline-block w-px translate-y-[0.1em] self-stretch bg-current align-middle motion-reduce:animate-none"
            style={{ height: "1em" }}
          />
        ) : null}
      </span>
    </span>
  )
}

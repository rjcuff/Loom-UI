"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface LineState {
  /** This line is the one currently running. */
  active: boolean
  /** Milliseconds per character, inherited from the terminal. */
  speed: number
  /** Play everything at once with no typing. */
  instant: boolean
  /** Hand the session on to the next line. */
  done: () => void
}

const LineContext = React.createContext<LineState>({
  active: false,
  speed: 34,
  instant: true,
  done: () => {},
})

export interface TerminalProps extends React.ComponentProps<"div"> {
  /** Text in the window bar. A path or a shell name, usually. */
  title?: string
  /** Milliseconds a single character takes to be typed. */
  speed?: number
  /** Hold the session until the window scrolls into view. */
  startOnView?: boolean
  /** Print the whole session at once with no typing. */
  instant?: boolean
}

/**
 * Lines are rendered as the session reaches them rather than hidden and
 * revealed, so a line that has not run yet is not in the document at all and
 * cannot be read out ahead of itself.
 */
export function Terminal({
  children,
  className,
  title = "bash",
  speed = 34,
  startOnView = true,
  instant = false,
  ...props
}: TerminalProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const lines = React.Children.toArray(children)
  const [started, setStarted] = React.useState(!startOnView)
  const [step, setStep] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  }, [])

  React.useEffect(() => {
    if (!startOnView) {
      return
    }

    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setStarted(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [startOnView])

  const atOnce = instant || reduced
  const reached = atOnce ? lines.length - 1 : step

  return (
    <div
      ref={ref}
      data-slot="terminal"
      className={cn(
        "border-border bg-card w-full overflow-hidden rounded-xl border font-mono text-sm",
        className
      )}
      {...props}
    >
      <div className="border-border bg-muted/50 flex items-center gap-2 border-b px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
          <span className="bg-muted-foreground/30 size-2.5 rounded-full" />
        </span>
        <span className="text-muted-foreground text-xs">{title}</span>
      </div>

      <div className="flex flex-col gap-1 p-4 leading-relaxed">
        {lines.map((line, index) => {
          if (started && index > reached) {
            return null
          }

          return (
            <LineContext.Provider
              key={index}
              value={{
                active: started && index === reached && !atOnce,
                speed,
                instant: atOnce || index < step,
                done: () =>
                  setStep((current) =>
                    current === index ? current + 1 : current
                  ),
              }}
            >
              {started ? line : null}
            </LineContext.Provider>
          )
        })}
      </div>
    </div>
  )
}

export interface TerminalCommandProps extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  /** The command, as plain text so the typing stays predictable. */
  children: string
  /** What sits in front of the command. */
  prompt?: string
}

export function TerminalCommand({
  children,
  className,
  prompt = "$",
  ...props
}: TerminalCommandProps) {
  const { active, speed, instant, done } = React.useContext(LineContext)
  const [typed, setTyped] = React.useState(instant ? children.length : 0)

  React.useEffect(() => {
    if (instant) {
      setTyped(children.length)
      return
    }

    if (!active) {
      return
    }

    if (typed >= children.length) {
      done()
      return
    }

    const timer = window.setTimeout(() => setTyped(typed + 1), speed)
    return () => window.clearTimeout(timer)
  }, [active, instant, typed, children.length, speed, done])

  return (
    <div
      data-slot="terminal-command"
      className={cn("flex gap-2", className)}
      {...props}
    >
      <span aria-hidden="true" className="text-muted-foreground select-none">
        {prompt}
      </span>
      <span className="break-all">
        {children.slice(0, typed)}
        {active && typed < children.length ? (
          <span
            aria-hidden="true"
            className="animate-caret-blink bg-foreground ml-0.5 inline-block h-[1em] w-[0.5ch] translate-y-[0.15em] motion-reduce:animate-none"
          />
        ) : null}
      </span>
    </div>
  )
}

export interface TerminalOutputProps extends React.ComponentProps<"div"> {
  /** Milliseconds the command appears to run before this prints. */
  delay?: number
}

export function TerminalOutput({
  children,
  className,
  delay = 260,
  ...props
}: TerminalOutputProps) {
  const { active, instant, done } = React.useContext(LineContext)
  const [shown, setShown] = React.useState(instant)

  React.useEffect(() => {
    if (instant) {
      setShown(true)
      return
    }

    if (!active || shown) {
      if (shown) {
        done()
      }
      return
    }

    const timer = window.setTimeout(() => setShown(true), delay)
    return () => window.clearTimeout(timer)
  }, [active, instant, shown, delay, done])

  if (!shown) {
    return null
  }

  return (
    <div
      data-slot="terminal-output"
      className={cn(
        "text-muted-foreground animate-terminal-print break-all",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

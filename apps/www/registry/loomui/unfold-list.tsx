"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface UnfoldState {
  open: string[]
  toggle: (value: string) => void
  duration: number
}

const UnfoldContext = React.createContext<UnfoldState | null>(null)

function useUnfold() {
  const context = React.useContext(UnfoldContext)
  if (!context) {
    throw new Error("UnfoldItem must be rendered inside an UnfoldList.")
  }
  return context
}

export interface UnfoldListProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> {
  /** One panel open at a time, or as many as the reader wants. */
  type?: "single" | "multiple"
  /** Panels open before anyone has touched the list. */
  defaultValue?: string | string[]
  /** Open panels, if you are holding the state yourself. */
  value?: string | string[]
  /** Called with the open panels whenever they change. */
  onValueChange?: (value: string[]) => void
  /** In `single` mode, allow the open panel to be closed again. */
  collapsible?: boolean
  /** Milliseconds one panel takes to unfold. */
  duration?: number
}

const toArray = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

export function UnfoldList({
  children,
  className,
  type = "single",
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  duration = 320,
  ...props
}: UnfoldListProps) {
  const [ownOpen, setOwnOpen] = React.useState(() => toArray(defaultValue))
  const isControlled = value !== undefined
  const open = isControlled ? toArray(value) : ownOpen

  const toggle = React.useCallback(
    (item: string) => {
      const isOpen = open.includes(item)
      const next =
        type === "single"
          ? isOpen
            ? collapsible
              ? []
              : open
            : [item]
          : isOpen
            ? open.filter((entry) => entry !== item)
            : [...open, item]

      if (!isControlled) {
        setOwnOpen(next)
      }
      onValueChange?.(next)
    },
    [open, type, collapsible, isControlled, onValueChange]
  )

  const state = React.useMemo(
    () => ({ open, toggle, duration }),
    [open, toggle, duration]
  )

  return (
    <UnfoldContext.Provider value={state}>
      <div
        data-slot="unfold-list"
        className={cn(
          "divide-border border-border divide-y border-y",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </UnfoldContext.Provider>
  )
}

export interface UnfoldItemProps extends Omit<
  React.ComponentProps<"div">,
  "title"
> {
  /** Identifies this panel to the list. Must be unique within it. */
  value: string
  /** The row itself, which is the button that opens the panel. */
  title: React.ReactNode
}

/**
 * The panel is a grid row animated from `0fr` to `1fr`, so it opens to whatever
 * height its content happens to be without anything having to measure it first
 * and without a fixed height to keep in sync.
 */
export function UnfoldItem({
  value,
  title,
  children,
  className,
  ...props
}: UnfoldItemProps) {
  const { open, toggle, duration } = useUnfold()
  const isOpen = open.includes(value)
  const id = React.useId()

  return (
    <div
      data-slot="unfold-item"
      data-state={isOpen ? "open" : "closed"}
      className={cn("group", className)}
      style={{ "--unfold-duration": `${duration}ms` } as React.CSSProperties}
      {...props}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={`${id}-trigger`}
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          onClick={() => toggle(value)}
          className="text-foreground focus-visible:ring-ring/50 flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none focus-visible:ring-2"
        >
          {title}
          <span
            aria-hidden="true"
            className="border-muted-foreground/60 size-2 shrink-0 rotate-45 border-r border-b transition-[rotate,border-color] duration-[var(--unfold-duration)] ease-[var(--ease-out-quart)] group-data-[state=open]:-rotate-135 motion-reduce:transition-none"
          />
        </button>
      </h3>

      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        // Kept in the document so the fold can animate both ways. `inert`
        // takes a closed panel out of the tab order and off the a11y tree,
        // which `hidden` would do at the cost of the closing animation.
        inert={!isOpen}
        className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--unfold-duration)] ease-[var(--ease-out-quart)] group-data-[state=open]:grid-rows-[1fr] motion-reduce:transition-none"
      >
        {/* The fold. The panel turns down onto the page from its top edge as
            the row it sits in opens. */}
        <div className="overflow-hidden [perspective:600px]">
          <div className="text-muted-foreground origin-top [rotate:x_-25deg] pb-4 text-sm opacity-0 transition-[opacity,rotate] duration-[var(--unfold-duration)] ease-[var(--ease-out-quart)] group-data-[state=open]:[rotate:x_0deg] group-data-[state=open]:opacity-100 motion-reduce:[rotate:none] motion-reduce:opacity-100 motion-reduce:transition-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

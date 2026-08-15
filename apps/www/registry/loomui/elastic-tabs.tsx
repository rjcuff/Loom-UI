"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface ElasticTabsItem {
  value: string
  label: React.ReactNode
}

export interface ElasticTabsProps extends Omit<
  React.ComponentProps<"div">,
  "onChange"
> {
  /** The tabs, in order. */
  items: ElasticTabsItem[]
  /** Selected tab. Leave it out to let the group own the selection. */
  value?: string
  /** Starting tab when the group owns the selection. */
  defaultValue?: string
  /** Called with the value of the tab moved to. */
  onValueChange?: (value: string) => void
  /** Length of the whole travel, in milliseconds. */
  duration?: number
}

const EMPTY = { left: 0, width: 0 }

export function ElasticTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  duration = 280,
  className,
  ...props
}: ElasticTabsProps) {
  const [own, setOwn] = React.useState(defaultValue ?? items[0]?.value)
  const isControlled = value !== undefined
  const active = isControlled ? value : own
  const index = Math.max(
    items.findIndex((item) => item.value === active),
    0
  )

  const listRef = React.useRef<HTMLDivElement>(null)
  const tabsRef = React.useRef<(HTMLButtonElement | null)[]>([])
  const [pill, setPill] = React.useState(EMPTY)
  // The first placement is a measurement, not a move, so it must not travel.
  const [settled, setSettled] = React.useState(false)

  const measure = React.useCallback((position: number) => {
    const tab = tabsRef.current[position]
    return tab ? { left: tab.offsetLeft, width: tab.offsetWidth } : EMPTY
  }, [])

  const indexRef = React.useRef(index)
  indexRef.current = index
  const pillRef = React.useRef(EMPTY)
  React.useEffect(() => {
    pillRef.current = pill
  }, [pill])

  // Placement. Runs once on mount and again whenever the row is resized, so a
  // wrapped or re-laid-out group never leaves the pill behind.
  React.useEffect(() => {
    const list = listRef.current
    if (!list) {
      return
    }

    const observer = new ResizeObserver(() =>
      setPill(measure(indexRef.current))
    )
    observer.observe(list)

    const timer = window.setTimeout(() => setSettled(true), 0)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [measure])

  // Travel. The pill first stretches to cover both tabs, then contracts onto
  // the new one. Moving `left` and `width` straight to the target slides a
  // fixed shape across; spanning first is what makes it read as elastic.
  React.useEffect(() => {
    const target = measure(index)
    const from = pillRef.current

    if (from.width === 0) {
      setPill(target)
      return
    }

    const start = Math.min(from.left, target.left)
    const end = Math.max(from.left + from.width, target.left + target.width)
    setPill({ left: start, width: end - start })

    const timer = window.setTimeout(
      () => setPill(measure(index)),
      duration * 0.4
    )
    return () => window.clearTimeout(timer)
  }, [index, measure, duration])

  const select = (position: number) => {
    const next = items[position]
    if (!next || next.value === active) {
      return
    }

    if (!isControlled) {
      setOwn(next.value)
    }
    onValueChange?.(next.value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let position: number

    if (event.key === "ArrowLeft") {
      position = (index - 1 + items.length) % items.length
    } else if (event.key === "ArrowRight") {
      position = (index + 1) % items.length
    } else if (event.key === "Home") {
      position = 0
    } else if (event.key === "End") {
      position = items.length - 1
    } else {
      return
    }

    event.preventDefault()
    select(position)
    // Selection carries focus with it, or the next arrow key would start from
    // the tab that has just been left behind.
    tabsRef.current[position]?.focus()
  }

  return (
    <div
      ref={listRef}
      data-slot="elastic-tabs"
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        // Never wider than its parent. The pill is positioned in content
        // coordinates, so it scrolls with the tabs rather than detaching.
        "bg-muted relative inline-flex max-w-full items-center overflow-x-auto rounded-full p-1",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "bg-background absolute inset-y-1 rounded-full shadow-sm",
          settled &&
            "transition-[left,width] ease-[var(--ease-out-quart)] motion-reduce:transition-none"
        )}
        style={{
          left: pill.left,
          width: pill.width,
          transitionDuration: `${duration * 0.62}ms`,
        }}
      />

      {items.map((item, position) => (
        <button
          key={item.value}
          ref={(node) => {
            tabsRef.current[position] = node
          }}
          type="button"
          role="tab"
          aria-selected={position === index}
          // Only the selected tab is in the tab order; the arrows move between
          // them, which is how a tablist is meant to be walked.
          tabIndex={position === index ? 0 : -1}
          onClick={() => select(position)}
          className={cn(
            "text-muted-foreground relative z-10 cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors outline-none sm:px-4 sm:text-sm",
            "focus-visible:ring-ring/60 focus-visible:ring-2",
            position === index && "text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

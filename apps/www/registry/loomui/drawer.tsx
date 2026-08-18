"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

export type DrawerSide = "top" | "right" | "bottom" | "left"

export interface DrawerContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  /** Edge the drawer comes in from. */
  side?: DrawerSide
  /** How much shows when it opens. Any CSS length. */
  peek?: string
  /** How much shows once it is dragged open. Any CSS length. */
  full?: string
  /** Let the drag snap the drawer open to `full`. */
  expandable?: boolean
  /** Draw the notch you take hold of. */
  showHandle?: boolean
  /** Allow the swipe, the overlay and `Escape` to close the drawer. */
  dismissible?: boolean
}

/** Off screen, as a share of the panel, which is `full` in size. */
const CLOSED: Record<DrawerSide, string> = {
  top: "0 -100%",
  bottom: "0 100%",
  left: "-100% 0",
  right: "100% 0",
}

/**
 * The panel is always `full` in size and parked so that only `peek` of it shows.
 * Dragging is then one number in one direction, and opening all the way is the
 * same movement carried further rather than a resize.
 */
const PANEL: Record<DrawerSide, string> = {
  top: "inset-x-0 top-0 h-[var(--drawer-full)] w-full flex-col rounded-b-2xl border-b",
  bottom:
    "inset-x-0 bottom-0 h-[var(--drawer-full)] w-full flex-col rounded-t-2xl border-t",
  left: "inset-y-0 left-0 h-full w-[var(--drawer-full)] flex-row rounded-r-2xl border-r",
  right:
    "inset-y-0 right-0 h-full w-[var(--drawer-full)] flex-row rounded-l-2xl border-l",
}

/** The part of the panel that is on screen at rest, holding the content. */
const STRIP: Record<DrawerSide, string> = {
  top: "mt-auto w-full",
  bottom: "w-full",
  left: "ml-auto h-full",
  right: "h-full",
}

const HANDLE_POSITION: Record<DrawerSide, string> = {
  top: "inset-x-0 bottom-0 justify-center",
  bottom: "inset-x-0 top-0 justify-center",
  left: "inset-y-0 right-0 flex-col justify-center",
  right: "inset-y-0 left-0 flex-col justify-center",
}

/**
 * Milliseconds. The settle is shorter than the way in, because the panel is
 * already most of the way to where it is going by the time the finger lifts.
 */
const SETTLE_MS = 260
const CLOSE_MS = 220
/** Pixels per millisecond past which a flick decides the snap on its own. */
const FLICK = 0.5
/** Travel before a drag counts as a decision rather than a nudge. */
const DECIDE_PX = 40

const isVertical = (side: DrawerSide) => side === "top" || side === "bottom"
/** Which way is out: down and right are positive, up and left are not. */
const outwardSign = (side: DrawerSide) =>
  side === "bottom" || side === "right" ? 1 : -1

/** Where the panel sits when it is parked at `peek`, per side. */
function restTranslate(side: DrawerSide, expanded: boolean) {
  if (expanded) return "0 0"
  const gap = "calc(var(--drawer-full) - var(--drawer-peek))"
  const back = `calc(-1 * ${gap})`

  if (side === "bottom") return `0 ${gap}`
  if (side === "top") return `0 ${back}`
  if (side === "right") return `${gap} 0`
  return `${back} 0`
}

export const Drawer = DialogPrimitive.Root
export const DrawerTrigger = DialogPrimitive.Trigger
export const DrawerClose = DialogPrimitive.Close
export const DrawerPortal = DialogPrimitive.Portal

export function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/45",
        "data-[state=open]:animate-drawer-overlay-in data-[state=closed]:animate-drawer-overlay-out motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * A panel that comes in from one edge, opens further when it is pulled, and
 * leaves when it is thrown back out.
 *
 * The open and close animations are keyframes rather than transitions, since
 * the panel is only in the DOM while it is open and a transition has nothing to
 * start from. Neither one fills forwards: an animation that holds its last
 * frame outranks inline styles for good, which would leave the drag with
 * nothing to move. The drag writes `translate` straight onto the node, so it
 * costs no renders and the panel sits exactly under the finger.
 */
export function DrawerContent({
  side = "bottom",
  peek,
  full,
  expandable = true,
  showHandle = true,
  dismissible = true,
  className,
  children,
  ...props
}: DrawerContentProps) {
  const vertical = isVertical(side)
  const outward = outwardSign(side)

  const panelRef = React.useRef<HTMLDivElement>(null)
  const stripRef = React.useRef<HTMLDivElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const origin = React.useRef(0)
  const offset = React.useRef(0)
  const stamp = React.useRef(0)
  const velocity = React.useRef(0)
  // The gesture runs off refs rather than state. State lands a render later,
  // and a click quick enough to land inside that gap used to leave the drag
  // switched on, which handed the panel to every hover that followed.
  const held = React.useRef<number | null>(null)
  const timer = React.useRef(0)
  const [dragging, setDragging] = React.useState(false)
  const [expanded, setExpanded] = React.useState(false)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const move = (distance: number) => {
    const node = panelRef.current
    if (!node) return
    node.style.translate = vertical
      ? `0 ${distance * outward}px`
      : `${distance * outward}px 0`
  }

  const glide = (duration: number, translate: string) => {
    const node = panelRef.current
    if (!node) return
    node.style.transition = `translate ${duration}ms var(--ease-drawer)`
    node.style.translate = translate
  }

  /** Distance out from fully open, in pixels: 0 is open, `size` is gone. */
  const measure = () => {
    const panel = panelRef.current
    const strip = stripRef.current
    const size = panel ? (vertical ? panel.offsetHeight : panel.offsetWidth) : 0
    const shown = strip
      ? vertical
        ? strip.offsetHeight
        : strip.offsetWidth
      : size
    return { size, rest: size - shown }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissible && !expandable) return
    if (held.current !== null) return

    event.currentTarget.setPointerCapture(event.pointerId)
    held.current = event.pointerId

    const node = panelRef.current
    if (node) node.style.transition = ""

    const { rest } = measure()
    origin.current = vertical ? event.clientY : event.clientX
    offset.current = expanded ? 0 : rest
    velocity.current = 0
    stamp.current = event.timeStamp
    setDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (held.current !== event.pointerId) return

    // A mouse that reports no button held is a mouse that let go somewhere this
    // never heard about. Nothing should follow a pointer that is not pressed.
    if (event.pointerType === "mouse" && event.buttons === 0) {
      handlePointerUp(event)
      return
    }

    const { size, rest } = measure()
    const point = vertical ? event.clientY : event.clientX
    const travelled = (point - origin.current) * outward
    const elapsed = Math.max(event.timeStamp - stamp.current, 1)
    const base = expanded ? 0 : rest
    const limit = expandable ? 0 : rest

    let next = base + travelled
    // Past fully open there is nowhere left to go, so the pull is resisted
    // rather than refused and the panel never looks stuck to the finger.
    if (next < limit) next = limit + (next - limit) / 6

    velocity.current = (next - offset.current) / elapsed
    stamp.current = event.timeStamp
    offset.current = Math.min(next, size)
    move(offset.current)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (held.current !== event.pointerId) return
    held.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    const { rest } = measure()
    const travelled = offset.current - (expanded ? 0 : rest)
    const flicked = Math.abs(velocity.current) > FLICK

    // Two places to land and nothing in between: pulled open, or gone. A drag
    // that decides nothing goes back where it started, which is the one thing
    // that is not a snap.
    const away = flicked ? velocity.current > 0 : travelled > DECIDE_PX
    const toward = flicked ? velocity.current < 0 : travelled < -DECIDE_PX

    if (dismissible && away) {
      // The swipe carries on out and the drawer closes on arrival, rather than
      // snapping back to play an exit it has already been given. `dragging`
      // stays on until then, since it is what keeps the exit keyframes off a
      // panel that is already on its way out.
      glide(CLOSE_MS, CLOSED[side])
      timer.current = window.setTimeout(
        () => closeRef.current?.click(),
        CLOSE_MS - 20
      )
      return
    }

    const open = expandable && (toward || expanded)
    setDragging(false)
    setExpanded(open)
    glide(SETTLE_MS, restTranslate(side, open))
  }

  const grabbable = dismissible || expandable

  return (
    <DrawerPortal>
      <DrawerOverlay
        onClick={dismissible ? undefined : (event) => event.preventDefault()}
      />
      <DialogPrimitive.Content
        ref={panelRef}
        data-slot="drawer-content"
        data-side={side}
        data-expanded={expanded ? "" : undefined}
        data-dragging={dragging ? "" : undefined}
        onEscapeKeyDown={
          dismissible ? undefined : (event) => event.preventDefault()
        }
        onInteractOutside={
          dismissible ? undefined : (event) => event.preventDefault()
        }
        className={cn(
          "bg-background text-foreground fixed z-50 flex border shadow-2xl outline-none",
          PANEL[side],
          "data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out",
          "data-dragging:animate-none motion-reduce:animate-none",
          expanded && "rounded-none",
          className
        )}
        style={
          {
            "--drawer-peek": peek ?? (vertical ? "60svh" : "26rem"),
            // Short of the whole screen on purpose: a sliver of the page left
            // showing is what keeps a drawer from reading as a new page.
            "--drawer-full": full ?? (vertical ? "95svh" : "95vw"),
            "--drawer-closed": CLOSED[side],
            translate: restTranslate(side, expanded),
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          ref={stripRef}
          data-slot="drawer-strip"
          className={cn(
            "relative flex flex-col gap-4 p-6",
            STRIP[side],
            // Expanded, the panel is the strip. Parked, the strip is the part
            // of it that is on screen, and the rest waits off the edge.
            expanded
              ? vertical
                ? "h-full"
                : "w-full"
              : vertical
                ? "h-[var(--drawer-peek)]"
                : "w-[var(--drawer-peek)]",
            showHandle && (vertical ? "pt-7" : "pl-7"),
            showHandle && side === "top" && "pt-6 pb-7",
            showHandle && side === "right" && "pr-6 pl-7",
            showHandle && side === "left" && "pr-7 pl-6"
          )}
        >
          {showHandle ? (
            <div
              aria-hidden="true"
              data-slot="drawer-handle"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                "absolute flex items-center p-3",
                HANDLE_POSITION[side],
                grabbable ? "cursor-grab active:cursor-grabbing" : "cursor-auto"
              )}
              // The notch owns the gesture on its axis, so dragging it never
              // scrolls whatever is behind the drawer as well.
              style={{ touchAction: "none" }}
            >
              <span
                className={cn(
                  "bg-muted-foreground/40 rounded-full",
                  vertical ? "h-1.5 w-12" : "h-12 w-1.5"
                )}
              />
            </div>
          ) : null}

          {children}
        </div>

        {/* The swipe closes the drawer by pressing this, which keeps the panel
            working whether the open state is Radix's or the caller's. */}
        <DialogPrimitive.Close ref={closeRef} className="sr-only" tabIndex={-1}>
          Close
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DrawerPortal>
  )
}

export function DrawerHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

export function DrawerFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2", className)}
      {...props}
    />
  )
}

export function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-lg font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

export function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

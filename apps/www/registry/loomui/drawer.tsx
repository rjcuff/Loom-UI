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
  /** How much of the screen it covers when open. Any CSS length. */
  size?: string
  /** Draw the notch you take hold of. */
  showHandle?: boolean
  /** Allow the swipe, the overlay and `Escape` to close the drawer. */
  dismissible?: boolean
}

/** Off screen, as a share of the panel, which is `size` across. */
const CLOSED: Record<DrawerSide, string> = {
  top: "0 -100%",
  bottom: "0 100%",
  left: "-100% 0",
  right: "100% 0",
}

/**
 * The panel covers most of the screen and, once open, rests against its edge.
 * There is one place to be, so the drag is one number in one direction and the
 * only thing it decides is whether the drawer stays or goes.
 */
const PANEL: Record<DrawerSide, string> = {
  top: "inset-x-0 top-0 h-[var(--drawer-size)] w-full rounded-b-2xl border-b",
  bottom:
    "inset-x-0 bottom-0 h-[var(--drawer-size)] w-full rounded-t-2xl border-t",
  left: "inset-y-0 left-0 h-full w-[var(--drawer-size)] rounded-r-2xl border-r",
  right:
    "inset-y-0 right-0 h-full w-[var(--drawer-size)] rounded-l-2xl border-l",
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
/** Open: the whole panel on screen, against its edge. */
const AT_REST = "0 0"

const isVertical = (side: DrawerSide) => side === "top" || side === "bottom"
/** Which way is out: down and right are positive, up and left are not. */
const outwardSign = (side: DrawerSide) =>
  side === "bottom" || side === "right" ? 1 : -1

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
 * A panel that comes in from one edge and covers most of the screen, standing
 * in for a modal, and leaves when it is thrown back out.
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
  size,
  showHandle = true,
  dismissible = true,
  className,
  children,
  onOpenAutoFocus,
  ...props
}: DrawerContentProps) {
  const vertical = isVertical(side)
  const outward = outwardSign(side)

  const panelRef = React.useRef<HTMLDivElement>(null)
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

  /** How far the panel travels before it is gone, in pixels. */
  const measure = () => {
    const panel = panelRef.current
    if (!panel) return 0
    return vertical ? panel.offsetHeight : panel.offsetWidth
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dismissible) return
    if (held.current !== null) return

    event.currentTarget.setPointerCapture(event.pointerId)
    held.current = event.pointerId

    const node = panelRef.current
    if (node) node.style.transition = ""

    origin.current = vertical ? event.clientY : event.clientX
    offset.current = 0
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

    const size = measure()
    const point = vertical ? event.clientY : event.clientX
    const elapsed = Math.max(event.timeStamp - stamp.current, 1)

    let next = (point - origin.current) * outward
    // Open is as far in as the panel goes, so a pull past it is resisted rather
    // than refused and the panel never looks stuck to the finger.
    if (next < 0) next = next / 6

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

    const flicked = Math.abs(velocity.current) > FLICK
    // One place to land, so the drag decides one thing: gone, or back where it
    // started. A short drag that was not flicked decides nothing, which is the
    // one movement that is not a snap.
    const away = flicked ? velocity.current > 0 : offset.current > DECIDE_PX

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

    setDragging(false)
    glide(SETTLE_MS, AT_REST)
  }

  /**
   * Every open starts against the edge, whatever the last one ended as. The
   * drag writes `translate` onto the node itself, and React only rewrites that
   * property when its own value changes, so a panel left part way out would
   * come back part way out. The resting position is written rather than
   * cleared: clearing removes the value React put there, and React will not put
   * it back until it changes.
   */
  const park = () => {
    setDragging(false)
    held.current = null

    const node = panelRef.current
    if (!node) return
    node.style.transition = ""
    node.style.translate = AT_REST
  }

  return (
    <DrawerPortal>
      <DrawerOverlay
        onClick={dismissible ? undefined : (event) => event.preventDefault()}
      />
      <DialogPrimitive.Content
        ref={panelRef}
        data-slot="drawer-content"
        data-side={side}
        data-dragging={dragging ? "" : undefined}
        // Radix fires this on every open, mounted fresh or not, which makes it
        // the one hook that is guaranteed to run per opening.
        onOpenAutoFocus={(event) => {
          park()
          onOpenAutoFocus?.(event)
        }}
        onEscapeKeyDown={
          dismissible ? undefined : (event) => event.preventDefault()
        }
        onInteractOutside={
          dismissible ? undefined : (event) => event.preventDefault()
        }
        className={cn(
          "bg-background text-foreground fixed z-50 flex flex-col border shadow-2xl outline-none",
          PANEL[side],
          "data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out",
          "data-dragging:animate-none motion-reduce:animate-none",
          className
        )}
        style={
          {
            // Short of the whole screen on purpose. The sliver of page left
            // showing is what keeps the rounded edge on screen, and what keeps
            // a drawer from reading as a new page.
            "--drawer-size": size ?? (vertical ? "90svh" : "26rem"),
            "--drawer-closed": CLOSED[side],
            translate: AT_REST,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          data-slot="drawer-strip"
          className={cn(
            "relative flex h-full w-full flex-col gap-4 overflow-y-auto p-6",
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
                "absolute z-10 flex items-center p-3",
                HANDLE_POSITION[side],
                dismissible
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-auto"
              )}
              // The notch owns the gesture on its axis, so dragging it never
              // scrolls the panel or the page behind it as well.
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

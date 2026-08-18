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

/** Where the contents start from as they settle into the landed panel. */
const RISE: Record<DrawerSide, string> = {
  top: "0 -14px",
  bottom: "0 14px",
  left: "-14px 0",
  right: "14px 0",
}

const HANDLE_POSITION: Record<DrawerSide, string> = {
  top: "inset-x-0 bottom-0 justify-center",
  bottom: "inset-x-0 top-0 justify-center",
  left: "inset-y-0 right-0 flex-col justify-center",
  right: "inset-y-0 left-0 flex-col justify-center",
}

/** Milliseconds. One duration for arriving, settling and leaving. */
const TRANSITION_MS = 500
/** Pixels per millisecond past which a flick closes the drawer on its own. */
const VELOCITY_THRESHOLD = 0.4
/** Share of the panel that has to be dragged away before it closes. */
const CLOSE_THRESHOLD = 0.25
/** After the content is scrolled, this long before a drag can start. */
const SCROLL_LOCK_MS = 100
/** The drag waits this long after opening, so the arrival can be scrolled. */
const OPEN_GUARD_MS = 500
/** Open: the whole panel on screen, against its edge. */
const AT_REST = "0 0"

const isVertical = (side: DrawerSide) => side === "top" || side === "bottom"
/** Which way is out: down and right are positive, up and left are not. */
const outwardSign = (side: DrawerSide) =>
  side === "bottom" || side === "right" ? 1 : -1

/**
 * Resistance past fully open. Logarithmic rather than linear, so the panel
 * gives at first and then firms up, which is what reads as a limit instead of
 * a loose edge.
 */
const dampen = (distance: number) =>
  Math.max(8 * (Math.log(distance + 1) - 2), 0)

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
        "fixed inset-0 z-50 bg-black/45 backdrop-blur-[3px]",
        "data-[state=open]:animate-drawer-overlay-in data-[state=closed]:animate-drawer-overlay-out",
        // While a drag owns the overlay its opacity is written inline, and a
        // keyframe would outrank it.
        "data-dragging:animate-none motion-reduce:animate-none",
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
 * The whole panel is the grip, not just the notch: press anywhere and drag.
 * Content that scrolls keeps its scroll, so the drag only takes over once the
 * content underneath the finger has nothing left to give.
 *
 * The open and close animations are keyframes rather than transitions, since
 * the panel is only in the DOM while it is open and a transition has nothing to
 * start from. The way in does not fill forwards: an animation that holds its
 * last frame outranks inline styles for good, which would leave the drag with
 * nothing to move. The way out does fill, or the panel would snap back to open
 * for the frame before it unmounts. The drag writes `translate` straight onto
 * the node, so it costs no renders and the panel sits exactly under the finger.
 */
export function DrawerContent({
  side = "bottom",
  size,
  showHandle = true,
  dismissible = true,
  className,
  children,
  onOpenAutoFocus,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  ...props
}: DrawerContentProps) {
  const vertical = isVertical(side)
  const outward = outwardSign(side)

  const panelRef = React.useRef<HTMLDivElement>(null)
  const overlayRef = React.useRef<HTMLDivElement>(null)
  const closeRef = React.useRef<HTMLButtonElement>(null)
  const origin = React.useRef(0)
  const offset = React.useRef(0)
  const startedAt = React.useRef(0)
  const openedAt = React.useRef(0)
  const scrolledAt = React.useRef(0)
  // Once a drag is allowed it stays allowed until the finger lifts. Deciding
  // again mid gesture is how a drag ends up handed back to the scroller
  // halfway through.
  const allowed = React.useRef(false)
  // The gesture runs off refs rather than state. State lands a render later,
  // and a click quick enough to land inside that gap used to leave the drag
  // switched on, which handed the panel to every hover that followed.
  const held = React.useRef<number | null>(null)
  const timer = React.useRef(0)
  const [dragging, setDragging] = React.useState(false)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  /** How far the panel travels before it is gone, in pixels. */
  const measure = () => {
    const panel = panelRef.current
    if (!panel) return 0
    return vertical ? panel.offsetHeight : panel.offsetWidth
  }

  const move = (distance: number) => {
    const node = panelRef.current
    const overlay = overlayRef.current
    if (!node) return

    node.style.translate = vertical
      ? `0 ${distance * outward}px`
      : `${distance * outward}px 0`

    // The page brightening as the panel is pulled away is most of what makes
    // the two feel joined rather than stacked.
    if (overlay) {
      const size = measure()
      const gone = size > 0 ? Math.min(Math.max(distance / size, 0), 1) : 0
      overlay.style.transition = "none"
      overlay.style.opacity = `${1 - gone}`
    }
  }

  const glide = (translate: string, opacity: number) => {
    const node = panelRef.current
    const overlay = overlayRef.current
    const ease = `${TRANSITION_MS}ms var(--ease-drawer)`

    if (node) {
      node.style.transition = `translate ${ease}`
      node.style.translate = translate
    }
    if (overlay) {
      overlay.style.transition = `opacity ${ease}`
      overlay.style.opacity = `${opacity}`
    }
  }

  /**
   * Whether this press belongs to the drag or to something inside the panel.
   * Anything the content is still able to scroll wins, since a drawer that
   * closes when a list was meant to move is the worst thing it can do.
   */
  const shouldDrag = (target: EventTarget | null, outwards: boolean) => {
    let node = target as HTMLElement | null
    if (!node) return false

    // An opt out for anything that owns its own gesture: a slider, a map, a
    // carousel.
    if (node.closest("[data-no-drag]")) return false
    if (node.tagName === "SELECT") return false

    // A drawer from the side is not competing with vertical scrolling.
    if (!vertical) return true

    // Already pulled away from the edge, so the gesture is plainly the drag.
    if (offset.current > 0) return true

    const now = Date.now()
    // While the panel is still arriving, the press is for the content.
    if (now - openedAt.current < OPEN_GUARD_MS) return false
    // Selecting text is not dragging.
    if (window.getSelection()?.toString()) return false
    // A flick that just scrolled the content should not roll into a close.
    if (now - scrolledAt.current < SCROLL_LOCK_MS) return false
    // Dragging further in is the content's to scroll, not the panel's to
    // stretch. Overdrag is only reachable once the drag already owns the panel.
    if (!outwards) {
      scrolledAt.current = now
      return false
    }

    while (node) {
      if (node.scrollHeight > node.clientHeight) {
        if (node.scrollTop !== 0) {
          scrolledAt.current = now
          return false
        }
        if (node.getAttribute("role") === "dialog") return true
      }
      node = node.parentElement
    }

    return true
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event)
    if (!dismissible) return
    if (held.current !== null) return

    // Captured on the pressed element rather than the panel, so a button under
    // the finger still receives its click when the press turns out not to be a
    // drag.
    const target = event.target as HTMLElement
    if (target.setPointerCapture) target.setPointerCapture(event.pointerId)
    held.current = event.pointerId
    allowed.current = false

    origin.current = vertical ? event.clientY : event.clientX
    offset.current = 0
    startedAt.current = event.timeStamp
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)
    if (held.current !== event.pointerId) return

    // A mouse that reports no button held is a mouse that let go somewhere this
    // never heard about. Nothing should follow a pointer that is not pressed.
    if (event.pointerType === "mouse" && event.buttons === 0) {
      handlePointerUp(event)
      return
    }

    const point = vertical ? event.clientY : event.clientX
    const travelled = (point - origin.current) * outward

    if (!allowed.current) {
      if (!shouldDrag(event.target, travelled > 0)) return
      allowed.current = true
      setDragging(true)

      const node = panelRef.current
      if (node) node.style.transition = ""
      // The finger has already moved by the time the drag is granted. Taking
      // the origin from here rather than from the press keeps the panel from
      // jumping to catch up.
      origin.current = point
      return
    }

    let next = (point - origin.current) * outward
    if (next < 0) next = -dampen(-next)

    offset.current = Math.min(next, measure())
    move(offset.current)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerUp?.(event)
    if (held.current !== event.pointerId) return
    held.current = null

    const target = event.target as HTMLElement
    if (target.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId)
    }

    if (!allowed.current) return
    allowed.current = false

    const travelled = offset.current
    const elapsed = Math.max(event.timeStamp - startedAt.current, 1)
    const velocity = travelled / elapsed
    const flicked = velocity > VELOCITY_THRESHOLD
    const far = travelled >= measure() * CLOSE_THRESHOLD

    if (dismissible && travelled > 0 && (flicked || far)) {
      // The swipe carries on out and the drawer closes on arrival, rather than
      // snapping back to play an exit it has already been given. `dragging`
      // stays on until then, since it is what keeps the exit keyframes off a
      // panel that is already on its way out.
      glide(CLOSED[side], 0)
      timer.current = window.setTimeout(
        () => closeRef.current?.click(),
        TRANSITION_MS - 20
      )
      return
    }

    setDragging(false)
    glide(AT_REST, 1)
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
    allowed.current = false
    offset.current = 0
    openedAt.current = Date.now()

    const node = panelRef.current
    if (node) {
      node.style.transition = ""
      node.style.translate = AT_REST
    }

    const overlay = overlayRef.current
    if (overlay) {
      overlay.style.transition = ""
      overlay.style.opacity = ""
    }
  }

  return (
    <DrawerPortal>
      <DrawerOverlay
        ref={overlayRef}
        data-dragging={dragging ? "" : undefined}
        onClick={dismissible ? undefined : (event) => event.preventDefault()}
      />
      <DialogPrimitive.Content
        ref={panelRef}
        data-slot="drawer-content"
        data-side={side}
        data-dragging={dragging ? "" : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
          "group bg-background text-foreground fixed z-50 flex flex-col border shadow-2xl outline-none",
          "[touch-action:none] [will-change:translate]",
          PANEL[side],
          "data-[state=open]:animate-drawer-in data-[state=closed]:animate-drawer-out",
          "data-dragging:animate-none data-dragging:select-none motion-reduce:animate-none",
          className
        )}
        style={
          {
            // Short of the whole screen on purpose. The sliver of page left
            // showing is what keeps the rounded edge on screen, and what keeps
            // a drawer from reading as a new page.
            "--drawer-size": size ?? (vertical ? "90svh" : "26rem"),
            "--drawer-closed": CLOSED[side],
            "--drawer-rise": RISE[side],
            translate: AT_REST,
          } as React.CSSProperties
        }
        {...props}
      >
        <div
          data-slot="drawer-strip"
          onScroll={() => {
            scrolledAt.current = Date.now()
          }}
          className={cn(
            "relative flex h-full w-full flex-col gap-4 overflow-y-auto overscroll-contain p-6",
            // Only ever mounted while the drawer is open, so this plays once
            // on arrival and needs no state to drive it.
            "animate-drawer-rise motion-reduce:animate-none",
            // The content keeps the scroll on its own axis. Everything else on
            // the panel belongs to the drag.
            vertical ? "[touch-action:pan-y]" : "[touch-action:pan-x]",
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
              className={cn(
                // 44px of target, whatever the notch itself measures.
                "absolute z-10 flex items-center justify-center p-3",
                vertical ? "min-h-11" : "min-w-11",
                HANDLE_POSITION[side],
                dismissible
                  ? "cursor-grab active:cursor-grabbing"
                  : "cursor-auto"
              )}
            >
              <span
                className={cn(
                  "bg-muted-foreground/40 rounded-full transition-[background-color,width,height] duration-200 ease-out",
                  "group-data-dragging:bg-muted-foreground/70",
                  vertical
                    ? "h-1.5 w-12 group-data-dragging:w-16"
                    : "h-12 w-1.5 group-data-dragging:h-16"
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

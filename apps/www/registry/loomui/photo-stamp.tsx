"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { useSpring, type SpringOptions } from "@/registry/lib/use-spring"

export interface PhotoStampProps extends Omit<
  React.ComponentProps<"figure">,
  "children"
> {
  /** The photo. Ship the full-size file: the open state is its real size. */
  src: string
  /** Describes the photo. It is also the trigger's accessible name. */
  alt: string
  /** Sits under the photo, in both states. */
  caption?: React.ReactNode
  /** Corner radius. Held steady in screen pixels through the lift. */
  radius?: number
  /** How much of the viewport the open photo fills, `0` to `1`. */
  fill?: number
  /** How the photo travels. */
  spring?: SpringOptions
  /** Sizes the photo at rest. The open size is worked out from it. */
  imageClassName?: string
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

interface Geometry {
  /** Where the photo sits on the page. */
  from: Box
  /** Where it is going. */
  to: Box
  /** `from` over `to`. One number, because the two boxes share an aspect. */
  scale: number
}

/** Room kept under the open photo for the caption. */
const CAPTION_ROOM = 44
/** An exit wants to be quicker than the entrance it undoes. */
const EXIT_RATE = 0.8
/** Keys that scroll the page out from under an open photo. */
const SCROLL_KEYS = new Set([
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
])

/**
 * The open box, fitted to the viewport at the aspect the photo already has on
 * the page. Matching the rendered aspect rather than the source file's means
 * the crop never changes on the way up, so one scale covers both axes and
 * nothing has to be un-distorted afterwards.
 */
function fit(from: Box, fill: number, room: number): Box {
  const maxWidth = window.innerWidth * fill
  const maxHeight = window.innerHeight * fill - room
  const aspect = from.width / from.height

  let width = maxWidth
  let height = width / aspect

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspect
  }

  return {
    x: (window.innerWidth - width) / 2,
    y: (window.innerHeight - room - height) / 2,
    width,
    height,
  }
}

function measure(node: HTMLElement): Box {
  const rect = node.getBoundingClientRect()
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const read = () => setReduced(query.matches)
    read()
    query.addEventListener("change", read)
    return () => query.removeEventListener("change", read)
  }, [])

  return reduced
}

/**
 * A photo that lifts off the page at full size over a blurred backdrop.
 *
 * The photo you click and the photo you end up looking at are the same
 * element. It is measured where it sits, drawn at its final size, and put back
 * down onto the page with a transform. Anything else is two photos pretending
 * to be one, and the pretence shows the moment either of them is a frame late.
 */
export function PhotoStamp({
  src,
  alt,
  caption,
  radius = 10,
  fill = 0.72,
  spring = { duration: 0.5, bounce: 0 },
  className,
  imageClassName,
  ...props
}: PhotoStampProps) {
  const [mounted, setMounted] = React.useState(false)
  const [phase, setPhase] = React.useState<"open" | "closed">("closed")
  const reduced = usePrefersReducedMotion()

  const thumb = React.useRef<HTMLImageElement>(null)
  const photo = React.useRef<HTMLImageElement>(null)
  const dialog = React.useRef<HTMLDivElement>(null)
  const closer = React.useRef<HTMLButtonElement>(null)
  const restore = React.useRef<HTMLElement | null>(null)
  const geometry = React.useRef<Geometry | null>(null)
  const closing = React.useRef(false)

  const room = caption ? CAPTION_ROOM : 0

  /**
   * The radius is written per frame rather than transitioned. A scaled box
   * scales its corners with it, so a radius left alone arrives several times
   * too round and shrinks back down over the course of the lift. Dividing by
   * the scale the photo is at right now holds the corner at one size in screen
   * pixels, and leaves the transform as the only thing describing the travel.
   */
  const paint = React.useCallback(
    ({ p }: Record<string, number>) => {
      const node = photo.current
      const geo = geometry.current
      if (!node || !geo) return

      const scale = geo.scale + (1 - geo.scale) * p
      const x = (geo.from.x - geo.to.x) * (1 - p)
      const y = (geo.from.y - geo.to.y) * (1 - p)

      node.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      node.style.borderRadius = `${radius / scale}px`

      if (closing.current && p <= 0.0005) {
        closing.current = false
        geometry.current = null
        setMounted(false)
      }
    },
    [radius]
  )

  // An exit runs quicker than the entrance it undoes. Retargeting the spring's
  // stiffness mid-flight keeps whatever velocity the photo already had, so a
  // close that interrupts an open never stops to start again.
  const travel = React.useMemo<SpringOptions>(
    () =>
      phase === "closed"
        ? { ...spring, duration: (spring.duration ?? 0.5) * EXIT_RATE }
        : spring,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, spring.duration, spring.bounce]
  )

  const { to, set } = useSpring(paint, travel)

  const read = React.useCallback((): Geometry | null => {
    const node = thumb.current
    if (!node) return null

    const from = measure(node)
    const box = fit(from, fill, room)

    return { from, to: box, scale: from.width / box.width }
  }, [fill, room])

  const open = React.useCallback(() => {
    if (mounted) return

    const next = read()
    if (!next) return

    geometry.current = next
    closing.current = false
    restore.current = document.activeElement as HTMLElement | null

    setPhase("open")
    setMounted(true)
  }, [mounted, read])

  const finish = React.useCallback(() => {
    closing.current = false
    geometry.current = null
    setMounted(false)
  }, [])

  const close = React.useCallback(() => {
    if (!mounted || closing.current) return

    // Remeasure the resting photo before aiming at it. That photo is what the
    // page will be showing a moment later, so the landing has to be where it
    // is now rather than where it was when this opened.
    const geo = geometry.current
    const node = thumb.current
    if (geo && node) {
      const from = measure(node)
      geometry.current = { ...geo, from, scale: from.width / geo.to.width }
    }

    closing.current = true
    setPhase("closed")
    // Restoring focus is allowed to move the page by default. On the last
    // frame of a close, the one frame that has to be still, it must not.
    restore.current?.focus?.({ preventScroll: true })

    if (reduced) {
      finish()
      return
    }

    to({ p: 0 })
  }, [finish, mounted, reduced, to])

  // Start on the page, then travel. Written before paint, so there is never a
  // frame with the photo on screen at full size in the wrong place.
  React.useLayoutEffect(() => {
    if (!mounted) return

    if (reduced) {
      set({ p: 1 })
      return
    }

    set({ p: 0 })
    to({ p: 1 })
  }, [mounted, reduced, set, to])

  React.useEffect(() => {
    if (!mounted) return
    dialog.current?.focus({ preventScroll: true })
  }, [mounted])

  /**
   * Hold the page still without taking its scrollbar away.
   *
   * The usual lock sets `overflow: hidden` on the root. That removes the
   * scrollbar, the viewport gets wider by its width, and everything positioned
   * against the viewport moves. It all moves back when the lock is released,
   * which happens on the last frame of the close: the single frame in the whole
   * interaction that has to be perfectly still. The photo lands into a page
   * that is jumping sideways, and the landing reads as a snap.
   *
   * Blocking the gestures instead leaves the layout untouched from the first
   * frame to the last. Nothing is measured, nothing is compensated, nothing
   * moves.
   */
  React.useEffect(() => {
    if (!mounted) return

    const block = (event: Event) => event.preventDefault()

    // React attaches `wheel` and `touchmove` passively at the root, so an
    // `onWheel` prop cannot refuse them. These have to be native listeners.
    window.addEventListener("wheel", block, { passive: false })
    window.addEventListener("touchmove", block, { passive: false })

    return () => {
      window.removeEventListener("wheel", block)
      window.removeEventListener("touchmove", block)
    }
  }, [mounted])

  // A resize moves both ends of the journey. Remeasure and repaint in place.
  React.useEffect(() => {
    if (!mounted) return

    const remeasure = () => {
      const next = read()
      const node = photo.current
      if (!next || !node) return

      geometry.current = next
      node.style.left = `${next.to.x}px`
      node.style.top = `${next.to.y}px`
      node.style.width = `${next.to.width}px`
      node.style.height = `${next.to.height}px`
      set({ p: closing.current ? 0 : 1 })
    }

    window.addEventListener("resize", remeasure)
    return () => window.removeEventListener("resize", remeasure)
  }, [mounted, read, set])

  const geo = geometry.current

  return (
    <>
      <figure
        data-slot="photo-stamp"
        className={cn("flex w-fit flex-col items-center gap-2", className)}
        {...props}
      >
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          data-open={mounted}
          className="focus-visible:outline-ring group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {/* The shadow is the only thing hover changes. Anything that moved
              the photo would change what `getBoundingClientRect` reports, and
              the lift would start from a size the page is not showing. */}
          <img
            ref={thumb}
            src={src}
            alt={alt}
            draggable={false}
            style={{
              borderRadius: `${radius}px`,
              visibility: mounted ? "hidden" : undefined,
            }}
            className={cn(
              "ease-out-quart block h-24 w-32 object-cover shadow-[0_2px_6px_rgb(0_0_0/0.18)] transition-shadow duration-180 select-none group-hover:shadow-[0_4px_14px_rgb(0_0_0/0.24)] motion-reduce:transition-none",
              imageClassName
            )}
          />
        </button>
        {caption ? (
          <figcaption className="text-muted-foreground text-xs">
            {caption}
          </figcaption>
        ) : null}
      </figure>

      {mounted && geo
        ? createPortal(
            <div
              ref={dialog}
              role="dialog"
              aria-modal="true"
              aria-label={alt}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === "Escape") close()
                // One thing to land on, so tabbing anywhere lands on it.
                if (event.key === "Tab") {
                  event.preventDefault()
                  closer.current?.focus()
                }
                if (SCROLL_KEYS.has(event.key)) event.preventDefault()
              }}
              className="fixed inset-0 z-50 outline-none"
            >
              <div
                data-state={phase}
                onClick={close}
                className="bg-background/70 data-[state=closed]:animate-photo-stamp-veil-out data-[state=open]:animate-photo-stamp-veil-in absolute inset-0 backdrop-blur-xl motion-reduce:animate-none"
              />
              <img
                ref={photo}
                src={src}
                alt=""
                draggable={false}
                onClick={close}
                style={{
                  left: `${geo.to.x}px`,
                  top: `${geo.to.y}px`,
                  width: `${geo.to.width}px`,
                  height: `${geo.to.height}px`,
                  borderRadius: `${radius}px`,
                }}
                className="fixed origin-top-left object-cover shadow-[0_2px_6px_rgb(0_0_0/0.18)] will-change-transform select-none"
              />
              {caption ? (
                <figcaption
                  data-state={phase}
                  style={{ top: `${geo.to.y + geo.to.height + 14}px` }}
                  className="text-muted-foreground data-[state=closed]:animate-photo-stamp-veil-out data-[state=open]:animate-photo-stamp-caption-in absolute inset-x-0 text-center text-sm motion-reduce:animate-none"
                >
                  {caption}
                </figcaption>
              ) : null}
              <button
                ref={closer}
                type="button"
                onClick={close}
                aria-label="Close photo"
                data-state={phase}
                className="text-muted-foreground hover:text-foreground ease-out-quart data-[state=closed]:animate-photo-stamp-veil-out data-[state=open]:animate-photo-stamp-veil-in absolute top-5 right-5 flex size-10 items-center justify-center rounded-full transition-colors duration-180 motion-reduce:animate-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-5"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

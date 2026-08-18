"use client"

import * as React from "react"

/**
 * Whether the element is on screen. A looping animation that nobody can see is
 * work the browser does for nothing: CSS animations keep ticking while they are
 * scrolled away, and the compositor keeps the layers alive to do it.
 *
 * Starts `true` so the first paint is never a paused one, on the server or
 * where `IntersectionObserver` is missing.
 */
export function useInViewport<T extends Element>(
  ref: React.RefObject<T | null>,
  /** Grown by this much, so a loop is already running as it scrolls in. */
  margin = "200px"
) {
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: margin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, margin])

  return visible
}

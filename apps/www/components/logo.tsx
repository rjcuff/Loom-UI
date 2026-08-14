import Image from "next/image"

import { cn } from "@/lib/utils"

import logo from "../public/logo.png"

/**
 * The loom mark. Imported as a static asset so Next can emit width, height and
 * a blur placeholder, and so the layout never shifts while it loads.
 */
export function Logo({
  className,
  priority = false,
}: {
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={logo}
      alt=""
      aria-hidden
      priority={priority}
      // The source is ~1300px square. Explicit width/height (rather than
      // `sizes`) keeps the generated srcSet to 1x/2x of the rendered size, so
      // the fallback `src` is a 48px file instead of the full-size original.
      width={48}
      height={48}
      className={cn("size-6 shrink-0 object-contain select-none", className)}
    />
  )
}

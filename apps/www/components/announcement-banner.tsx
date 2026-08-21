import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { announcement } from "@/config/site"

/** In normal flow, not the sticky header, so it rides away on first scroll. */
export function AnnouncementBanner() {
  if (!announcement) return null

  return (
    <Link
      href={announcement.href}
      // Left-aligned while the line wraps; centred once it fits on one.
      className="group flex w-full items-start justify-start gap-1.5 bg-[oklch(0.54_0.14_246)] px-4 py-3.5 text-left text-[13px] leading-snug font-medium text-white sm:items-center sm:justify-center sm:text-center"
    >
      <span aria-hidden className="shrink-0">
        ✨
      </span>
      <span>{announcement.text}</span>
      <ChevronRightIcon className="hidden size-3.5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-0.5 sm:block" />
    </Link>
  )
}

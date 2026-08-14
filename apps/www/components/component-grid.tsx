import Link from "next/link"
import type { NavBadge } from "@/types"

import { getNavBadge } from "@/config/docs"
import { cn } from "@/lib/utils"
import { ui } from "@/registry/registry-ui"

function Badge({ badge }: { badge: NavBadge }) {
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-px text-[10px] leading-4 font-medium",
        badge.variant === "new" && "bg-accent/15 text-accent",
        badge.variant === "pro" && "bg-thread-3/15 text-thread-3"
      )}
    >
      {badge.text}
    </span>
  )
}

interface ComponentLink {
  name: string
  title: string
  href: string
  badge?: NavBadge
}

/**
 * Alphabetical rather than the sidebar's reading order: this page is for
 * finding a component you already have a name for, not for reading through.
 */
function getComponentLinks(): ComponentLink[] {
  return ui
    .map((item) => {
      const href = `/docs/components/${item.name}`

      return {
        name: item.name,
        title: item.title ?? item.name,
        href,
        badge: getNavBadge(href),
      }
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

export function ComponentGrid() {
  const components = getComponentLinks()

  return (
    <ul className="mt-10 grid list-none gap-x-8 gap-y-4 pl-0 sm:grid-cols-2 lg:grid-cols-3">
      {components.map((component) => (
        <li key={component.name} className="mt-0">
          <Link
            href={component.href}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm no-underline transition-colors duration-150"
          >
            {component.title}
            {component.badge ? <Badge badge={component.badge} /> : null}
          </Link>
        </li>
      ))}
    </ul>
  )
}

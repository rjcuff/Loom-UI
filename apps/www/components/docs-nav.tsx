"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { NavBadge } from "@/types"

import { docsConfig } from "@/config/docs"
import { cn } from "@/lib/utils"

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

/**
 * The docs nav list. Rendered directly in the desktop sidebar and inside the
 * disclosure on small screens, so both stay in sync from one config.
 */
export function DocsNav({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-6", className)}>
      {docsConfig.sidebarNav.map((section) => (
        <div key={section.title} className="flex flex-col gap-0.5">
          <h4 className="text-muted-foreground mb-1.5 text-xs">
            {section.title}
          </h4>

          {section.items?.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href ?? "#"}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 py-1.5 text-sm transition-colors duration-150",
                  active
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.title}
                {item.badge ? <Badge badge={item.badge} /> : null}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

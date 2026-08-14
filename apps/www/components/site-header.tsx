import Link from "next/link"

import { docsConfig } from "@/config/docs"
import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { GitHubStars } from "@/components/github-stars"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"

/** The mark itself. Lucide dropped its brand icons, so this is the path. */
function GitHubIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      {/* Full bleed rather than a centered container, so the brand and the
          controls sit near the corners with only a gutter holding them off. */}
      <div className="flex h-14 w-full items-center gap-6 px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Logo priority />
          {siteConfig.name}
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-5 text-sm md:flex">
          {docsConfig.mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href ?? "#"}
              className="hover:text-foreground transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" className="px-2" asChild>
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
              aria-label={`${siteConfig.name} on GitHub`}
            >
              {/* The mark and the count travel together as one group, which
                  the button then centers as a whole. */}
              <span className="flex flex-row items-center gap-2">
                <GitHubIcon />
                <GitHubStars />
              </span>
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"

import { docsConfig } from "@/config/docs"
import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { GitHubStars } from "@/components/github-stars"
import { Logo } from "@/components/logo"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  return (
    <header className="border-border bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
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
          <Button variant="ghost" size="sm" asChild>
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
              GitHub
              <GitHubStars />
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

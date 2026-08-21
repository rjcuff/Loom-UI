import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"

function InstallLine() {
  return (
    <code className="text-muted-foreground font-mono text-sm sm:text-base">
      <span className="text-code-number">npx</span>{" "}
      <span className="text-accent">shadcn@latest</span> add{" "}
      <span className="text-foreground">
        {siteConfig.registry.namespace}/gauge-arc
      </span>
    </code>
  )
}

export function SiteCta() {
  return (
    <section className="border-border/60 border-t">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-start px-5 py-16 text-left sm:items-center sm:py-24 sm:text-center">
        <InstallLine />

        <h2 className="mt-6 text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-balance sm:text-4xl">
          Install as many animated components as you need
        </h2>

        <p className="text-muted-foreground mt-4 text-pretty sm:text-lg">
          Charts, text effects, buttons, backgrounds and device frames. One file
          each, no runtime, and yours the moment they land.
        </p>

        <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <Button asChild size="lg" className="min-w-0">
            <Link href="/docs/installation">Install free</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-0">
            <Link href="/docs/components">
              <span className="sm:hidden">Browse</span>
              <span className="hidden sm:inline">Browse all components</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

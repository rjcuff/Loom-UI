import type { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { InstallCommand } from "@/components/install-command"
import { GridBeams } from "@/registry/loomui/grid-beams"
import { WeaveText } from "@/registry/loomui/weave-text"

// The home page is the one place the tab shows the bare brand name.
export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <section className="relative overflow-hidden">
      {/* The same woven grid as before, now with beams running down it. The
          site's own hero is the best argument for a component. */}
      <GridBeams className="-z-10" lineOpacity={0.035} />

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pt-24 pb-20 text-center sm:pt-40 sm:pb-28">
        <span className="animate-rise border-border bg-surface/60 text-muted-foreground rounded-full border px-3 py-1 text-xs backdrop-blur">
          Free and open source
        </span>

        <h1 className="animate-rise mt-6 text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance [animation-delay:60ms] sm:text-6xl">
          Interfaces that <WeaveText>move</WeaveText> without getting in the
          way.
        </h1>

        <p className="animate-rise text-muted-foreground mt-5 max-w-xl text-base text-pretty [animation-delay:120ms] sm:mt-6 sm:text-lg">
          {siteConfig.description}
        </p>

        <div className="animate-rise mt-8 flex w-full flex-col items-center gap-3 [animation-delay:180ms] sm:mt-9 sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/docs/installation">Get started</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link href="/docs/components">Browse components</Link>
          </Button>
        </div>

        <InstallCommand
          command={`npx shadcn@latest add ${siteConfig.registry.namespace}/weave-text`}
          className="animate-rise mt-8 max-w-full [animation-delay:240ms]"
        />
      </div>
    </section>
  )
}

import type { Metadata } from "next"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { Showcase } from "@/components/showcase"
import { SiteCta } from "@/components/site-cta"
import { SiteFaq } from "@/components/site-faq"
import { JsonLd, siteSchema } from "@/components/structured-data"
import { LightCurtain } from "@/registry/loomui/light-curtain"
import { WeaveText } from "@/registry/loomui/weave-text"

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground font-medium">{children}</span>
}

export const metadata: Metadata = {
  title: siteConfig.seoTitle,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seoTitle,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seoTitle,
    description: siteConfig.description,
    creator: "@ryancuff_",
    images: [siteConfig.ogImage],
  },
}

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <JsonLd schema={siteSchema()} />

        <LightCurtain className="-z-10" intensity={0.3} reach="58%" blur={80} />

        <div className="mx-auto flex w-full max-w-3xl flex-col items-start px-5 pt-22 pb-14 text-left sm:items-center sm:pt-34 sm:pb-16 sm:text-center">
          <span className="animate-rise border-border bg-background/90 text-muted-foreground rounded-full border px-3 py-1 text-xs backdrop-blur-sm">
            <span aria-hidden>🎉</span> Free and open source
          </span>

          <h1 className="animate-rise mt-6 text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance [animation-delay:60ms] sm:text-6xl">
            A React Design System for Every Interface
          </h1>

          <p className="animate-rise text-muted-foreground mt-5 max-w-xl text-base text-pretty [animation-delay:120ms] sm:mt-6 sm:text-lg">
            A design system of animated <Mark>React</Mark> components in{" "}
            <Mark>TypeScript</Mark> and <Mark>Tailwind CSS</Mark>, copied into
            your project one file at a time. No runtime, no package to keep up
            with, and made to sit beside <Mark>shadcn/ui</Mark>.
          </p>

          <div className="animate-rise mt-8 grid w-full grid-cols-2 gap-3 [animation-delay:180ms] sm:mt-9 sm:flex sm:w-auto">
            <Button asChild size="lg" className="min-w-0">
              <Link href="/docs/installation">Get started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-w-0">
              <Link href="/docs/components">
                <span className="sm:hidden">Browse</span>
                <span className="hidden sm:inline">Browse components</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Showcase />

      <SiteCta />

      <SiteFaq />
    </>
  )
}
